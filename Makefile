.PHONY: start
start:
	.venv/bin/uvicorn main:app --reload --port 8080

ingest:
	.venv/bin/python ingest.py

.PHONY: format
format:
	black .
	isort .
