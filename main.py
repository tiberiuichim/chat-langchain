"""Main entrypoint for the app."""

import logging
import os
import secrets
import shutil
import string
from contextlib import asynccontextmanager

import transaction
import ZODB
from fastapi import FastAPI, Request, UploadFile  # File,
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from sse_starlette.sse import EventSourceResponse
from starlette.datastructures import UploadFile as StarletteUploadFile
from ZODB.FileStorage import FileStorage

from chain import ChatRequest, answer_chain
from constants import DOCUMENTS_DIR
from data import App
from ingest import ingest_docs
from utils import load_documents_from_paths

# from pydantic import BaseModel
# from typing import List

logger = logging.getLogger(__name__)

STREAM_DELAY = 1  # second
RETRY_TIMEOUT = 15000  # milisecond

dbpath = os.environ.get("DB_PATH", "data.fs")

_local = {}


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    storage = FileStorage(dbpath)
    db = ZODB.DB(storage)
    connection = db.open()
    root = connection.root

    dbapp = getattr(root, "app", None)

    if dbapp is None:
        dbapp = App()
        root.app = dbapp
        root.app._p_changed = True
        root._p_changed = True
        transaction.commit()

    _local["dbapp"] = dbapp

    yield

    db.close()


app = FastAPI(lifespan=app_lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


add_routes(
    app,
    answer_chain,
    path="/chat",
    input_type=ChatRequest,
    config_keys=["metadata"],
)


def get_random_filename(filename: str) -> str:
    file_ext = filename.split(".")[-1]
    random_name = "".join(
        secrets.choice(string.ascii_letters + string.digits) for _ in range(20)
    )
    return f"{random_name}.{file_ext}"


# class Settings(BaseModel):
#     titleText: str
#     placeholder: str
#     presetQuestions: List[str]


def serialize_settings(s):
    res = {
        "titleText": s.titleText or "",
        "placeholder": s.placeholder or "",
        "presetQuestions": list(s.presetQuestions) or [],
        "frontmatter": getattr(s, "frontmatter", ""),
        "show_activities_dropdown": getattr(s, "show_activities_dropdown", False),
    }
    return res


@app.get("/settings")
def get_env():
    return serialize_settings(_local["dbapp"].settings)


@app.post("/settings")
async def post_env(request: Request):
    data = await request.json()
    s = _local["dbapp"].settings

    for k, v in data.items():
        setattr(s, k, v)

    s._p_changed = True
    transaction.commit()

    return serialize_settings(s)


@app.post("/files/")
async def create_file(request: Request):
    formdata = await request.form()

    files = []
    filepaths = []

    for value in formdata.values():
        if not (
            isinstance(value, UploadFile) or isinstance(value, StarletteUploadFile)
        ):
            logger.warn("Not valid file", value)
            continue
        filename = get_random_filename(value.filename or "")
        filepath = os.path.join(DOCUMENTS_DIR, filename)

        filepaths.append(filepath)
        files.append(filename)

        with open(filepath, "wb") as f:
            shutil.copyfileobj(value.file, f)
            logger.info("Saved %s", filepath)

    async def event_generator(filepaths):
        yield {
            "event": "log",
            "id": "start",
            "retry": RETRY_TIMEOUT,
            "data": f"Loaded files: {files}",
        }

        logger.info("Saved filepaths %s", filepaths)

        # If client closes connection, stop sending events
        # if await request.is_disconnected():
        #     raise StopIteration

        yield {
            "event": "log",
            "id": "log_msg_1",
            "retry": RETRY_TIMEOUT,
            "data": "Loading messages",
        }

        documents = load_documents_from_paths(filepaths)
        logger.info("Loaded documents %s", len(documents))
        yield {
            "event": "log",
            "id": "log_msg_2",
            "retry": RETRY_TIMEOUT,
            "data": "Loaded documents, now indexing",
        }
        ingest_docs(documents, cleanup="incremental")

        logger.info("Indexing complete")
        yield {
            "event": "log",
            "id": "finish",
            "retry": RETRY_TIMEOUT,
            "data": "Indexing complete",
        }

    return EventSourceResponse(
        event_generator(filepaths), media_type="text/event-stream"
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
