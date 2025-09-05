# app/services/pipeline.py
from pathlib import Path
from typing import List, Optional, Dict, Tuple, Any
import cv2
import numpy as np

from app.services.sam import SAMSegmenter
from app.services.resnet import ResNetClassifier
from app.services.zeroshot import ZeroShotWrapper
from app.core.config import RESULTS_DIR

class MLPipeline:
    DEFAULT_LABELS = [
        "car", "cat", "tree", "dog", "building",
        "person", "sky", "ground", "hardware"
    ]

    def __init__(self):
        self.sam = SAMSegmenter()
        self.resnet = ResNetClassifier()
        self.zs = ZeroShotWrapper()

    @staticmethod
    def _masked_crop(bgr: np.ndarray, mask_bool: np.ndarray, box: Dict[str, int]) -> np.ndarray:
        """Apply mask (background=188) and crop to bbox."""
        x1, y1, x2, y2 = box["x1"], box["y1"], box["x2"], box["y2"]
        out = np.full_like(bgr, 188)  # gray background
        out[mask_bool] = bgr[mask_bool]
        return out[y1:y2, x1:x2]

    def run(
        self,
        image_path: Path,
        candidate_labels: Optional[List[str]] = None,
        max_segments: int = 10,
        hypothesis_template: str = "This is a photo of {}."
    ) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        return self.run_with_progress(image_path, candidate_labels, max_segments, hypothesis_template, None)
    
    async def run_with_progress(
        self,
        image_path: Path,
        candidate_labels: Optional[List[str]] = None,
        max_segments: int = 10,
        hypothesis_template: str = "This is a photo of {}.",
        progress_callback = None
    ) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:

        if not candidate_labels:
            candidate_labels = self.DEFAULT_LABELS
        max_segments = max(1, int(max_segments))

        bgr = cv2.imread(str(image_path))
        if bgr is None:
            raise ValueError(f"Failed to read image: {image_path}")

        if progress_callback:
            await progress_callback("sam", 30, "Loading image and initializing SAM...")

        # --- SAM segmentation (support either np-image+top_n or path) ---
        try:
            # if your SAM wrapper supports passing the image and top_n
            sam_outputs = self.sam.segment(bgr, top_n=max_segments)
            sam_outputs_sorted = sam_outputs  # already limited/sorted if your service does that
        except TypeError:
            # fallback: older signature taking just a path
            sam_outputs = self.sam.segment(image_path)
            sam_outputs_sorted = sorted(sam_outputs, key=lambda x: x.get("area", 0), reverse=True)

        if progress_callback:
            await progress_callback("sam", 50, f"SAM found {len(sam_outputs_sorted)} segments")

        # enforce limit if not already limited
        limited = sam_outputs_sorted[:max_segments]

        segments_out: List[Dict[str, Any]] = []

        for i, seg in enumerate(limited, start=1):
            box = seg["box"]
            mask_bool = seg["mask"]
            score = float(seg.get("score", 0.0))

            # Progress update for current segment
            if progress_callback:
                segment_progress = 50 + (i / len(limited)) * 40  # 50-90% for classification
                await progress_callback("classification", int(segment_progress), f"Processing segment {i}/{len(limited)}...")

            # masked crop
            crop = self._masked_crop(bgr, mask_bool, box)

            # save crop
            crop_path = RESULTS_DIR / f"{image_path.stem}_seg{i}.jpg"
            cv2.imwrite(str(crop_path), crop)

            # ResNet classify (top-k dict)
            resnet_probs = self.resnet.classify_crop(crop)
            top_label = max(resnet_probs, key=resnet_probs.get) if resnet_probs else None

            # Zero-shot mapped label (gated inside ZeroShotWrapper.map_label)
            mapped_label, zeros = (None, {})
            if top_label:
                mapped_label, zeros = self.zs.map_label(
                    hypothesis_template.format(top_label),
                    candidate_labels
                )

            segments_out.append({
                "box": {**box, "score": score},
                "mask_path": f"/static/results/{crop_path.name}",
                "label": top_label,               # ResNet top-1
                "mapped_label": mapped_label,     # may be None if not confident
                "resnet_probs": resnet_probs,     # top-k only
                "zeroshot_scores": zeros          # candidate label scores
            })

        if progress_callback:
            await progress_callback("finalizing", 95, "Finalizing results...")

        totals = {
            "sam_detected": len(sam_outputs_sorted),
            "returned": len(segments_out),
        }

        return segments_out, totals
