// Define the return type for getOverrides
type Overrides = {
  maxLength?: number;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
};

export const getOverrides = (questionType: string | null | undefined): Overrides => {
  switch (questionType) {
    case "text":
      return { maxLength: 500 };
    case "textArea":
      return { maxLength: 1000, rows: 5 };
    case "number":
      return { min: 0, max: 1000, step: 5 };
    case "currency":
      return { min: 0, max: 100000, step: 0.01 };
    case "url":
      return { maxLength: 2048, pattern: "https?://.+" };
    default:
      return {}; // No overrides for other types
  }
};
