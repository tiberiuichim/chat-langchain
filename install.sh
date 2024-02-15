pip install virtualenv
virtualenv .venv

.venv/bin/pip install -U pip
.venv/bin/pip install sentence_transformers
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cu118
.venv/bin/pip install InstructorEmbedding
.venv/bin/pip install langserve
.venv/bin/pip install weaviate-client
.venv/bin/pip install -e packages/voltodocs/
.venv/bin/pip install -U langchain-community
.venv/bin/pip install -U faiss-gpu
.venv/bin/pip install llama-cpp-python --prefer-binary --extra-index-url=https://jllllll.github.io/llama-cpp-python-cuBLAS-wheels/AVX2/cu122
.venv/bin/pip install sse_starlette
.venv/bin/pip install git+https://github.com/huggingface/transformers
.venv/bin/pip install ctransformers

#.venv/bin/python app/server.py
.venv/bin/pip install python-dotenv
.venv/bin/pip install openai
.venv/bin/pip install pdfminer.six
.venv/bin/pip install unstructured[local-inference]
.venv/bin/pip install "unstructured[all-docs]"
# .venv/bin/pip install 'git+https://github.com/facebookresearch/detectron2.git'
.venv/bin/pip install llama-index
.venv/bin/pip install langchain_experimental
.venv/bin/pip install -U langchain
.venv/bin/pip install -U langchain-community
.venv/bin/pip install simsimd
.venv/bin/pip install pymupdf
.venv/bin/pip install python-multipart

.venv/bin/pip install fastapi
.venv/bin/pip install langchain_openai
.venv/bin/pip install langchain_together