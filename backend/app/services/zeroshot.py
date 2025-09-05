# app/services/zeroshot.py
from __future__ import annotations
from typing import Dict, List, Tuple, Optional
from transformers import pipeline

# Default labels if the request doesn't provide any
DEFAULT_LABELS = [
    "car", "cat", "tree", "dog", "building",
    "person", "sky", "ground", "hardware",
]

class ZeroShotWrapper:
    """
    Text zero-shot: given a predicted class string (from ResNet),
    score it against candidate labels using an NLI model.
    Provides both score_text() and map_label() with confidence gating.
    """
    def __init__(
        self,
        model_name: str = "typeform/distilbert-base-uncased-mnli",
        threshold: float = 0.5,
        margin: float = 0.15,
    ):
        print(f"[ZeroShot] Loading {model_name} ...")
        self.clf = pipeline("zero-shot-classification", model=model_name)
        self.threshold = float(threshold)
        self.margin = float(margin)
        print("[ZeroShot] Model loaded.")

    def score_text(
        self,
        predicted_class: str,
        candidate_labels: List[str] | None,
    ) -> Dict[str, float]:
        """
        Return raw scores for candidate labels.
        """
        labels = candidate_labels if candidate_labels else DEFAULT_LABELS
        res = self.clf(predicted_class, candidate_labels=labels)
        return {label: float(score) for label, score in zip(res["labels"], res["scores"])}

    def map_label(
        self,
        predicted_class: str,
        candidate_labels: List[str] | None,
    ) -> Tuple[Optional[str], Dict[str, float]]:
        """
        Pick the best label if confident enough.
        Returns (mapped_label or None, scores_dict).
        """
        labels = candidate_labels if candidate_labels else DEFAULT_LABELS
        if len(labels) < 2:
            # need at least 2 labels to apply margin rule
            return None, {}

        scores = self.score_text(predicted_class, labels)
        if not scores:
            return None, {}

        # sort scores high→low
        items = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
        top_label, top_score = items[0]
        second_score = items[1][1] if len(items) > 1 else 0.0

        if (top_score >= self.threshold) and ((top_score - second_score) >= self.margin):
            return top_label, scores
        return None, scores
