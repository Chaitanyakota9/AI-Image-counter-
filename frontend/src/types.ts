export type SegmentBox = { x1:number; y1:number; x2:number; y2:number; score:number };
export type Segment = {
  box: SegmentBox;
  mask_path: string;
  label: string | null;
  mapped_label: string | null;
  resnet_probs: Record<string, number>;
  zeroshot_scores: Record<string, number>;
};
export type PredictResponse = {
  image_path: string;
  segments: Segment[];
  counts: { resnet: Record<string, number>; mapped: Record<string, number> };
  candidate_labels: string[];
  totals?: { sam_detected: number; returned: number };
};