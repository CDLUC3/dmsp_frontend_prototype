import {
  CURRENT_SCHEMA_VERSION,
  QuestionTypesEnum,
  BooleanQuestionSchema,
  TextAreaQuestionSchema,
  TextQuestionSchema,
  RadioButtonsQuestionSchema,
  CheckboxesQuestionSchema,
  SelectBoxQuestionSchema,
  URLQuestionSchema,
  CurrencyQuestionSchema,
  DatePickerQuestionSchema,
  DateRangeQuestionSchema,
  EmailQuestionSchema,
  FilteredSearchQuestionSchema,
  NumberQuestionSchema,
  TableQuestionSchema,
  TypeaheadSearchQuestionSchema,
  TextQuestionType,
  TextAreaQuestionType,
  RadioButtonsQuestionType,
  CheckboxesQuestionType,
  SelectBoxQuestionType,
  URLQuestionType,
  BooleanQuestionType,
  CurrencyQuestionType,
  DatePickerQuestionType,
  DateRangeQuestionType,
  EmailQuestionType,
  FilteredSearchQuestionType,
  NumberQuestionType,
  TableQuestionType,
  TypeaheadSearchQuestionType,
} from "@dmptool/types";
import { z, ZodSchema } from "zod";

// Type for handler result with validation
type HandlerResult = {
  success: boolean;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  data?: any;
  error?: string;
};

// Enhanced handler type that returns validation result
/* eslint-disable @typescript-eslint/no-explicit-any */
type QuestionTypeHandler = (baseJSON: any, userInput: any) => HandlerResult;

type Option = {
  label: string; // The display label for the option
  value: string; // The value associated with the option
  selected?: boolean; // Whether the option is selected (optional)
};

// Map question types to their corresponding Zod schemas
const questionSchemas: Record<string, ZodSchema> = {
  boolean: BooleanQuestionSchema,
  text: TextQuestionSchema,
  textArea: TextAreaQuestionSchema,
  radioButtons: RadioButtonsQuestionSchema,
  checkBoxes: CheckboxesQuestionSchema,
  selectBox: SelectBoxQuestionSchema,
  url: URLQuestionSchema,
  currency: CurrencyQuestionSchema,
  datePicker: DatePickerQuestionSchema,
  dateRange: DateRangeQuestionSchema,
  email: EmailQuestionSchema,
  filteredSearch: FilteredSearchQuestionSchema,
  number: NumberQuestionSchema,
  table: TableQuestionSchema,
  typeAheadSearch: TypeaheadSearchQuestionSchema,
};

// Helper function to create and validate question type JSON
const createAndValidateQuestion = (
  type: string,
  jsonData: any,
  schema?: ZodSchema
): HandlerResult => {
  try {
    // Validates jsonData and checks if it conforms to the specified schema
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
    const questionData: TextQuestionType = {
      ...json,
      type: "text",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        maxLength: input?.maxLength || 1000,
        minLength: input?.minLength || 0,
        pattern: input?.pattern || "^.+$", // Fixed regex pattern
      },
    };

    return createAndValidateQuestion("text", questionData, questionSchemas.text);
  },

  textArea: (json, input) => {
    const questionData: TextAreaQuestionType = {
      ...json,
      type: "textArea",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        maxLength: input?.maxLength || 1000,
        minLength: input?.minLength || 0,
        rows: input?.rows || 2,
        cols: input?.cols || 40,
      },
    };

    return createAndValidateQuestion("textArea", questionData, questionSchemas.textArea);
  },

  radioButtons: (json, input: { options: Option[] }) => {
    const questionData: RadioButtonsQuestionType = {
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
      })) || [],
    };

    return createAndValidateQuestion("radioButtons", questionData, questionSchemas.radioButtons);
  },

  checkBoxes: (json, input: { options: Option[] }) => {
    const questionData: CheckboxesQuestionType = {
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
      })) || [],
    };

    return createAndValidateQuestion("checkBoxes", questionData, questionSchemas.checkBoxes);
  },

  selectBox: (json, input: { options: Option[] }) => {
    const questionData: SelectBoxQuestionType = {
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
      })) || [],
    };

    return createAndValidateQuestion("selectBox", questionData, questionSchemas.selectBox);
  },

  boolean: (json, input) => {
    const questionData: BooleanQuestionType = {
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
    const questionData: URLQuestionType = {
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

  currency: (json, input) => {
    const questionData: CurrencyQuestionType = {
      ...json,
      type: "currency",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.max || null,
        min: input?.min || null,
        step: input?.step || 1,
      },
    };

    return createAndValidateQuestion("currency", questionData, questionSchemas.currency);
  },
  datePicker: (json, input) => {
    const questionData: DatePickerQuestionType = {
      ...json,
      type: "datePicker",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.max || null, // Optional max date as a string
        min: input?.min || null, // Optional min date as a string
        step: input?.step || null, // Optional step as a number
      },
    };

    return createAndValidateQuestion("datePicker", questionData, questionSchemas.datePicker);
  },
  dateRange: (json, input) => {
    const questionData: DateRangeQuestionType = {
      ...json,
      type: "dateRange",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      columns: [
        {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "date",
          attributes: {
            max: input?.from?.max || null,
            min: input?.from?.min || null,
            step: input?.from?.step || 1,
            label: input?.from?.label || "From",
          },
        },
        {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "date",
          attributes: {
            max: input?.to?.max || null,
            min: input?.to?.min || null,
            step: input?.to?.step || 1,
            label: input?.to?.label || "To",
          },
        },
      ],
    };

    return createAndValidateQuestion("dateRange", questionData, questionSchemas.dateRange);
  },
  email: (json, input) => {
    const questionData: EmailQuestionType = {
      ...json,
      type: "email",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        pattern: input?.pattern || null, // Optional regex pattern for email validation
        multiple: input?.multiple || false, // Whether multiple emails are allowed
        maxLength: input?.maxLength || null, // Optional maximum length
        minLength: input?.minLength || 0, // Optional minimum length, defaults to 0
      },
    };

    return createAndValidateQuestion("email", questionData, questionSchemas.email);
  },
  filteredSearch: (json, input: {
    query?: string;
    queryId?: string;
    variables?: FilteredSearchQuestionType["graphQL"]["variables"];
    answerField?: string;
    displayFields?: FilteredSearchQuestionType["graphQL"]["displayFields"];
    responseField?: string;
  }) => {
    const questionData: FilteredSearchQuestionType = {
      ...json,
      type: "filteredSearch",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      graphQL: {
        query: input?.query || "",
        queryId: input?.queryId || "",
        variables: input?.variables?.map(variable => ({
          name: variable.name || "",
          type: variable.type || "string",
          label: variable.label || "",
          minLength: variable.minLength || 0,
          labelTranslationKey: variable.labelTranslationKey || null,
        })) || [],
        answerField: input?.answerField || "",
        displayFields: input?.displayFields?.map(field => ({
          label: field.label || "",
          propertyName: field.propertyName || "",
          labelTranslationKey: field.labelTranslationKey || null,
        })) || [],
        responseField: input?.responseField || "",
      },
    };

    return createAndValidateQuestion("filteredSearch", questionData, questionSchemas.filteredSearch);
  },
  number: (json, input) => {
    const questionData: NumberQuestionType = {
      ...json,
      type: "number",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.max || null, // Optional maximum value
        min: input?.min || 0, // Optional minimum value, defaults to 0
        step: input?.step || 1, // Optional step value, defaults to 1
      },
    };

    return createAndValidateQuestion("number", questionData, questionSchemas.number);
  },
  table: (json, input: {
    columns?: TableQuestionType["columns"];
    attributes?: TableQuestionType["attributes"];
  }) => {
    const questionData: TableQuestionType = {
      ...json,
      type: "table",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      columns: input?.columns?.map(column => {
        const baseColumn = {
          meta: {
            ...column.meta,
            label: "label" in column.meta ? column.meta.label || "" : "",
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: column.type || "text",
        };

        // Add `attributes` only if it exists
        if ("attributes" in column && column.attributes) {
          return { ...baseColumn, attributes: column.attributes };
        }

        // Handle `columns` property for `dateRange` type
        if (column.type === "dateRange" && "columns" in column) {
          return { ...baseColumn, columns: column.columns };
        }

        return baseColumn;
      }) || [],
      attributes: {
        maxRows: input?.attributes?.maxRows || null,
        minRows: input?.attributes?.minRows || null,
        canAddRows: input?.attributes?.canAddRows ?? true,
        initialRows: input?.attributes?.initialRows || 1,
        canRemoveRows: input?.attributes?.canRemoveRows ?? true,
      },
    };

    return createAndValidateQuestion("table", questionData, questionSchemas.table);
  },
  typeaheadSearch: (json, input: {
    query?: string;
    localQueryId?: string;
    variables?: TypeaheadSearchQuestionType["graphQL"]["variables"];
    answerField?: string;
    displayFields?: FilteredSearchQuestionType["graphQL"]["displayFields"];
    responseField?: string;
  }) => {
    const questionData: TypeaheadSearchQuestionType = {
      ...json,
      type: "typeaheadSearch",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      graphQL: {
        query: input?.query || "",
        localQueryId: input?.localQueryId || "",
        responseField: input?.responseField || "",
        variables: input?.variables?.map(variable => ({
          name: variable.name || "",
          type: variable.type || "string",
          label: variable.label || "",
          minLength: variable.minLength || 0,
          defaultValue: variable.defaultValue || "",
          labelTranslationKey: variable.labelTranslationKey || null,
        })) || [],
        displayFields: input?.displayFields?.map(field => ({
          propertyName: field.propertyName || "",
          label: field.label || "",
          labelTranslationKey: field.labelTranslationKey || null,
        })) || [],
      },
    };

    return createAndValidateQuestion("typeaheadSearch", questionData, questionSchemas.typeaheadSearch);
  },
};