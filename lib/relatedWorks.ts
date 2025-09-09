import { Confidence } from "@/app/types";

export const scoreToConfidence = (score: number): string => {
  if (score >= 0.7) {
    return Confidence.High;
  } else if (score >= 0.4) {
    return Confidence.Medium;
  } else {
    return Confidence.Low;
  }
};
