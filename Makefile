.PHONY: start
start:
	poetry run uvicorn main:app --reload --port 8080
	# .venv/bin/uvicorn main:app --reload --port 8080

ingest:
	poetry run python ingest.py
	# .venv/bin/python ingest.py

.PHONY: format
format:
	black .
	isort .
