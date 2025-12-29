import { CURRENT_SCHEMA_VERSION, DefaultResearchOutputTableQuestion } from '@dmptool/types';
import {
  RESEARCH_OUTPUT_QUESTION_TYPE,
  RO_TITLE_ID,
  RO_DESCRIPTION_ID,
  RO_OUTPUT_TYPE_ID,
  RO_DATA_FLAGS_ID,
  RO_REPO_SELECTOR_ID,
  RO_METADATA_STANDARD_SELECTOR_ID,
  RO_LICENSES_ID,
  RO_ACCESS_LEVELS_ID,
  REPOSITORY_SEARCH_ID,
  METADATA_STANDARD_SEARCH_ID
} from '@/lib/constants';
import { getDefaultAnswerForType } from '@/utils/researchOutputTable';
import {
  AnyParsedQuestion,
  StandardField,
  MetaDataConfig,
  OutputTypeInterface,
  AccessLevelInterface,
  ResearchOutputTable
} from '@/app/types';

type AdditionalFieldsType = {
  id: string;
  label: string;
  enabled: boolean;
  defaultValue: string;
  customLabel: string;
  helpText: string;
  maxLength: string;
};

type ResearchOutputState = {
  standardFields: StandardField[];
  additionalFields: AdditionalFieldsType[];
  expandedFields: string[];
};

// Standard field identifiers that we recognize
const standardKeys = new Set([
  'researchOutput.title',
  'researchOutput.description',
  'researchOutput.outputType',
  'researchOutput.dataFlags',
  'researchOutput.repositories',
  'researchOutput.metadataStandards',
  'researchOutput.licenses',
  'researchOutput.accessLevels',
  'Data Flags',
  'Title',
  'Description',
  'Output Type',
  'Repositories',
  'Metadata Standards',
  'Licenses',
  'Initial Access Levels',
]);

// Create a mapping from field IDs to default columns
const DEFAULT_COLUMNS_MAP = {
  title: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Title'),
  description: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Description'),
  outputType: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Type'),
  dataFlags: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Data Flags'),
  accessLevels: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Access Level'),
  repositories: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Repository(ies)'),
  metadataStandards: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Metadata Standard(s)'),
  licenses: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'License'),
};

/**
 * Creates an empty research output row with default values
 * Handles preferences for repositories and metadata standards
 */
export const createEmptyResearchOutputRow = (
  columns: typeof DefaultResearchOutputTableQuestion['columns']
): ResearchOutputTable => {
  return {
    columns: [
      ...columns.map(col => {
        const schemaVersion = col.content?.meta?.schemaVersion || CURRENT_SCHEMA_VERSION;
        const baseAnswer = getDefaultAnswerForType(col.content.type, schemaVersion);

        // Handle repositorySearch with preferences
        if (col.content.type === REPOSITORY_SEARCH_ID) {
          const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences)
            ? col.preferences : undefined;
          if (colRepoPreferences && colRepoPreferences.length > 0) {
            return {
              type: "repositorySearch" as const,
              meta: baseAnswer.meta,
              answer: colRepoPreferences.map((pref: any) => ({
                repositoryId: pref.value,
                repositoryName: pref.label
              }))
            };
          }
        }

        // Handle metadataStandardSearch with preferences
        if (col.content.type === METADATA_STANDARD_SEARCH_ID) {
          const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences)
            ? col.preferences : undefined;
          if (colStdPreferences && colStdPreferences.length > 0) {
            return {
              type: "metadataStandardSearch" as const,
              meta: baseAnswer.meta,
              answer: colStdPreferences.map((pref: any) => ({
                metadataStandardId: String(pref.value),
                metadataStandardName: pref.label
              }))
            };
          }
        }

        return baseAnswer;
      }),
      getDefaultAnswerForType("date", CURRENT_SCHEMA_VERSION),
      getDefaultAnswerForType("numberWithContext", CURRENT_SCHEMA_VERSION)
    ]
  };
};


/**
 * Extracts display information from a research output row
 * Used for showing row summaries in list views
 */
export const getRowDisplayInfo = (
  row: ResearchOutputTable,
  columns: any[]
): { title: string; outputType: string; repositories: string[] } => {
  const titleIndex = columns.findIndex(col =>
    col.heading.toLowerCase() === 'title'
  );

  const outputTypeIndex = columns.findIndex(col =>
    col.heading.toLowerCase() === 'output type'
  );

  const repoIndex = columns.findIndex(col =>
    col.heading.toLowerCase() === 'repositories'
  );

  // Extract title
  let title = 'Untitled Research Output';
  if (titleIndex !== -1 && row.columns[titleIndex]) {
    const titleAnswer = row.columns[titleIndex].answer;
    if (typeof titleAnswer === 'string' && titleAnswer.trim()) {
      const stripped = titleAnswer.replace(/<[^>]*>/g, '');
      title = stripped.length > 50 ? stripped.substring(0, 50) + '...' : stripped;
    }
  }

  // Extract output type
  const outputType = outputTypeIndex !== -1 &&
    row.columns[outputTypeIndex] &&
    typeof row.columns[outputTypeIndex].answer === 'string'
    ? row.columns[outputTypeIndex].answer
    : '';

  // Extract repositories
  const repositories = repoIndex !== -1 &&
    Array.isArray(row.columns[repoIndex]?.answer)
    ? row.columns[repoIndex].answer.map((repo: any) => repo.repositoryName)
    : [];

  return { title, outputType, repositories };
};

// Type guard for metaDataConfig
const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
  return field.metaDataConfig !== undefined;
};

/**
 * Helper function to build a column from default backend schema with field overrides
 */
const buildColumnFromDefault = (
  fieldId: keyof typeof DEFAULT_COLUMNS_MAP,
  field: StandardField,
  contentOverrides: any = {}
) => {
  const defaultColumn = DEFAULT_COLUMNS_MAP[fieldId];

  if (!defaultColumn) {
    throw new Error(`No default column found for ${fieldId}`);
  }

  return {
    heading: field.label || defaultColumn.heading,
    required: field.required ?? defaultColumn.required,
    enabled: field.enabled ?? defaultColumn.enabled ?? false,
    help: defaultColumn.help,
    content: {
      type: defaultColumn.content.type,
      meta: { ...defaultColumn.content.meta },
      attributes: {
        ...defaultColumn.content.attributes,
        ...(field.helpText && { help: field.helpText }),
        ...(field.label && { label: field.label }),
        ...(field.languageTranslationKey && { labelTranslationKey: field.languageTranslationKey }),
        ...contentOverrides.attributes,
      },
      ...(('options' in defaultColumn.content) && { options: defaultColumn.content.options }),
      ...(('graphQL' in defaultColumn.content) && { graphQL: defaultColumn.content.graphQL }),
      ...contentOverrides
    }
  };
};

/**
 * Transforms internal state (standardFields + additionalFields) into the JSON structure
 * that conforms to ResearchOutputTableQuestion schema
 */
export const stateToJSON = (
  standardFields: StandardField[],
  additionalFields: AdditionalFieldsType[],
  defaultResearchOutputTypesData?: any
): AnyParsedQuestion => {
  const columns: any[] = [];

  standardFields.forEach(field => {
    if (!field.enabled) return;

    switch (field.id) {
      case RO_TITLE_ID:
        columns.push(buildColumnFromDefault('title', field, {
          attributes: {
            maxLength: field.maxLength ? Number(field.maxLength) : 500,
          }
        }));
        break;

      case RO_DESCRIPTION_ID:
        const overrides = field.maxLength
          ? { attributes: { maxLength: Number(field.maxLength) } }
          : {};
        columns.push(buildColumnFromDefault('description', field, overrides));
        break;

      case RO_OUTPUT_TYPE_ID: {
        const outputTypeOptions: any[] = [];
        if (field.outputTypeConfig?.mode === 'defaults' || !field.outputTypeConfig?.mode) {
          field.outputTypeConfig?.selectedDefaults?.forEach(defaultType => {
            const backendType = defaultResearchOutputTypesData?.defaultResearchOutputTypes?.find(
              (item: any) => item?.name === defaultType
            );
            outputTypeOptions.push({
              label: defaultType,
              value: backendType?.value || defaultType.toLowerCase().replace(/\s+/g, '-'),
              selected: false
            });
          });
        }
        if (field.outputTypeConfig?.mode === 'mine') {
          field.outputTypeConfig?.customTypes?.forEach((customType: OutputTypeInterface) => {
            outputTypeOptions.push({
              label: customType.type || '',
              value: customType.type?.toLowerCase().replace(/\s+/g, '-') || '',
              selected: false
            });
          });
        }

        columns.push(buildColumnFromDefault('outputType', field, {
          options: outputTypeOptions
        }));
        break;
      }

      case RO_DATA_FLAGS_ID: {
        const defaultColumn = DEFAULT_COLUMNS_MAP.dataFlags;
        if (!defaultColumn) break;

        const baseContent = field.content || {
          type: defaultColumn.content.type,
          meta: defaultColumn.content.meta,
          attributes: defaultColumn.content.attributes,
          ...('options' in defaultColumn.content && { options: defaultColumn.content.options })
        };

        columns.push({
          heading: field.label || defaultColumn.heading,
          required: field.required ?? defaultColumn.required ?? false,
          enabled: field.enabled ?? false,
          help: defaultColumn.help,
          content: {
            ...baseContent,
            attributes: {
              ...baseContent.attributes,
              ...(field.languageTranslationKey && { labelTranslationKey: field.languageTranslationKey }),
            }
          }
        });
        break;
      }

      case RO_REPO_SELECTOR_ID: {
        const defaultColumn = DEFAULT_COLUMNS_MAP.repositories;
        const repoColumn: any = {
          heading: field.label || defaultColumn?.heading,
          required: field.required ?? defaultColumn?.required ?? false,
          enabled: field.enabled ?? false,
          help: defaultColumn?.help,
          content: {
            ...defaultColumn?.content,
            attributes: {
              ...defaultColumn?.content?.attributes,
              ...(field.languageTranslationKey && { labelTranslationKey: field.languageTranslationKey }),
              label: field.label || defaultColumn?.heading,
              help: field.helpText || defaultColumn?.content?.attributes?.help || '',
            }
          }
        };

        if (field.repoConfig?.customRepos && field.repoConfig.customRepos.length > 0) {
          repoColumn.preferences = field.repoConfig.customRepos.map(repo => ({
            label: repo.name,
            value: repo.uri || ''
          }));
        }
        columns.push(repoColumn);
        break;
      }

      case RO_METADATA_STANDARD_SELECTOR_ID: {
        const defaultColumn = DEFAULT_COLUMNS_MAP.metadataStandards;
        const metadataColumn: any = {
          heading: field.label || defaultColumn?.heading,
          required: field.required ?? defaultColumn?.required ?? false,
          enabled: field.enabled ?? false,
          content: {
            ...defaultColumn?.content,
            attributes: {
              ...defaultColumn?.content?.attributes,
              ...(field.languageTranslationKey && { labelTranslationKey: field.languageTranslationKey }),
              label: field.label || defaultColumn?.heading,
              help: field.helpText || defaultColumn?.content?.attributes?.help || ''
            }
          }
        };

        if (hasMetaDataConfig(field) && field.metaDataConfig?.customStandards && field.metaDataConfig.customStandards.length > 0) {
          metadataColumn.preferences = field.metaDataConfig.customStandards.map(standard => ({
            label: standard.name,
            value: standard.uri || (standard as any).url || ''
          }));
        }
        columns.push(metadataColumn);
        break;
      }

      case RO_LICENSES_ID: {
        const defaultColumn = DEFAULT_COLUMNS_MAP.licenses;
        const licenseColumn: any = {
          heading: field.label || defaultColumn?.heading,
          required: field.required ?? defaultColumn?.required ?? false,
          enabled: field.enabled ?? false,
          content: {
            ...defaultColumn?.content,
            attributes: {
              ...defaultColumn?.content?.attributes,
              ...(field.languageTranslationKey && { labelTranslationKey: field.languageTranslationKey }),
              label: field.label || defaultColumn?.heading,
              help: field.helpText || defaultColumn?.content?.attributes?.help || ''
            }
          }
        };

        if (field.licensesConfig?.mode === 'addToDefaults' && field.licensesConfig?.customTypes && field.licensesConfig.customTypes.length > 0) {
          licenseColumn.preferences = field.licensesConfig.customTypes.map(license => ({
            label: license.name,
            value: license.uri || ''
          }));
        } else {
          licenseColumn.preferences = [];
        }

        columns.push(licenseColumn);
        break;
      }

      case RO_ACCESS_LEVELS_ID: {
        const accessLevelOptions: any[] = [];
        if (field.accessLevelsConfig?.mode === 'defaults' || !field.accessLevelsConfig?.mode) {
          field.accessLevelsConfig?.selectedDefaults?.forEach(level => {
            accessLevelOptions.push({
              label: level,
              value: level,
              selected: false
            });
          });
        }
        if (field.accessLevelsConfig?.mode === 'mine') {
          field.accessLevelsConfig?.customLevels?.forEach((customLevel: AccessLevelInterface) => {
            accessLevelOptions.push({
              label: customLevel.label,
              value: customLevel.value,
              selected: false
            });
          });
        }

        columns.push(buildColumnFromDefault('accessLevels', field, {
          options: accessLevelOptions
        }));
        break;
      }
    }
  });

  // Add additional (custom) fields
  additionalFields.forEach(customField => {
    if (customField.enabled) {
      columns.push({
        heading: customField.customLabel || customField.label,
        content: {
          type: 'text',
          attributes: {
            label: customField.customLabel || customField.label,
            help: customField.helpText || '',
            maxLength: customField.maxLength ? Number(customField.maxLength) : undefined,
            defaultValue: customField.defaultValue || undefined
          }
        }
      });
    }
  });

  return {
    type: RESEARCH_OUTPUT_QUESTION_TYPE,
    columns,
    meta: DefaultResearchOutputTableQuestion.meta,
    attributes: {
      canAddRows: DefaultResearchOutputTableQuestion.attributes?.canAddRows ?? true,
      canRemoveRows: DefaultResearchOutputTableQuestion.attributes?.canRemoveRows ?? true,
      initialRows: DefaultResearchOutputTableQuestion.attributes?.initialRows ?? 1,
      label: DefaultResearchOutputTableQuestion.attributes?.label ?? '',
      help: DefaultResearchOutputTableQuestion.attributes?.help ?? '',
    }
  } as AnyParsedQuestion;
};

/**
 * Transforms JSON (from saved question) back into internal state structure
 * This is the inverse of stateToJSON
 */
export const jsonToState = (
  parsed: AnyParsedQuestion | null,
  initialStandardFields: StandardField[]
): ResearchOutputState => {
  if (!parsed || parsed.type !== RESEARCH_OUTPUT_QUESTION_TYPE || !Array.isArray(parsed.columns)) {
    return {
      standardFields: initialStandardFields,
      additionalFields: [],
      expandedFields: ['title', 'outputType'],
    };
  }

  // Helper to find a column by heading
  const findColumn = (keys: string[]) =>
    parsed.columns.find((col: any) =>
      col?.heading && keys.includes(col.heading)
    );

  // Hydrate standard fields
  const hydratedStandardFields = initialStandardFields.map((field) => {
    const updated = { ...field };

    switch (field.id) {
      case RO_REPO_SELECTOR_ID: {
        const col = findColumn(['researchOutput.repositories', 'Repositories']);
        if (col && 'preferences' in col) {
          updated.enabled = !!col.enabled;
          updated.helpText = col.content.attributes?.help || '';
          updated.repoConfig = {
            ...updated.repoConfig,
            customRepos: col.preferences.map((repo: any) => ({
              name: repo.label,
              uri: repo.value
            })),
            hasCustomRepos: col?.preferences.length > 0,
          };
        }
        break;
      }

      case RO_ACCESS_LEVELS_ID: {
        const col = findColumn(['researchOutput.accessLevels', 'Initial Access Levels']);
        if (col && col.enabled === true) {
          updated.enabled = col.enabled;
          updated.helpText = col.content.attributes?.help || '';
        }
        break;
      }

      case RO_METADATA_STANDARD_SELECTOR_ID: {
        const col = findColumn(['researchOutput.metadataStandards', 'Metadata Standards']);
        if (col && 'preferences' in col) {
          updated.enabled = !!col.enabled;
          updated.helpText = col.content.attributes?.help || '';
          updated.metaDataConfig = {
            ...updated.metaDataConfig,
            customStandards: col.preferences.map((std: any) => ({
              name: std.label,
              uri: std.value
            })),
            hasCustomStandards: col?.preferences.length > 0,
          };
        }
        break;
      }

      case RO_LICENSES_ID: {
        const col = findColumn(['researchOutput.licenses', 'Licenses']);
        if (col && 'preferences' in col) {
          updated.enabled = !!col.enabled;
          updated.helpText = col.content.attributes?.help || '';
          updated.licensesConfig = {
            ...updated.licensesConfig,
            mode: col?.preferences.length > 0 ? 'addToDefaults' : 'defaults',
            customTypes: col.preferences.map((lic: any) => ({
              name: lic.label,
              uri: lic.value
            })),
            selectedDefaults: updated.licensesConfig?.selectedDefaults || [],
          };
        }
        break;
      }

      case RO_OUTPUT_TYPE_ID: {
        const col = findColumn(['researchOutput.outputType', 'Output Type']);
        if (col && col.content && 'options' in col.content && col?.content?.options.length > 0) {
          updated.enabled = !!col.enabled;
          updated.outputTypeConfig = {
            ...updated.outputTypeConfig,
            mode: 'mine',
            customTypes: col.content.options.map((opt: any) => ({ type: opt.label, description: '' })),
            selectedDefaults: [],
          };
        }
        break;
      }

      case RO_DATA_FLAGS_ID: {
        const dataFlagsCol = findColumn(['researchOutput.dataFlags', 'Data Flags']);
        if (dataFlagsCol) {
          updated.enabled = !!dataFlagsCol.enabled;
          updated.helpText = dataFlagsCol.content?.attributes?.help || '';
          if (dataFlagsCol.content) {
            updated.content = dataFlagsCol.content;
          }
        }
        break;
      }

      case RO_TITLE_ID:
      case RO_DESCRIPTION_ID: {
        const col = findColumn([
          field.id === RO_TITLE_ID ? 'researchOutput.title' : 'researchOutput.description',
          field.id === RO_TITLE_ID ? 'Title' : 'Description',
        ]);
        if (col) {
          updated.enabled = !!col.enabled;
          updated.helpText = col.content?.attributes?.help || updated.helpText;
          updated.required = !!col.required;
        }
        break;
      }
    }

    return updated;
  });

  // Hydrate additional fields (custom columns)
  const customCols = parsed.columns.filter((col: any) => {
    const isStandard = (col?.heading && standardKeys.has(col.heading));
    return !isStandard;
  });

  function hasDefaultValue(attr: any): attr is { defaultValue: string } {
    return attr && typeof attr.defaultValue !== 'undefined';
  }

  function hasMaxLength(attr: any): attr is { maxLength: string } {
    return attr && typeof attr.maxLength !== 'undefined';
  }

  const hydratedAdditionalFields = customCols.map((col: any, idx: number) => ({
    id: col.heading?.toLowerCase().replace(/\s+/g, '_') || `custom_field_${idx}`,
    label: col.heading || `Custom Field ${idx + 1}`,
    enabled: !!col.enabled,
    defaultValue: hasDefaultValue(col.content?.attributes) ? col.content.attributes.defaultValue : '',
    customLabel: col.heading || '',
    helpText: col.content?.attributes?.help || '',
    maxLength: hasMaxLength(col.content?.attributes) ? col.content.attributes.maxLength : '',
  }));

  // Hydrate expanded fields
  const hydratedExpandedFields = [
    ...parsed.columns
      .filter((col: any) => col.enabled)
      .map((col: any) => {
        const key = col?.heading;
        switch (key) {
          case 'researchOutput.title': return 'title';
          case 'researchOutput.description': return 'description';
          case 'researchOutput.outputType': return 'outputType';
          case 'researchOutput.dataFlags': return 'dataFlags';
          case 'researchOutput.repositories': return 'repoSelector';
          case 'researchOutput.metadataStandards': return 'metadataStandards';
          case 'researchOutput.licenses': return 'licenses';
          case 'researchOutput.accessLevels': return 'accessLevels';
          default:
            return col.heading?.toLowerCase().replace(/\s+/g, '_');
        }
      })
  ];

  return {
    standardFields: hydratedStandardFields,
    additionalFields: hydratedAdditionalFields,
    expandedFields: hydratedExpandedFields,
  };
};