import { QuestionOptions } from '@/app/types';

export const defaultInputs: Record<string, any> = {
  text: (formState: any) => ({
    maxLength: formState?.maxLength ?? null,
    pattern: formState?.pattern ?? "^.+$",
  }),
  textArea: (formState: any) => ({
    maxLength: formState?.maxLength ?? null,
    minLength: formState?.minLength ?? 0,
    rows: formState?.rows ?? 2, // Override with formState.rows if provided
    cols: formState?.cols ?? 40,

  }),
  radioButtons: (formState: any) => ({
    options: formState.map((row: QuestionOptions) => ({
      label: row.text,
      value: row.text,
      selected: row.isDefault,
    })),
  }),
  checkBoxes: (formState: any) => ({
    options: formState.map((row: QuestionOptions) => ({
      label: row.text,
      value: row.text,
      selected: row.isDefault,
    })),
  }),
  selectBox: (formState: any) => ({
    options: formState.map((row: QuestionOptions) => ({
      label: row.text,
      value: row.text,
      selected: row.isDefault,
    })),
  }),
  boolean: (formState: any) => ({
    checked: formState?.checked ?? false,
  }),
  url: (formState: any) => ({
    pattern: formState?.pattern ?? "https?://.+",
    maxLength: formState?.maxLength ?? 2048,
    minLength: formState?.minLength ?? 0,
  }),
  number: (formState: any) => ({
    min: formState?.min ?? 0,
    max: formState?.max ?? 100,
    step: formState?.step ?? 1,
  }),
  currency: (formState: any) => ({
    min: formState?.min ?? 0,
    max: formState?.max ?? 1000000,
    step: formState?.step ?? 0.01,
  }),
  table: (formState: any) => ({
    columns: formState?.columns ?? [
      {
        type: "text",
        attributes: {
          maxLength: 100,
          minLength: 0,
          pattern: "^.+$",
        },
      },
    ],
    attributes: {
      maxRows: formState?.maxRows ?? 10,
      minRows: formState?.minRows ?? 1,
      canAddRows: formState?.canAddRows ?? true,
      canRemoveRows: formState?.canRemoveRows ?? true,
      initialRows: formState?.initialRows ?? 1,
    },
  }),
  datePicker: (formState: any) => ({
    min: formState?.min ?? null,
    max: formState?.max ?? null,
    step: formState?.step ?? 1,
  }),
  dateRange: (formState: any) => ({
    from: {
      min: formState?.from?.min ?? null,
      max: formState?.from?.max ?? null,
      step: formState?.from?.step ?? 1,
      label: formState?.from?.label ?? "From",
    },
    to: {
      min: formState?.to?.min ?? null,
      max: formState?.to?.max ?? null,
      step: formState?.to?.step ?? 1,
      label: formState?.to?.label ?? "To",
    },
  }),
  email: (formState: any) => ({
    pattern: formState?.pattern ?? "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    multiple: formState?.multiple ?? false,
    maxLength: formState?.maxLength ?? 254,
    minLength: formState?.minLength ?? 0,
  }),
  filteredSearch: (formState: any) => ({
    query: formState?.query ?? "",
    queryId: formState?.queryId ?? "",
    variables: formState?.variables ?? [],
    answerField: formState?.answerField ?? "",
    displayFields: formState?.displayFields ?? [],
    responseField: formState?.responseField ?? "",
  }),
  typeaheadSearch: (formState: any) => ({
    query: formState?.query ?? "",
    localQueryId: formState?.localQueryId ?? "",
    responseField: formState?.responseField ?? "",
    variables: formState?.variables ?? [],
    displayFields: formState?.displayFields ?? [],
  }),
};

// Merge the formState with overrides, and update json schema accordingly for specified question type
export function getHandlerInput(
  type: string,
  formState: any,
  overrides: Partial<typeof defaultInputs[string]> = {}
) {
  const defaults = defaultInputs[type];

  if (typeof defaults === "function") {
    // Handle arrays separately to avoid converting them into objects
    const mergedFormState = Array.isArray(formState)
      ? [...formState, ...(Array.isArray(overrides) ? overrides : [])]
      : { ...formState, ...overrides };

    return defaults(mergedFormState);
  }

  throw new Error(`No default input handler found for type: ${type}`);
}
