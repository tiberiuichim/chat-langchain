"""Load html from files, clean up, split, ingest into Weaviate."""

import logging
import os
import weaviate
from langchain.indexes import SQLRecordManager
from langchain.vectorstores.weaviate import Weaviate

from _index import index
from utils import load_documents, split_documents
from chain import get_embeddings_model
from constants import (
    WEAVIATE_DOCS_INDEX_NAME,
    WEAVIATE_API_KEY,
    WEAVIATE_URL,
    RECORD_MANAGER_DB_URL,
    DOCUMENTS_DIR,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def ingest_docs(documents):
    logger.info(f"Loaded {len(documents)} from {DOCUMENTS_DIR}")
    docs_transformed = split_documents(documents, tokenizer=None)

    # We try to return 'source' and 'title' metadata when querying vector store and
    # Weaviate will error at query time if one of the attributes is missing from a
    # retrieved document.
    for doc in docs_transformed:
        # __import__("pdb").set_trace()
        if "source" not in doc.metadata:
            doc.metadata["source"] = ""
        if "title" not in doc.metadata:
            doc.metadata["title"] = doc.metadata["source"]

        title = doc.metadata["title"]
        page = doc.metadata.get("page", 0)
        total_pages = doc.metadata.get("total_pages", 0)
        doc.metadata["title"] = f"{title} - page {page}/{total_pages}"

    client = weaviate.Client(
        url=WEAVIATE_URL,
        auth_client_secret=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY),
    )
    embedding = get_embeddings_model()
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

    indexing_stats = index(
        docs_transformed,
        record_manager,
        vectorstore,
        cleanup="full",
        source_id_key="source",
        force_update=(os.environ.get("FORCE_UPDATE")
                      or "false").lower() == "true",
    )

    logger.info(f"Indexing stats: {indexing_stats}")
    num_vecs = client.query.aggregate(
        WEAVIATE_DOCS_INDEX_NAME).with_meta_count().do()
    logger.info(
        f"LangChain now has this many vectors: {num_vecs}",
    )


if __name__ == "__main__":
    documents = load_documents(DOCUMENTS_DIR)
    ingest_docs(documents)
