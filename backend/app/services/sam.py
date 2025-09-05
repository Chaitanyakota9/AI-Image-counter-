# app/services/sam.py
from __future__ import annotations
from typing import List, Dict, Any
from pathlib import Path
import requests
import numpy as np
import cv2

from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

# Default SAM hyperparams (can be tuned)
POINTS_PER_SIDE = 6
PRED_IOU_THRESH = 0.7
STABILITY_SCORE_THRESH = 0.85
MIN_MASK_REGION_AREA = 1000
CROP_N_LAYERS = 1
CROP_N_POINTS_DOWNSCALE = 2

PROJECT_ROOT = Path(__file__).resolve().parents[2]
WEIGHTS_DIR = PROJECT_ROOT / "weights"
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
CKPT_NAME = "sam_vit_b_01ec64.pth"
CKPT_PATH = WEIGHTS_DIR / CKPT_NAME
CKPT_URL = f"https://dl.fbaipublicfiles.com/segment_anything/{CKPT_NAME}"


def _download_checkpoint_if_needed():
    if CKPT_PATH.exists():
        return
    print(f"[SAM] Downloading checkpoint to {CKPT_PATH} ...")
    with requests.get(CKPT_URL, stream=True) as r:
        r.raise_for_status()
        with open(CKPT_PATH, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    print("[SAM] Download complete.")


def _bbox_from_mask(mask_bool: np.ndarray) -> Dict[str, int]:
    ys, xs = np.where(mask_bool)
    if ys.size == 0 or xs.size == 0:
        return {"x1": 0, "y1": 0, "x2": 0, "y2": 0}
    x1, x2 = int(xs.min()), int(xs.max()) + 1
    y1, y2 = int(ys.min()), int(ys.max()) + 1
    return {"x1": x1, "y1": y1, "x2": x2, "y2": y2}


class SAMSegmenter:
    """
    Usage:
        segs = SAMSegmenter().segment(image_np, top_n=10)
    Returns:
        List of dicts: {'box': {x1,y1,x2,y2}, 'score': float, 'mask': np.ndarray(bool)}
    """
    def __init__(self):
        _download_checkpoint_if_needed()

        # You can add simple device selection here if needed
        self.device = "cpu"
        sam = sam_model_registry["vit_b"](checkpoint=str(CKPT_PATH))
        sam.to(self.device)

        self.mask_generator = SamAutomaticMaskGenerator(
            model=sam,
            points_per_side=POINTS_PER_SIDE,
            pred_iou_thresh=PRED_IOU_THRESH,
            stability_score_thresh=STABILITY_SCORE_THRESH,
            min_mask_region_area=MIN_MASK_REGION_AREA,
            crop_n_layers=CROP_N_LAYERS,
            crop_n_points_downscale_factor=CROP_N_POINTS_DOWNSCALE,
        )
        print(f"[SAM] Loaded on {self.device}")

    def segment(self, image_np: np.ndarray, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        image_np: numpy array image (BGR or RGB). If BGR (OpenCV), we convert to RGB.
        top_n: return at most this many largest masks.
        """
        if image_np is None or not isinstance(image_np, np.ndarray):
            raise ValueError("segment() expects a numpy array image")

        # Convert BGR→RGB if it looks like a 3-channel OpenCV image
        if image_np.ndim == 3 and image_np.shape[2] == 3:
            # Heuristic: assume BGR if called from OpenCV; convert to RGB for SAM
            rgb = cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB)
        else:
            # Already single-channel or RGB-like; SAM expects HxWx3 RGB ideally
            rgb = image_np

        print("[SAM] Generating masks ...")
        masks = self.mask_generator.generate(rgb)

        # Sort by 'area' (SAM provides it) and keep the requested top_n
        top_n = max(1, int(top_n))
        masks_sorted = sorted(masks, key=lambda x: x.get("area", 0), reverse=True)[:top_n]

        out: List[Dict[str, Any]] = []
        for m in masks_sorted:
            mask_bool = m["segmentation"].astype(bool)
            box = _bbox_from_mask(mask_bool)
            out.append({
                "box": box,
                "score": float(m.get("stability_score", 0.0)),  # or 'predicted_iou'
                "mask": mask_bool,
            })
        return out
