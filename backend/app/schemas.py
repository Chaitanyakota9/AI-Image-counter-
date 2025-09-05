from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ZSRequest(BaseModel):
    candidate_labels: List[str]
    hypothesis_template: Optional[str] = "This is a photo of {}."

class SegmentBox(BaseModel):
    x1: int; y1: int; x2: int; y2: int
    score: float

class SegmentResult(BaseModel):
    box: SegmentBox
    mask_path: Optional[str] = None
    label: Optional[str] = None                 # top ResNet class
    mapped_label: Optional[str] = None          # top zero-shot label (the "changed" class)
    resnet_probs: Optional[Dict[str, float]] = None
    zeroshot_scores: Optional[Dict[str, float]] = None

class PipelineResponse(BaseModel):
    image_path: str
    segments: List[SegmentResult]
