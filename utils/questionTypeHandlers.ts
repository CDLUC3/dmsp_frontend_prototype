import {
  CURRENT_SCHEMA_VERSION,
  QuestionTypesEnum,
  QuestionTypeMap,
  QuestionSchemaMap,
} from "@dmptool/types";
import { z } from "zod";

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

// Helper function to create and validate question type JSON
const createAndValidateQuestion = (
  type: string,
  jsonData: any,
  schema?: z.ZodSchema
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
      const err = new z.ZodError([]);
      const errorMessage = `Validation failed for ${type}: ${err.issues
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


/**
 * The function is a collection of handlers for generating and validating
 * JSON objects for different question types. Each handler ensures the JSON conforms to the
 * corresponding question type schema using Zod for validation. It also uses type definitions
 * like `TextQuestionType` to enforce strong typing and enriches the JSON with default values
 * and metadata, ensuring compatibility with the current schema version.
 */
export const questionTypeHandlers: Record<
  z.infer<typeof QuestionTypesEnum>,
  QuestionTypeHandler
> = {
  text: (json, input) => {
    const questionData: QuestionTypeMap['text'] = {
      ...json,
      type: "text",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        maxLength: input?.attributes?.maxLength ?? 1000,
        minLength: input?.attributes?.minLength ?? 0,
        pattern: input?.attributes?.pattern ?? "^.+$",
      },
    };

    return createAndValidateQuestion("text", questionData, QuestionSchemaMap['text']);
  },

  textArea: (json, input) => {
    const questionData: QuestionTypeMap['textArea'] = {
      ...json,
      type: "textArea",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        maxLength: input?.attributes?.maxLength ?? 1000,
        minLength: input?.attributes?.minLength ?? 0,
        rows: input?.attributes?.rows ?? 2,
        cols: input?.attributes?.cols ?? 40,
      },
    };

    return createAndValidateQuestion("textArea", questionData, QuestionSchemaMap['textArea']);
  },
  radioButtons: (json, input: { options: Option[] }) => {
    const questionData: QuestionTypeMap['radioButtons'] = {
      ...json,
      type: "radioButtons",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label ?? option.value,
          selected: option.selected ?? false,
          value: option.value,
        },
      })) || [],
    };

    return createAndValidateQuestion("radioButtons", questionData, QuestionSchemaMap['radioButtons']);
  },

  checkBoxes: (json, input: { options: Option[] }) => {
    const questionData: QuestionTypeMap['checkBoxes'] = {
      ...json,
      type: "checkBoxes",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label ?? option.value,
          checked: option.selected ?? false,
          value: option.value,
        },
      })) || [],
    };

    return createAndValidateQuestion("checkBoxes", questionData, QuestionSchemaMap['checkBoxes']);
  },

  selectBox: (json, input: { options: Option[] }) => {
    const questionData: QuestionTypeMap['selectBox'] = {
      ...json,
      type: "selectBox",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      options: input.options?.map(option => ({
        type: 'option',
        attributes: {
          label: option.label ?? option.value,
          selected: option.selected ?? false,
          value: option.value,
        },
      })) || [],
    };

    return createAndValidateQuestion("selectBox", questionData, QuestionSchemaMap['selectBox']);
  },

  boolean: (json, input) => {
    const questionData: QuestionTypeMap['boolean'] = {
      ...json,
      type: "boolean",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        checked: input?.checked ?? false,
      },
    };

    return createAndValidateQuestion("boolean", questionData, QuestionSchemaMap['boolean']);
  },

  url: (json, input) => {
    const questionData: QuestionTypeMap['url'] = {
      ...json,
      type: "url",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION
      },
      attributes: {
        ...json.attributes,
        pattern: input?.attributes?.pattern ?? "https?://.+",
        maxLength: input?.attributes?.maxLength ?? null,
        minLength: input?.attributes?.minLength !== undefined ? input.attributes?.minLength : 0 // Fall back to 0 instead of null
      }
    };

    return createAndValidateQuestion("url", questionData, QuestionSchemaMap['url']);
  },

  currency: (json, input) => {
    const questionData: QuestionTypeMap['currency'] = {
      ...json,
      type: "currency",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.attributes?.max ?? 10000000, // Optional maximum value
        min: input?.attributes?.min ?? 0,
        step: input?.attributes?.step ?? 1,
      },
    };

    return createAndValidateQuestion("currency", questionData, QuestionSchemaMap['currency']);
  },
  date: (json, input) => {
    const questionData: QuestionTypeMap['date'] = {
      ...json,
      type: "date",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.max ?? null,
        min: input?.min ?? "1900-01-01",
        step: input?.step ?? 1,
      },
    };

    return createAndValidateQuestion("datePicker", questionData, QuestionSchemaMap['date']);
  },
  dateRange: (json, input) => {
    const startCol = input?.columns?.start?.attributes || {};
    const endCol = input?.columns?.end?.attributes || {};

    const questionData: QuestionTypeMap['dateRange'] = {
      ...json,
      type: "dateRange",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      columns: {
        end: {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "date",
          attributes: {
            max: endCol.max ?? null,
            min: endCol.min ?? null,
            step: endCol.step ?? 1,
            label: endCol.label ?? "From",
          },
        },
        start: {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "date",
          attributes: {
            max: startCol.max ?? null,
            min: startCol.min ?? null,
            step: startCol.step ?? 1,
            label: startCol.label ?? "To",
          },
        },
      },
    };

    return createAndValidateQuestion("dateRange", questionData, QuestionSchemaMap['dateRange']);
  },
  email: (json, input) => {
    const questionData: QuestionTypeMap['email'] = {
      ...json,
      type: "email",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        pattern: input?.pattern ?? "^.+$",
        multiple: input?.multiple ?? false,
        maxLength: input?.maxLength ?? 100,
        minLength: input?.minLength ?? 0,
      },
    };

    return createAndValidateQuestion("email", questionData, QuestionSchemaMap['email']);
  },
  filteredSearch: (json, input: {
    query?: string;
    queryId?: string;
    variables?: QuestionTypeMap['filteredSearch']['graphQL']['variables'];
    answerField?: string;
    displayFields?: QuestionTypeMap['filteredSearch']["graphQL"]["displayFields"];
    responseField?: string;
  }) => {
    const questionData: QuestionTypeMap = {
      ...json,
      type: "filteredSearch",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      graphQL: {
        query: input?.query ?? "",
        queryId: input?.queryId ?? "",
        variables: input?.variables?.map(variable => ({
          name: variable.name ?? "",
          type: variable.type ?? "string",
          label: variable.label ?? "",
          minLength: variable.minLength ?? 0,
          labelTranslationKey: variable.labelTranslationKey ?? null,
        })) ?? [],
        answerField: input?.answerField ?? "",
        displayFields: input?.displayFields?.map(field => ({
          label: field.label ?? "",
          propertyName: field.propertyName ?? "",
          labelTranslationKey: field.labelTranslationKey ?? null,
        })) ?? [],
        responseField: input?.responseField ?? "",
      },
    };

    return createAndValidateQuestion("filteredSearch", questionData, QuestionSchemaMap['filteredSearch']);
  },
  number: (json, input) => {
    const questionData: QuestionTypeMap['number'] = {
      ...json,
      type: "number",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      attributes: {
        ...json.attributes,
        max: input?.attributes?.max ?? null,
        min: input?.attributes?.min ?? 0,
        step: input?.attributes?.step ?? 1,
      },
    };

    return createAndValidateQuestion("number", questionData, QuestionSchemaMap['number']);
  },
  numberRange: (json, input) => {
    const startCol = input?.columns?.start?.attributes || {};
    const endCol = input?.columns?.end?.attributes || {};
    const questionData: QuestionTypeMap['numberRange'] = {
      ...json,
      type: "numberRange",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      columns: {
        end: {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "number",
          attributes: {
            max: endCol.max ?? null,
            min: endCol.min ?? null,
            step: endCol.step ?? 1,
            label: endCol.label ?? "From",
          },
        },
        start: {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "number",
          attributes: {
            max: startCol.max ?? null,
            min: startCol.min ?? null,
            step: startCol.step ?? 1,
            label: startCol.label ?? "To"
          },
        },
      },
    };

    return createAndValidateQuestion("numberRange", questionData, QuestionSchemaMap['numberRange']);
  },
  table: (json, input: {
    columns?: QuestionTypeMap['table']['columns'];
    attributes?: QuestionTypeMap['table']["attributes"];
  }) => {
    const questionData: QuestionTypeMap['table'] = {
      ...json,
      type: "table",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      columns: input?.columns?.map(column => ({
        heading: column.heading,
        content: {
          meta: {
            schemaVersion: CURRENT_SCHEMA_VERSION,
          },
          type: "text",
          attributes: {
            maxLength: column.content?.type === "text" && column.content.attributes?.maxLength !== undefined
              ? column.content.attributes.maxLength
              : 100, // Default to 100 if not defined
            minLength: column.content?.type === "text" && column.content.attributes?.minLength !== undefined
              ? column.content.attributes.minLength
              : 1, // Default to 1 if not defined
          },
        },
      })) || [],
      attributes: {
        maxRows: input?.attributes?.maxRows ?? 10, // Use number, not null
        minRows: input?.attributes?.minRows ?? 1,  // Use number, not null
        canAddRows: input?.attributes?.canAddRows ?? true,
        initialRows: input?.attributes?.initialRows ?? 1,
        canRemoveRows: input?.attributes?.canRemoveRows ?? true,
      },
    };

    return createAndValidateQuestion("table", questionData, QuestionSchemaMap['table']);
  },
  typeaheadSearch: (json, input: {
    query?: string;
    queryId?: string;
    variables?: QuestionTypeMap['typeaheadSearch']["graphQL"]["variables"];
    answerField?: string;
    displayFields?: QuestionTypeMap['typeaheadSearch']["graphQL"]["displayFields"];
    responseField?: string;
  }) => {
    const existingGraphQL = json.graphQL || {};

    const questionData: QuestionTypeMap['typeaheadSearch'] = {
      ...json,
      type: "typeaheadSearch",
      meta: {
        ...json.meta,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
      graphQL: {
        query: input?.query ?? existingGraphQL.query ?? "",
        queryId: input?.queryId ?? existingGraphQL.queryId ?? "",
        responseField: input?.responseField ?? existingGraphQL.responseField ?? "",
        answerField: input?.answerField ?? existingGraphQL.answerField ?? "",
        variables: input?.variables
          ? input.variables.map(variable => ({
            name: variable.name ?? "",
            type: variable.type ?? "string",
            label: variable.label ?? "",
            minLength: variable.minLength ?? 0,
            defaultValue: variable.defaultValue ?? "",
            labelTranslationKey: variable.labelTranslationKey ?? null,
          }))
          : existingGraphQL.variables ?? [],
        displayFields: input?.displayFields
          ? input.displayFields.map(field => ({
            propertyName: field.propertyName ?? "",
            label: field.label ?? "",
            labelTranslationKey: field.labelTranslationKey ?? null,
          }))
          : existingGraphQL.displayFields ?? [],
      },
    };

    return createAndValidateQuestion("typeaheadSearch", questionData, QuestionSchemaMap['typeaheadSearch']);
  },
};
