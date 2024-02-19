from operator import itemgetter
from typing import Dict, List, Optional, Sequence

import weaviate
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.load import loads
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder, PromptTemplate
from langchain.schema import Document
from langchain.schema.embeddings import Embeddings
from langchain.schema.language_model import BaseLanguageModel
from langchain.schema.messages import AIMessage, HumanMessage
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.retriever import BaseRetriever
from langchain.schema.runnable import (
    Runnable,
    RunnableBranch,
    RunnableLambda,
    RunnableMap,
)
from langchain.storage import LocalFileStore
from langchain.vectorstores.weaviate import Weaviate
from langchain_openai import ChatOpenAI
from langchain_together.embeddings import TogetherEmbeddings
from pydantic.v1 import BaseModel

from constants import (
    EMBEDDING_MODEL_NAME,
    LOCAL_FILE_STORE,
    OPENAI_API_BASE,
    OPENAI_API_KEY,
    OPENAI_LLM_MODEL,
    REPHRASE_TEMPLATE,
    RESPONSE_TEMPLATE,
    RETRIEVER_K,
    WEAVIATE_API_KEY,
    WEAVIATE_DOCS_INDEX_NAME,
    WEAVIATE_URL,
)

# from langchain_openai import OpenAIEmbeddings
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_community.chat_models import ChatOpenAI
# from langchain_community.embeddings import HuggingFaceInstructEmbeddings

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[Dict[str, str]]]


def get_embeddings_model() -> Embeddings:
    # embeddings = HuggingFaceInstructEmbeddings(
    #     model_name=EMBEDDING_MODEL_NAME,
    #     model_kwargs={"device": "cuda"},
    # )

    # __import__("pdb").set_trace()
    # embeddings = OpenAIEmbeddings(
    #     openai_api_base=OPENAI_API_BASE,
    #     openai_api_key=OPENAI_API_KEY,
    #     model=EMBEDDING_MODEL_NAME,
    # )
    embeddings = TogetherEmbeddings(
        model=EMBEDDING_MODEL_NAME, together_api_key=OPENAI_API_KEY
    )
    return embeddings


def get_retriever() -> BaseRetriever:
    weaviate_client = weaviate.Client(
        url=WEAVIATE_URL,
        auth_client_secret=weaviate.AuthApiKey(api_key=WEAVIATE_API_KEY),
    )
    weaviate_client = Weaviate(
        client=weaviate_client,
        index_name=WEAVIATE_DOCS_INDEX_NAME,
        text_key="text",
        embedding=get_embeddings_model(),
        by_text=False,
        attributes=["source", "title", "doc_id"],
    )

    return weaviate_client.as_retriever(search_kwargs=dict(k=RETRIEVER_K))


file_store = LocalFileStore(LOCAL_FILE_STORE)


def retrieve_parent_doc(docs):
    # __import__("pdb").set_trace()
    big_doc_uids = []
    for doc in docs:
        big_doc_uids.append(doc.metadata["doc_id"])
    out = file_store.mget(big_doc_uids)

    outdocs = []
    for dump in out:
        enc = dump.decode("utf-8")
        serdoc = loads(enc)
        outdocs.append(serdoc)

    return outdocs


def create_retriever_chain(
    llm: BaseLanguageModel, retriever: BaseRetriever
) -> Runnable:
    CONDENSE_QUESTION_PROMPT = PromptTemplate.from_template(REPHRASE_TEMPLATE)
    condense_question_chain = (
        CONDENSE_QUESTION_PROMPT | llm | StrOutputParser()
    ).with_config(
        run_name="CondenseQuestion",
    )
    conversation_chain = condense_question_chain | retriever
    retrieval_chain_with_no_history = (
        RunnableLambda(itemgetter("question")).with_config(
            run_name="Itemgetter:question"
        )
        | retriever
        | RunnableLambda(retrieve_parent_doc)
    ).with_config(run_name="RetrievalChainWithNoHistory")
    retrieval_chain_with_history = (
        RunnableLambda(lambda x: bool(x.get("chat_history"))).with_config(
            run_name="HasChatHistoryCheck"
        ),
        conversation_chain.with_config(run_name="RetrievalChainWithHistory"),
    )

    return RunnableBranch(
        retrieval_chain_with_history,
        retrieval_chain_with_no_history,
    ).with_config(run_name="RouteDependingOnChatHistory")


def format_docs(docs: Sequence[Document]) -> str:
    formatted_docs = []
    for i, doc in enumerate(docs):
        doc_string = f"<doc id='{i + 1}'>{doc.page_content}</doc>"
        formatted_docs.append(doc_string)
    return "\n".join(formatted_docs)


def serialize_history(request: ChatRequest):
    chat_history = request["chat_history"] or []
    converted_chat_history = []

    for message in chat_history:
        if message.get("human") is not None:
            converted_chat_history.append(HumanMessage(content=message["human"]))
        if message.get("ai") is not None:
            converted_chat_history.append(AIMessage(content=message["ai"]))

    return converted_chat_history


def create_chain(
    llm: BaseLanguageModel,
    retriever: BaseRetriever,
) -> Runnable:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", RESPONSE_TEMPLATE),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}"),
        ]
    )

    retriever_chain = create_retriever_chain(
        llm,
        retriever,
    ).with_config(run_name="FindDocs")

    llm_response_synthesizer = (prompt | llm | StrOutputParser()).with_config(
        run_name="GenerateResponse",
    )

    insert_context = RunnableMap(
        {
            "context": retriever_chain | format_docs,
            "question": itemgetter("question"),
            "chat_history": itemgetter("chat_history"),
        }
    ).with_config(run_name="RetrieveDocs")

    get_question = itemgetter("question")

    chain = (
        {
            "question": RunnableLambda(get_question).with_config(
                run_name="Itemgetter:question"
            ),
            "chat_history": RunnableLambda(serialize_history).with_config(
                run_name="SerializeHistory"
            ),
        }
        | insert_context
        | llm_response_synthesizer
    )

    return chain


llm = ChatOpenAI(
    model=OPENAI_LLM_MODEL,
    streaming=True,
    temperature=0,
    openai_api_base=OPENAI_API_BASE,
    openai_api_key=OPENAI_API_KEY,
    max_tokens=512,
)
retriever = get_retriever()
answer_chain = create_chain(
    llm,
    retriever,
)
