# from constants import EMBEDDING_MODEL_NAME
# from llama_index.node_parser import SemanticSplitterNodeParser
# from llama_index.embeddings import HuggingFaceEmbedding
#
# # from langchain.embeddings import HuggingFaceInstructEmbeddings
# # from llama_index.embeddings import OpenAIEmbedding
# # embedding = get_embeddings_model()
# # embed_model = OpenAIEmbedding()
#
# embed_model = HuggingFaceEmbedding(
#     model_name=EMBEDDING_MODEL_NAME,
#     # model_kwargs={"device": "cuda"},
# )
# pdf_splitter = SemanticSplitterNodeParser(
#     buffer_size=1, breakpoint_percentile_threshold=95, embed_model=embed_model
# )

from langchain_experimental.text_splitter import SemanticChunker
from chain import get_embeddings_model


def get_pdf_splitter():
    embedding = get_embeddings_model()
    text_splitter = SemanticChunker(embedding)
    return text_splitter
