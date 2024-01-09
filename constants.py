import os
from dotenv import load_dotenv

load_dotenv()

EMBEDDING_MODEL_NAME = os.environ["EMBEDDING_MODEL_NAME"]
WEAVIATE_DOCS_INDEX_NAME = os.environ["WEAVIATE_DOCS_INDEX_NAME"]
WEAVIATE_URL = os.environ["WEAVIATE_URL"]
WEAVIATE_API_KEY = os.environ["WEAVIATE_API_KEY"]
RECORD_MANAGER_DB_URL = os.environ["RECORD_MANAGER_DB_URL"]

with open(os.environ["RESPONSE_TEMPLATE"]) as f:
    RESPONSE_TEMPLATE = f.read()

with open(os.environ["REPHRASE_TEMPLATE"]) as f:
    REPHRASE_TEMPLATE = f.read()
