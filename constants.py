# from unstructured.cleaners.core import clean_extra_whitespace
from langchain_community.document_loaders import (
    CSVLoader,
    TextLoader,
    UnstructuredExcelLoader,
    Docx2txtLoader,
    UnstructuredFileLoader,
    UnstructuredMarkdownLoader,
    PDFMinerLoader,
)

import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL_NAME = os.environ["EMBEDDING_MODEL_NAME"]
WEAVIATE_DOCS_INDEX_NAME = os.environ["WEAVIATE_DOCS_INDEX_NAME"]
WEAVIATE_URL = os.environ["WEAVIATE_URL"]
WEAVIATE_API_KEY = os.environ["WEAVIATE_API_KEY"]
RECORD_MANAGER_DB_URL = os.environ["RECORD_MANAGER_DB_URL"]
DOCUMENTS_DIR = os.environ["DOCUMENTS_DIR"]

SPLITTER_CHUNK_SIZE = int(os.environ["SPLITTER_CHUNK_SIZE"])
SPLITTER_CHUNK_OVERLAP = int(os.environ["SPLITTER_CHUNK_OVERLAP"])
RETRIEVER_K = int(os.environ["RETRIEVER_K"])

with open(os.environ["RESPONSE_TEMPLATE"]) as f:
    RESPONSE_TEMPLATE = f.read()

with open(os.environ["REPHRASE_TEMPLATE"]) as f:
    REPHRASE_TEMPLATE = f.read()

# Can be changed to a specific number
INGEST_THREADS = int(os.environ.get("INGEST_THREADS") or os.cpu_count() or 8)

# https://python.langchain.com/en/latest/_modules/langchain/document_loaders/excel.html#UnstructuredExcelLoader
DOCUMENT_MAP = {
    ".txt": (TextLoader, [], {}),
    ".md": (UnstructuredMarkdownLoader, [], {}),
    ".py": (TextLoader, [], {}),
    ".pdf": (PDFMinerLoader, [], {}),
    # ".pdf": (
    #     UnstructuredFileLoader,
    #     [],
    #     {"mode": "elements", "post_processors": [clean_extra_whitespace]},
    # ),
    ".csv": (CSVLoader, [], {}),
    ".xls": (UnstructuredExcelLoader, [], {}),
    ".xlsx": (UnstructuredExcelLoader, [], {}),
    ".docx": (Docx2txtLoader, [], {}),
    ".doc": (Docx2txtLoader, [], {}),
    # code loaders
    ".js": (UnstructuredFileLoader, [], {}),
    ".jsx": (UnstructuredFileLoader, [], {}),
    ".ts": (UnstructuredFileLoader, [], {}),
    ".tsx": (UnstructuredFileLoader, [], {}),
}
