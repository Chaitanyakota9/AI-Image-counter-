# app/api/routes.py
from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Optional
from collections import Counter
from pathlib import Path

from app.services.pipeline import MLPipeline
from app.utils.image_io import save_upload

router = APIRouter()
pipeline = MLPipeline()

def _parse_candidate_labels(s: Optional[str]) -> Optional[List[str]]:
    if not s:
        return None
    if s.strip().lower() == "string":
        return None
    labels = [x.strip() for x in s.split(",")]
    labels = [x for x in labels if x]
    return labels or None

@router.post("/predict/full")
async def predict_full(
    file: UploadFile = File(...),
    candidate_labels: Optional[str] = Form(None),
    max_segments: int = Form(10),                 # <— NEW
):
    # sanity bounds
    max_segments = max(1, min(100, int(max_segments)))

    upload_path = save_upload(file, Path("data/uploads"))
    labels = _parse_candidate_labels(candidate_labels)

    # pipeline now returns (segments, totals)
    segments, totals = pipeline.run(
        image_path=upload_path,
        candidate_labels=labels,
        max_segments=max_segments,               # <— pass along
    )

    resnet_counts = Counter([s.get("label") for s in segments if s.get("label")])
    mapped_counts = Counter([s.get("mapped_label") for s in segments if s.get("mapped_label")])

    used_labels = labels if labels else pipeline.DEFAULT_LABELS

    return {
        "image_path": f"/static/../{upload_path}",
        "segments": segments,                    # up to max_segments
        "counts": {
            "resnet": dict(resnet_counts),
            "mapped": dict(mapped_counts),
        },
        "candidate_labels": used_labels,
        "totals": totals,                        # <— NEW: metadata
        # example: {"sam_detected": 37, "returned": 10}
    }
