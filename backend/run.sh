#!/usr/bin/env bash
set -euo pipefail

# ensure watchfiles is present so include/exclude actually work
./venv/bin/pip install -q watchfiles

exec env PYTHONNOUSERSITE=1 ./venv/bin/uvicorn app.main:app --reload \
  --host 127.0.0.1 --port 8000 \
  --reload-dir app \
  --reload-dir data \
  --reload-include 'app/**/*.py' \
  --reload-include 'data/**/*' \
  --reload-exclude 'venv/**' \
  --reload-exclude 'weights/**' \
  --reload-exclude '**/__pycache__/**' \
  --reload-exclude 'venv/**/site-packages/**'
