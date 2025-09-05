# Vision Pipeline UI (React + Vite + TS + Tailwind)

Frontend for FastAPI pipeline (SAM → ResNet → Zero-shot).

## Features
- Drag & drop or click to upload
- Candidate labels (CSV) + **Max segments** (sent as `max_segments`)
- Health ping (`GET /api/health`)
- Totals bar: `totals.sam_detected`, `totals.returned`
- Counts panel (mapped & resnet) + dropdown to show mapped count for a label
- Segment picker (dropdown) to inspect a single segment
- Collapsible raw JSON for debugging
- Axios with env-driven `VITE_API_BASE_URL` (leave empty in dev to use Vite proxy)

## Dev
```bash
cd frontend
cp .env.example .env      # leave VITE_API_BASE_URL empty to use dev proxy
npm i
npm run dev
```
Backend expected at `127.0.0.1:8000` for proxy (see `vite.config.ts`).
Open http://127.0.0.1:5173

## Build
```bash
npm run build
npm run preview
```