from bs4 import BeautifulSoup  # , SoupStrainer
import re
from langchain.text_splitter import (
    CharacterTextSplitter,
    Language,
    RecursiveCharacterTextSplitter,
    # TextSplitter,
)
from collections import defaultdict
from langchain.docstore.document import Document
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import os
import logging

from constants import (
    DOCUMENT_MAP,
    INGEST_THREADS,
    SPLITTER_CHUNK_OVERLAP,
    SPLITTER_CHUNK_SIZE,
)


# from parser import langchain_docs_extractor
# from langchain.document_loaders import RecursiveUrlLoader, SitemapLoader
# from langchain.utils.html import PREFIXES_TO_IGNORE_REGEX, SUFFIXES_TO_IGNORE_REGEX


def file_log(logentry):
    file1 = open("file_ingest.log", "a")
    file1.write(logentry + "\n")
    file1.close()
    print(logentry + "\n")


def load_single_document(file_path: str) -> Document | None:
    # Loads a single document from a file path
    try:
        file_extension = os.path.splitext(file_path)[1]
        loader_class = DOCUMENT_MAP.get(file_extension)
        if loader_class:
            file_log(file_path + " loaded.")
            loader = loader_class(file_path)
        else:
            file_log(file_path + " document type is undefined.")
            raise ValueError("Document type is undefined")
        return loader.load()[0]
    except Exception as ex:
        file_log("%s loading error: \n%s" % (file_path, ex))
        return None


def load_document_batch(filepaths):
    logging.info("Loading document batch")
    # create a thread pool
    with ThreadPoolExecutor(len(filepaths)) as exe:
        # load files
        futures = [exe.submit(load_single_document, name)
                   for name in filepaths]
        # collect data
        if futures is None:
            file_log("Some files failed to submit")
            return None
        else:
            data_list = [future.result() for future in futures]
            # return data and file paths
            return (data_list, filepaths)


def load_documents(source_dir: str) -> list[Document]:
    # Loads all documents from the source documents directory,
    # including nested folders

    paths = []
    for root, _, files in os.walk(source_dir):
        for file_name in files:
            file_extension = os.path.splitext(file_name)[1]
            source_file_path = os.path.join(root, file_name)
            if file_extension in DOCUMENT_MAP.keys():
                paths.append(source_file_path)
                print("Importing: " + file_name)

    # Have at least one worker and at most INGEST_THREADS workers
    n_workers = min(INGEST_THREADS, max(len(paths), 1))
    chunksize = round(len(paths) / n_workers) or 1
    docs = []

    with ProcessPoolExecutor(n_workers) as executor:
        futures = []
        # split the load operations into chunks
        for i in range(0, len(paths), chunksize):
            # select a chunk of filenames
            filepaths = paths[i: (i + chunksize)]
            # submit the task
            try:
                future = executor.submit(load_document_batch, filepaths)
            except Exception as ex:
                file_log("executor task failed: %s" % (ex))
                future = None
            if future is not None:
                futures.append(future)
        # process all results
        for future in as_completed(futures):
            # open the file and load the data
            try:
                contents, _ = future.result()
                docs.extend(contents)
            except Exception as ex:
                file_log("Exception: %s" % (ex))

    return docs


# We use small chunk sizes because
# ... By default, input text longer than 256 word pieces is truncated.
# https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
# https://github.com/weaviate/t2v-gpt4all-models?tab=readme-ov-file

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=SPLITTER_CHUNK_SIZE, chunk_overlap=SPLITTER_CHUNK_OVERLAP
)
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=SPLITTER_CHUNK_SIZE,
    chunk_overlap=SPLITTER_CHUNK_OVERLAP,
)
ts_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.TS,
    chunk_size=SPLITTER_CHUNK_SIZE,
    chunk_overlap=SPLITTER_CHUNK_OVERLAP,
)
js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS,
    chunk_size=SPLITTER_CHUNK_SIZE,
    chunk_overlap=SPLITTER_CHUNK_OVERLAP,
)


extension_handlers = {
    ".md": text_splitter,
    ".txt": text_splitter,
    ".py": python_splitter,
    ".ts": ts_splitter,
    ".tsx": ts_splitter,
    ".js": js_splitter,
    ".jsx": js_splitter,
}


def split_documents(documents: list[Document], tokenizer=None) -> list[Document]:
    # Splits documents for correct Text Splitter

    docs = defaultdict(list)
    if tokenizer:
        huggingface_token_splitter = CharacterTextSplitter.from_huggingface_tokenizer(
            tokenizer
        )
        extension_handlers["tokenized"] = huggingface_token_splitter

    for doc in documents:
        if doc is not None:
            file_extension = os.path.splitext(doc.metadata["source"])[1]
            if file_extension not in extension_handlers:
                file_extension = ".txt"

            if tokenizer:
                file_extension = "tokenized"

            docs[file_extension].append(doc)

    texts = []
    for ext, ext_docs in docs.items():
        splitter = extension_handlers[ext]
        texts.extend(splitter.split_documents(ext_docs))

    return texts


def metadata_extractor(meta: dict, soup: BeautifulSoup) -> dict:
    title = soup.find("title")
    description = soup.find("meta", attrs={"name": "description"})
    html = soup.find("html")
    return {
        "source": meta["loc"],
        "title": title.get_text() if title else "",
        "description": description.get("content", "") if description else "",
        "language": html.get("lang", "") if html else "",
        **meta,
    }


def simple_extractor(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    return re.sub(r"\n\n+", "\n\n", soup.text).strip()


# def load_langchain_docs():
#     return SitemapLoader(
#         "https://python.langchain.com/sitemap.xml",
#         filter_urls=["https://python.langchain.com/"],
#         parsing_function=langchain_docs_extractor,
#         default_parser="lxml",
#         bs_kwargs={
#             "parse_only": SoupStrainer(
#                 name=("article", "title", "html", "lang", "content")
#             ),
#         },
#         meta_function=metadata_extractor,
#     ).load()
#
#
# def load_langsmith_docs():
#     return RecursiveUrlLoader(
#         url="https://docs.smith.langchain.com/",
#         max_depth=8,
#         extractor=simple_extractor,
#         prevent_outside=True,
#         use_async=True,
#         timeout=600,
#         # Drop trailing / to avoid duplicate pages.
#         link_regex=(
#             f"href=[\"']{PREFIXES_TO_IGNORE_REGEX}((?:{SUFFIXES_TO_IGNORE_REGEX}.)*?)"
#             r"(?:[\#'\"]|\/[\#'\"])"
#         ),
#         check_response_status=True,
#     ).load()
#
#
# def load_api_docs():
#     return RecursiveUrlLoader(
#         url="https://api.python.langchain.com/en/latest/",
#         max_depth=8,
#         extractor=simple_extractor,
#         prevent_outside=True,
#         use_async=True,
#         timeout=600,
#         # Drop trailing / to avoid duplicate pages.
#         link_regex=(
#             f"href=[\"']{PREFIXES_TO_IGNORE_REGEX}((?:{SUFFIXES_TO_IGNORE_REGEX}.)*?)"
#             r"(?:[\#'\"]|\/[\#'\"])"
#         ),
#         check_response_status=True,
#         exclude_dirs=(
#             "https://api.python.langchain.com/en/latest/_sources",
#             "https://api.python.langchain.com/en/latest/_modules",
#         ),
#     ).load()
