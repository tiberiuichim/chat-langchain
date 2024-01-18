"""Main entrypoint for the app."""

import string
import secrets
import os
import shutil
import logging

from fastapi import FastAPI, UploadFile, Request  # File,
from starlette.datastructures import UploadFile as StarletteUploadFile
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes

from chain import ChatRequest, answer_chain
from constants import DOCUMENTS_DIR

logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


add_routes(
    app, answer_chain, path="/chat", input_type=ChatRequest, config_keys=["metadata"]
)


def get_random_filename(filename: str) -> str:
    file_ext = filename.split(".")[-1]
    random_name = "".join(
        secrets.choice(string.ascii_letters + string.digits) for _ in range(20)
    )
    return f"{random_name}.{file_ext}"


@app.post("/files/")
async def create_file(request: Request):
    formdata = await request.form()

    files = []
    filepaths = []

    for value in formdata.values():
        if not (
            isinstance(value, UploadFile) or isinstance(
                value, StarletteUploadFile)
        ):
            continue
        filename = get_random_filename(value.filename or "")
        filepath = os.path.join(DOCUMENTS_DIR, filename)
        filepaths.append(filepath)
        files.append(filename)

        with open(filepath, "wb") as f:
            shutil.copyfileobj(value.file, f)
            logger.info("Saved %s", filepath)

    return {"filenames": files}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
