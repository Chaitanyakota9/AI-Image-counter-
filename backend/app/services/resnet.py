# app/services/resnet.py
from typing import Dict
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification

class ResNetClassifier:
    def __init__(self, model_name: str = "microsoft/resnet-18", top_k: int = 5):
        print(f"[ResNet] Loading {model_name} ...")
        self.processor = AutoImageProcessor.from_pretrained(model_name)
        self.model = AutoModelForImageClassification.from_pretrained(model_name)
        self.model.eval()
        self.id2label = self.model.config.id2label
        self.top_k = top_k
        print("[ResNet] Model loaded.")

    def classify_crop(self, crop_bgr) -> Dict[str, float]:
        import cv2
        rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
        inputs = self.processor(images=rgb, return_tensors="pt")
        with torch.no_grad():
            logits = self.model(**inputs).logits[0]
            probs = torch.nn.functional.softmax(logits, dim=-1)
            topk = torch.topk(probs, k=self.top_k)
        # only top-k as a small dict
        return { self.id2label[idx.item()]: float(probs[idx].item())
                 for idx in topk.indices }
