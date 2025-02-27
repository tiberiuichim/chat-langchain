"""Load html from files, clean up, split, ingest into Weaviate."""

import json
import logging
import os
import uuid
from copy import deepcopy

import weaviate
from langchain.indexes import SQLRecordManager
from langchain.storage import LocalFileStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores.weaviate import Weaviate
from langchain_experimental.text_splitter import SemanticChunker

from _index import Cleanup, index
from chain import get_embeddings_model
from constants import (
    DOCUMENTS_DIR,
    RECORD_MANAGER_DB_URL,
    WEAVIATE_API_KEY,
    WEAVIATE_DOCS_INDEX_NAME,
    WEAVIATE_URL,
    LOCAL_FILE_STORE,
)

from utils import load_documents  # , split_documents, split_documents_tiktoken

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# chunk_size: int = 400
# chunk_overlap: int = 0
# child_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
#     chunk_size=chunk_size, chunk_overlap=chunk_overlap
# )
#
# retriever = ParentDocumentRetriever(
#     vectorstore=vectorstore,
#     docstore=store,
#     child_splitter=child_splitter,
# )
# retriever.add_documents(docs, ids=None)


def derive_documents(docs):
    # inspired ParentDocumentRetriever.add_documents

    parent_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=10000, chunk_overlap=0
    )
    child_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=400, chunk_overlap=0
    )
    id_key = "doc_id"
    documents = parent_splitter.split_documents(docs)
    doc_ids = [str(uuid.uuid4()) for _ in documents]

    docs_to_index = []
    docs_to_store = []
    for i, doc in enumerate(documents):
        # print("Process", doc)
        _id = doc_ids[i]
        sub_docs = child_splitter.split_documents([doc])
        for _doc in sub_docs:
            _doc.metadata = deepcopy(doc.metadata)
            _doc.metadata[id_key] = _id
        docs_to_index.extend(sub_docs)
        docs_to_store.append((_id, doc))

    # docs will be indexed in the vector database, as they're short
    # full_docs will be indexed in the document store, as they're the source
    # to be retrieved with the ParentDocumentRetriever
    return docs_to_index, docs_to_store


def ingest_docs(documents, cleanup: Cleanup = "full"):
    for doc in documents:
        if "source" not in doc.metadata:
            doc.metadata["source"] = ""
        if "title" not in doc.metadata:
            doc.metadata["title"] = doc.metadata["source"]
        if "file_path" not in doc.metadata:
            doc.metadata["file_path"] = doc.metadata["source"]

    embedding = get_embeddings_model()
    # SemanticChunker(embedding)

    docs_to_index, docs_to_store = derive_documents(documents)

    # TODO: take care of dedupe in file_store
    file_store = LocalFileStore(LOCAL_FILE_STORE)
    file_store.mset(
        (docid, json.dumps(doc.to_json()).encode("utf-8"))
        for (docid, doc) in docs_to_store
    )

    client = weaviate.Client(
        url=WEAVIATE_URL,
        auth_client_secret=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY),
    )
    vectorstore = Weaviate(
        client=client,
        index_name=WEAVIATE_DOCS_INDEX_NAME,
        text_key="text",
        embedding=embedding,
        by_text=False,
        attributes=["source", "title"],
    )

    record_manager = SQLRecordManager(
        f"weaviate/{WEAVIATE_DOCS_INDEX_NAME}", db_url=RECORD_MANAGER_DB_URL
    )
    record_manager.create_schema()
    force_update = (os.environ.get("FORCE_UPDATE") or "false").lower() == "true"

    indexing_stats = index(
        docs_to_index,
        record_manager,
        vectorstore,
        cleanup=cleanup,
        source_id_key="source",
        force_update=force_update,
    )

    logger.info(f"Indexing stats: {indexing_stats}")
    num_vecs = client.query.aggregate(WEAVIATE_DOCS_INDEX_NAME).with_meta_count().do()
    logger.info(
        f"LangChain now has this many vectors: {num_vecs}",
    )


if __name__ == "__main__":
    documents = load_documents(DOCUMENTS_DIR)
    logger.info(f"Loaded {len(documents)} from {DOCUMENTS_DIR}")
    ingest_docs(documents)

# docs_transformed = split_documents(documents, tokenizer=None)
#    docs_transformed = split_documents_tiktoken(documents)

# We try to return 'source' and 'title' metadata when querying vector store and
# Weaviate will error at query time if one of the attributes is missing from a
# retrieved document.
# fallback_total_pages = len(docs_transformed)

# if "page" not in doc.metadata:
#     doc.metadata["page"] = idx + 1
# title = doc.metadata["title"]
# page = doc.metadata.get("page", 0)
# total_pages = doc.metadata.get("total_pages", fallback_total_pages)
# doc.metadata["title"] = f"{title} - page {page}/{total_pages}"
