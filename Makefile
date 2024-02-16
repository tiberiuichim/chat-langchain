.PHONY: start
start:
	poetry run uvicorn main:app --port 8060
	# .venv/bin/uvicorn main:app --reload --port 8080

.PHONY: frontend-start
frontend-start:
	cd frontend && env API_URL=http://localhost:8060 yarn dev

ingest:
	poetry run python ingest.py
	# .venv/bin/python ingest.py

.PHONY: format
format:
	black .
	isort .

.PHONY: build
build:
	docker build . -t tiberiuichim/llm-chat:0.1

.PHONY: release-frontend
release-frontend:
	docker compose build frontend
	docker compose push frontend

.PHONY: release-backend
release-backend:
	docker compose build chat
	docker compose push chat
