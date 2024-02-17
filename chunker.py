import gc
import os
import re
from typing import Optional
from llama_index.core.text_splitter import SentenceSplitter
from transformers import AutoTokenizer
from langchain.docstore.document import Document

CHUNK_SIZE=512
MINI_CHUNK_SIZE=150
CHUNK_OVERLAP=0
BLURB_SIZE=128
TITLE_SEPARATOR = "\n\r\n"
SECTION_SEPARATOR = "\n\n"
_TOKENIZER: tuple[Optional["AutoTokenizer"], str | None] = (None, None)


DOCUMENT_ENCODER_MODEL = (
    # This is not a good model anymore, but this default needs to be kept for not breaking existing
    # deployments, will eventually be retired/swapped for a different default model
    os.environ.get("DOCUMENT_ENCODER_MODEL")
    or "thenlper/gte-small"
)

def shared_precompare_cleanup(text: str) -> str:
    """LLMs models sometime restructure whitespaces or edits special characters to fit a more likely
    distribution of characters found in its training data, but this hurts exact quote matching
    """
    text = text.lower()

    # \s: matches any whitespace character (spaces, tabs, newlines, etc.)
    # |: acts as an OR.
    # \*: matches the asterisk character.
    # \\": matches the \" sequence.
    # [.,:`"#-]: matches any character inside the square brackets.
    text = re.sub(r'\s|\*|\\"|[.,:`"#-]', "", text)

    return text
 

def get_default_tokenizer(model_name: str | None = None) -> "AutoTokenizer":
    # NOTE: doing a local import here to avoid reduce memory usage caused by
    # processes importing this file despite not using any of this
    from transformers import AutoTokenizer  # type: ignore

    global _TOKENIZER
    if _TOKENIZER[0] is None or (
        _TOKENIZER[1] is not None and _TOKENIZER[1] != model_name
    ):
        if _TOKENIZER[0] is not None:
            del _TOKENIZER
            gc.collect()

        if model_name is None:
            # This could be inaccurate
            model_name = DOCUMENT_ENCODER_MODEL

        _TOKENIZER = (AutoTokenizer.from_pretrained(model_name), model_name)

        if hasattr(_TOKENIZER[0], "is_fast") and _TOKENIZER[0].is_fast:
            os.environ["TOKENIZERS_PARALLELISM"] = "false"

    return _TOKENIZER[0]



def extract_blurb(text: str, blurb_size: int) -> str:
    token_count_func = get_default_tokenizer().tokenize
    blurb_splitter = SentenceSplitter(
        tokenizer=token_count_func, chunk_size=blurb_size, chunk_overlap=0
    )

    return blurb_splitter.split_text(text)[0]


def chunk_large_section(
    section_text: str,
    section_link_text: str,
    document: Document,
    start_chunk_id: int,
    tokenizer: AutoTokenizer,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
    blurb_size: int = BLURB_SIZE,
) -> list[Document]:
    blurb = extract_blurb(section_text, blurb_size)

    sentence_aware_splitter = SentenceSplitter(
        tokenizer=tokenizer.tokenize, chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )

    split_texts = sentence_aware_splitter.split_text(section_text)
    import pdb; pdb.set_trace()
    chunks = [
        Document(
            page_content = chunk_str,

            source_document=document,
            chunk_id=start_chunk_id + chunk_ind,
            blurb=blurb,
            content=chunk_str,
            source_links={0: section_link_text},
            section_continuation=(chunk_ind != 0),
        )
        for chunk_ind, chunk_str in enumerate(split_texts)
    ]
    return chunks


def chunk_document(
    document: Document,
    chunk_tok_size: int = CHUNK_SIZE,
    subsection_overlap: int = CHUNK_OVERLAP,
    blurb_size: int = BLURB_SIZE,
) -> list[Document]:

    import pdb; pdb.set_trace()
    title = document.metadata.get('title', document.metadata.get('source'))
#    title = document.get_title_for_document_index()
    title_prefix = title.replace("\n", " ") + TITLE_SEPARATOR if title else ""
    tokenizer = get_default_tokenizer()

    chunks: list[Document] = []
    link_offsets: dict[int, str] = {}
    chunk_text = ""
    #todo check document.sections
    for ind, section in enumerate([document.page_content]):
        section_text = title_prefix + section if ind == 0 else section
        #todo check section_link_text
        section_link_text = document.metadata.get('source')

        section_tok_length = len(tokenizer.tokenize(section_text))
        current_tok_length = len(tokenizer.tokenize(chunk_text))
        curr_offset_len = len(shared_precompare_cleanup(chunk_text))

        # Large sections are considered self-contained/unique therefore they start a new chunk and are not concatenated
        # at the end by other sections
        if section_tok_length > chunk_tok_size:
            if chunk_text:
                chunks.append(
                    Document(
                        source_document=document,
                        chunk_id=len(chunks),
                        blurb=extract_blurb(chunk_text, blurb_size),
                        content=chunk_text,
                        source_links=link_offsets,
                        section_continuation=False,
                    )
                )
                link_offsets = {}
                chunk_text = ""

            large_section_chunks = chunk_large_section(
                section_text=section_text,
                section_link_text=section_link_text,
                document=document,
                start_chunk_id=len(chunks),
                tokenizer=tokenizer,
                chunk_size=chunk_tok_size,
                chunk_overlap=subsection_overlap,
                blurb_size=blurb_size,
            )
            chunks.extend(large_section_chunks)

            import pdb; pdb.set_trace()
            start_chunk_id = len(large_section_chunks)
            for large_chunk in large_section_chunks:
                small_texts = split_chunk_text_into_mini_chunks(large_chunk.page_content)
                small_chunks = [
                        Document(
                            page_content = chunk_str,
                            source_document=document,
                            chunk_id=start_chunk_id + chunk_ind,
                            #blurb=large_chunk.blurb,
                            content=chunk_str,
                            source_links={0: section_link_text},
                            section_continuation=(chunk_ind != 0),
                        )
                        for chunk_ind, chunk_str in enumerate(small_texts)
                    ]
                #chunks.extend(small_chunks)
            continue

        # In the case where the whole section is shorter than a chunk, either adding to chunk or start a new one
        if (
            current_tok_length
            + len(tokenizer.tokenize(SECTION_SEPARATOR))
            + section_tok_length
            <= chunk_tok_size
        ):
            chunk_text += (
                SECTION_SEPARATOR + section_text if chunk_text else section_text
            )
            link_offsets[curr_offset_len] = section_link_text
        else:
            chunks.append(
                Document(
                    source_document=document,
                    chunk_id=len(chunks),
                    blurb=extract_blurb(chunk_text, blurb_size),
                    content=chunk_text,
                    source_links=link_offsets,
                    section_continuation=False,
                )
            )
            link_offsets = {0: section_link_text}
            chunk_text = section_text


    # Once we hit the end, if we're still in the process of building a chunk, add what we have
    # NOTE: if it's just whitespace, ignore it.
    if chunk_text.strip():
        chunks.append(
            Document(
                source_document=document,
                chunk_id=len(chunks),
                blurb=extract_blurb(chunk_text, blurb_size),
                content=chunk_text,
                source_links=link_offsets,
                section_continuation=False,
            )
        )
    return chunks


def split_chunk_text_into_mini_chunks(
    chunk_text: str, mini_chunk_size: int = MINI_CHUNK_SIZE
) -> list[str]:
    token_count_func = get_default_tokenizer().tokenize
    sentence_aware_splitter = SentenceSplitter(
        tokenizer=token_count_func, chunk_size=mini_chunk_size, chunk_overlap=0
    )

    return sentence_aware_splitter.split_text(chunk_text)




class Chunker:
    def chunk(self, document: Document) -> list[Document]:
        return chunk_document(document)
