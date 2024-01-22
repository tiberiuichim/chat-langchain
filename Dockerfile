FROM python:3.10-bookworm as builder

RUN pip install -U poetry

RUN poetry config virtualenvs.create false

COPY ./pyproject.toml ./poetry.lock* ./

RUN poetry install --no-interaction --no-ansi --no-root --no-directory

COPY ./*.py ./

RUN poetry install  --no-interaction --no-ansi

CMD exec uvicorn main:app --host 0.0.0.0 --port 8080
