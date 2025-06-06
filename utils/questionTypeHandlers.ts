import {
  CURRENT_SCHEMA_VERSION,
  QuestionTypesEnum,
  BooleanQuestionSchema,
  TextAreaQuestionSchema,
  TextQuestionSchema,
  RadioButtonsQuestionSchema,
  CheckboxesQuestionSchema,
  SelectBoxQuestionSchema,
  URLQuestionSchema
} from "@dmptool/types";
import { z, ZodSchema } from "zod";

// Type for handler result with validation
type HandlerResult = {
  success: boolean;
  data?: any;
  error?: string;
};

// Enhanced handler type that returns validation result
type QuestionTypeHandler = (baseJSON: any, userInput: any) => HandlerResult;

// Map question types to their corresponding Zod schemas
const questionSchemas: Record<string, ZodSchema> = {
  boolean: BooleanQuestionSchema,
  text: TextQuestionSchema,
  textArea: TextAreaQuestionSchema,
  radioButtons: RadioButtonsQuestionSchema,
  checkBoxes: CheckboxesQuestionSchema,
  selectBox: SelectBoxQuestionSchema,
  url: URLQuestionSchema,
  // Add other schemas as they become available
};

// Helper function to create and validate question JSON
const createAndValidateQuestion = (
  type: string,
  jsonData: any,
  schema?: ZodSchema
): HandlerResult => {
  try {
    // If we have a schema for this type, validate it
    if (schema) {
      const validatedData = schema.parse(jsonData);
      return { success: true, data: validatedData };
    }

    // If no schema available, return the data as-is (backward compatibility)
    return { success: true, data: jsonData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = `Validation failed for ${type}: ${error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`;
      return { success: false, error: errorMessage };
    }

    return {
      success: false,
      error: `Unexpected error validating ${type}: ${error}`
    };
  }
};


export const questionTypeHandlers: Record<
  z.infer<typeof QuestionTypesEnum>,
  QuestionTypeHandler
> = {
  text: (json, input) => {
    const questionData = {
      ...json,
      type: "text",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        maxLength: input?.maxLength || 1000,
        pattern: input?.pattern || "^.+$", // Fixed regex pattern
      },
    };

    return createAndValidateQuestion("text", questionData, questionSchemas.text);
  },

  textArea: (json, input) => {
    // Reuse text handler logic for textArea
    return questionTypeHandlers.text(json, input);
  },

  radioButtons: (json, input) => {
    const questionData = {
      ...json,
      type: "radioButtons",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label || option.value,
          selected: option.selected || false,
          value: option.value,
        },
        meta: {
          labelTranslationKey: option.labelTranslationKey || undefined,
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      })) || [],
    };

    return createAndValidateQuestion("radioButtons", questionData, questionSchemas.radioButtons);
  },

  checkBoxes: (json, input) => {
    const questionData = {
      ...json,
      type: "checkBoxes",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label || option.value,
          selected: option.selected || false,
          value: option.value,
        },
        meta: {
          labelTranslationKey: option.labelTranslationKey || undefined,
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      })) || [],
    };

    return createAndValidateQuestion("checkBoxes", questionData, questionSchemas.checkBoxes);
  },

  selectBox: (json, input) => {
    const questionData = {
      ...json,
      type: "selectBox",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label || option.value,
          selected: option.selected || false,
          value: option.value,
        },
        meta: {
          labelTranslationKey: option.labelTranslationKey || undefined,
          schemaVersion: CURRENT_SCHEMA_VERSION,
        },
      })) || [],
    };

    return createAndValidateQuestion("selectBox", questionData, questionSchemas.selectBox);
  },

  boolean: (json, input) => {
    const questionData = {
      ...json,
      type: "boolean",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        checked: input?.checked || false,
      },
    };

    return createAndValidateQuestion("boolean", questionData, questionSchemas.boolean);
  },

  url: (json, input) => {
    const questionData = {
      ...json,
      type: "url",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION
      },
      attributes: {
        ...json.attributes,
        pattern: input?.pattern || "https?://.+",
        maxLength: input?.maxLength || null,
        minLength: input?.minLength || null
      }
    };

    return createAndValidateQuestion("url", questionData, questionSchemas.url);
  },

  // For types without specific schemas yet, return success with data
  currency: (json, _) => ({ success: true, data: json }),
  datePicker: (json, _) => ({ success: true, data: json }),
  dateRange: (json, _) => ({ success: true, data: json }),
  email: (json, _) => ({ success: true, data: json }),
  filteredSearch: (json, _) => ({ success: true, data: json }),
  number: (json, _) => ({ success: true, data: json }),
  table: (json, _) => ({ success: true, data: json }),
  typeaheadSearch: (json, _) => ({ success: true, data: json }),
};