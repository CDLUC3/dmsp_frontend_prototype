'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DefaultResearchOutputTableQuestion } from '@dmptool/types';
import {
  AccessLevelInterface,
  AnyParsedQuestion,
  OutputTypeInterface,
  StandardField,
  MetaDataConfig,
  RepositoryInterface,
  MetaDataStandardInterface,
} from '@/app/types';

// GraphQL queries and mutations
import {
  useLicensesQuery,
  useDefaultResearchOutputTypesQuery,
} from '@/generated/graphql';

// Constants
import {
  RO_TITLE_ID,
  RO_OUTPUT_TYPE_ID,
  RO_DATA_FLAGS_ID,
  RO_REPO_SELECTOR_ID,
  RO_METADATA_STANDARD_SELECTOR_ID,
  RESEARCH_OUTPUT_QUESTION_TYPE,
  RO_DESCRIPTION_ID,
  RO_LICENSES_ID,
  RO_ACCESS_LEVELS_ID,
} from '@/lib/constants';

type AdditionalFieldsType = {
  id: string;
  label: string;
  enabled: boolean;
  defaultValue: string;
  customLabel: string;
  helpText: string;
  maxLength: string;
}
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

// Custom hook for research output table
export const useResearchOutputTable = ({ setHasUnsavedChanges, announce }: { setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>, announce: (message: string) => void }) => {

  // Query request for all licenses
  const { data: licensesData } = useLicensesQuery();

  // Query request for default research output types
  const { data: defaultResearchOutputTypesData } = useDefaultResearchOutputTypesQuery();

  // localization keys
  const QuestionAdd = useTranslations('QuestionAdd');

  // Type guard function to check if a field has metaDataConfig
  const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
    return field.metaDataConfig !== undefined;
  };

  const initialStandardFields: StandardField[] = [
    {
      id: RO_TITLE_ID,
      label: QuestionAdd('researchOutput.labels.title'),
      enabled: true,
      required: true
    },
    {
      id: RO_DESCRIPTION_ID,
      label: QuestionAdd('researchOutput.labels.description'),
      enabled: false,
      placeholder: '',
      helpText: '',
      maxLength: '',
      required: true,
      value: ''
    },
    {
      id: RO_OUTPUT_TYPE_ID,
      label: QuestionAdd('researchOutput.labels.outputType'),
      enabled: true,
      helpText: '',
      required: true,
      outputTypeConfig: {
        mode: 'defaults' as 'defaults' | 'mine',
        selectedDefaults: [] as string[],
        customTypes: [] as OutputTypeInterface[],
      }
    },
    {
      id: RO_DATA_FLAGS_ID,
      label: QuestionAdd('researchOutput.labels.dataFlags'),
      enabled: false,
      required: false,
      heading: 'Data Flags',
      helpText: 'Mark all of the statements that are true about the dataset',
      content: {
        type: 'checkBoxes',
        meta: { schemaVersion: '1.0' },
        attributes: {},
        options: [
          {
            label: 'May contain sensitive data?',
            value: 'sensitive',
            checked: false
          },
          {
            label: 'May contain personally identifiable information?',
            value: 'personal',
            checked: false
          }
        ]
      }
    },
    {
      id: RO_REPO_SELECTOR_ID,
      label: QuestionAdd('researchOutput.labels.repositories'),
      enabled: false,
      placeholder: '',
      helpText: '',
      value: '',
      repoConfig: {
        hasCustomRepos: false,
        customRepos: [] as RepositoryInterface[],
      }
    },
    {
      id: RO_METADATA_STANDARD_SELECTOR_ID,
      label: QuestionAdd('researchOutput.labels.metadataStandards'),
      enabled: false,
      helpText: '',
      metaDataConfig: {
        hasCustomStandards: false,
        customStandards: [] as MetaDataStandardInterface[],
      }
    },
    {
      id: RO_LICENSES_ID,
      label: QuestionAdd('researchOutput.labels.licenses'),
      enabled: false,
      defaultValue: '',
      helpText: '',
      licensesConfig: {
        mode: 'defaults' as 'defaults' | 'addToDefaults',
        selectedDefaults: [] as string[],
        customTypes: [] as { name: string; uri: string }[]
      }
    },
    {
      id: RO_ACCESS_LEVELS_ID,
      label: QuestionAdd('researchOutput.labels.initialAccessLevels'),
      enabled: false,
      defaultValue: '',
      helpText: '',
      accessLevelsConfig: {
        mode: 'defaults' as 'defaults' | 'mine',
        selectedDefaults: [] as string[],
        customLevels: [] as AccessLevelInterface[],
      }
    },
  ];

  // Create a mapping from field IDs to default columns
  const DEFAULT_COLUMNS_MAP = {
    title: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Title'),
    description: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Description'),
    outputType: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Type'),
    dataFlags: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Data Flags'),
    accessLevels: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Access Level'),
    releaseDate: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Anticipated Release Date'),
    byteSize: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Byte Size'),
    repositories: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Repository(ies)'),
    metadataStandards: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'Metadata Standard(s)'),
    licenses: DefaultResearchOutputTableQuestion.columns.find(col => col.heading === 'License'),
  };

  // States for Research Output table question type
  // Which fields are expanded for customization
  const [expandedFields, setExpandedFields] = useState<string[]>(['title', 'outputType']);
  // Which fields cannot be customized
  const nonCustomizableFieldIds = ['accessLevels'];
  // Standard fields for research output questions
  const [standardFields, setStandardFields] = useState(initialStandardFields);
  // Additional fields for research output questions
  const [additionalFields, setAdditionalFields] = useState<AdditionalFieldsType[]>([]);
  // State for managing custom output types
  const [newOutputType, setNewOutputType] = useState<OutputTypeInterface>({ type: '', description: '' });
  // State for managing custom license types
  const [newLicenseType, setNewLicenseType] = useState<string>('');


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

    const result = {
      heading: field.label || defaultColumn.heading,
      required: field.required ?? defaultColumn.required,
      enabled: field.enabled ?? defaultColumn.enabled ?? false,
      help: defaultColumn.help,
      content: {
        type: defaultColumn.content.type,
        meta: defaultColumn.content.meta,
        attributes: {
          ...defaultColumn.content.attributes,
          ...(field.helpText && { help: field.helpText }),
          ...(field.label && { label: field.label }),
          ...contentOverrides.attributes,
        },
        ...(('options' in defaultColumn.content) && { options: defaultColumn.content.options }),
        ...(('graphQL' in defaultColumn.content) && { graphQL: defaultColumn.content.graphQL }),
        ...contentOverrides
      }
    };

    return result;
  };

  /**
   * Build form state for research output table questions.
   * 
   * Constructs a table-based question structure conforming to ResearchOutputTableQuestion schema
   * from @dmptool/types. Each enabled standardField is converted into a table column with
   * appropriate field types:
   * 
   * - title: text field (always required)
   * - description: textArea with rich text support
   * - outputType: selectBox with configured options
   * - dataFlags: boolean fields for sensitive/personal data flags
   * - repoSelector: repositorySearch with GraphQL query
   * - metadataStandards: metadataStandardSearch with GraphQL query
   * - licenses: licenseSearch with GraphQL query (not selectBox)
   * - accessLevels: selectBox with access level options
   * - additionalFields: custom text fields
   * 
   * This function prepares the user input structure that will be passed to the
   * researchOutputTable handler in questionTypeHandlers for final validation.
   */
  const buildResearchOutputFormState = (parsed: AnyParsedQuestion | null) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
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
          columns.push(buildColumnFromDefault('description', field, {
            attributes: {
              // Don't override maxLength here, let it come from field or default
              ...(field.maxLength && { maxLength: Number(field.maxLength) })
            }
          }));
          break;

        case RO_OUTPUT_TYPE_ID: {
          const outputTypeOptions: any[] = [];
          if (field.outputTypeConfig?.mode === 'defaults' || !field.outputTypeConfig?.mode) {
            field.outputTypeConfig?.selectedDefaults?.forEach(defaultType => {
              const backendType = defaultResearchOutputTypesData?.defaultResearchOutputTypes?.find(
                (item) => item?.name === defaultType
              );
              outputTypeOptions.push({
                label: defaultType,
                value: backendType?.value || defaultType.toLowerCase().replace(/\s+/g, '-'),
                selected: false
              });
            });
          }
          if (field.outputTypeConfig?.mode === 'mine') {
            field.outputTypeConfig?.customTypes?.forEach(customType => {
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

          columns.push({
            heading: field.label || defaultColumn.heading || QuestionAdd('researchOutput.labels.dataFlags'),
            required: field.required ?? defaultColumn.required ?? false,
            enabled: field.enabled ?? false,
            help: defaultColumn.help,
            content: field.content || {
              type: defaultColumn.content.type,
              meta: defaultColumn.content.meta,
              attributes: defaultColumn.content.attributes,
              ...('options' in defaultColumn.content && { options: defaultColumn.content.options })
            }
          });
          break;
        }


        case RO_REPO_SELECTOR_ID: {
          const defaultColumn = DEFAULT_COLUMNS_MAP.repositories;
          const repoColumn: any = {
            heading: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.repositories'),
            required: field.required ?? defaultColumn?.required ?? false,
            enabled: field.enabled ?? false,
            help: defaultColumn?.help,
            content: {
              ...defaultColumn?.content,
              attributes: {
                ...defaultColumn?.content?.attributes,
                label: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.repositories'),
                help: field.helpText || defaultColumn?.content?.attributes?.help || ''
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
            heading: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.metadataStandards'),
            required: field.required ?? defaultColumn?.required ?? false,
            enabled: field.enabled ?? false,
            content: {
              ...defaultColumn?.content,
              attributes: {
                ...defaultColumn?.content?.attributes,
                label: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.metadataStandards'),
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
            heading: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.licenses'),
            required: field.required ?? defaultColumn?.required ?? false,
            enabled: field.enabled ?? false,
            content: {
              ...defaultColumn?.content,
              attributes: {
                ...defaultColumn?.content?.attributes,
                label: field.label || defaultColumn?.heading || QuestionAdd('researchOutput.labels.licenses'),
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
            field.accessLevelsConfig?.customLevels?.forEach(customLevel => {
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
        // Override with parsed attributes if they exist
        ...(parsed && 'attributes' in parsed ? parsed.attributes : {}),
      }
    };
  };


  // Handle updates to RepositorySelectionSystem component
  const handleRepositoriesChange = (repos: RepositoryInterface[]) => {
    // Store the selected repositories in the field config
    const currentField = standardFields.find(f => f.id === 'repoSelector');
    if (currentField && currentField.repoConfig) {
      const wasEnabled = currentField.enabled;
      const previousCount = currentField.repoConfig.customRepos?.length || 0;
      updateStandardFieldProperty('repoSelector', 'repoConfig', {
        ...currentField.repoConfig,
        customRepos: repos
      });
      // Only enable if a repo is added and the box is currently unchecked
      if (!wasEnabled && repos.length > previousCount) {
        updateStandardFieldProperty('repoSelector', 'enabled', true);
      }

      // Announce the change
      if (repos.length > previousCount) {
        announce(QuestionAdd('researchOutput.announcements.repositoryAdded') || 'Repository added');
      } else if (repos.length < previousCount) {
        announce(QuestionAdd('researchOutput.announcements.repositoryRemoved') || 'Repository removed');
      }
    }

    setHasUnsavedChanges(true);
  };

  // Handle updates to MetaDataStandards component
  const handleMetaDataStandardsChange = (standards: MetaDataStandardInterface[]) => {
    // Store the selected metadata standards in the field config
    const currentField = standardFields.find(f => f.id === 'metadataStandards');
    if (currentField && currentField.metaDataConfig) {
      const wasEnabled = currentField.enabled;
      const previousCount = currentField.metaDataConfig.customStandards?.length || 0;
      updateStandardFieldProperty('metadataStandards', 'metaDataConfig', {
        ...currentField.metaDataConfig,
        customStandards: standards // Store metadata standard data
      });
      // Only enable if a standard is added and the box is currently unchecked
      if (!wasEnabled && standards.length > previousCount) {
        updateStandardFieldProperty('metadataStandards', 'enabled', true);
      }

      // Announce the change
      if (standards.length > previousCount) {
        announce(QuestionAdd('researchOutput.announcements.metadataStandardAdded') || 'Metadata standard added');
      } else if (standards.length < previousCount) {
        announce(QuestionAdd('researchOutput.announcements.metadataStandardRemoved') || 'Metadata standard removed');
      }
    }
    setHasUnsavedChanges(true);
  };

  // Shared function to update any property in standardFields
  const updateStandardFieldProperty = (fieldId: string, propertyName: string, value: unknown) => {
    setStandardFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, [propertyName]: value } : field
      )
    );
    setHasUnsavedChanges(true);
  };

  // Handler for standard field checkbox changes (for enabled property)
  const handleStandardFieldChange = (fieldId: string, enabled: boolean) => {

    updateStandardFieldProperty(fieldId, 'enabled', enabled);
    if (enabled === true) {
      setExpandedFields(prev => [...prev, fieldId]); //expanded
    }
    // Do NOT auto-collapse when unchecked

    // Announce the change
    const field = standardFields.find(f => f.id === fieldId);
    if (field) {
      const status = enabled ? 'enabled' : 'disabled';
      announce(`${field.label} ${status}`);
    }
  };

  // Handler for customize button clicks
  const handleCustomizeField = (fieldId: string) => {
    const wasExpanded = expandedFields.includes(fieldId);
    setExpandedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId) // collapse
        : [...prev, fieldId]                // expand
    );

    // Announce the change
    const field = standardFields.find(f => f.id === fieldId) || additionalFields.find(f => f.id === fieldId);
    if (field) {
      const status = wasExpanded ? 'collapsed' : 'expanded';
      announce(`${field.label} ${status}`);
    }
  };

  // Handler for toggling metadata standards
  const handleToggleMetaDataStandards = (hasCustomStandards: boolean) => {
    const currentField = standardFields.find(f => f.id === 'metadataStandards');
    if (currentField && currentField.metaDataConfig) {
      updateStandardFieldProperty('metadataStandards', 'metaDataConfig', {
        ...currentField.metaDataConfig,
        hasCustomStandards
      });
    }
  };

  // Handler for toggling preferred repositories
  const handleTogglePreferredRepositories = (hasCustomRepos: boolean) => {
    const currentField = standardFields.find(f => f.id === 'repoSelector');
    if (currentField && currentField.repoConfig) {
      updateStandardFieldProperty('repoSelector', 'repoConfig', {
        ...currentField.repoConfig,
        hasCustomRepos
      });
    }
  };

  // Handler for license mode changes (defaults, add to defaults)
  const handleLicenseModeChange = (mode: 'defaults' | 'addToDefaults') => {
    const currentField = standardFields.find(f => f.id === 'licenses');
    if (currentField && currentField.licensesConfig) {
      // When switching to 'addToDefaults' mode, pre-populate with recommended licenses if customTypes is empty
      const allLicenses = licensesData?.licenses?.items?.filter((license): license is NonNullable<typeof license> => license !== null) || [];
      const recommendedLicenses = allLicenses
        .filter(license => license.recommended)
        .map(license => ({ name: license.name, uri: license.uri }));

      const customTypes = mode === 'addToDefaults' && currentField.licensesConfig.customTypes.length === 0
        ? recommendedLicenses
        : currentField.licensesConfig.customTypes;

      updateStandardFieldProperty('licenses', 'licensesConfig', {
        ...currentField.licensesConfig,
        mode,
        customTypes
      });

      // Announce the change
      const modeText = mode === 'defaults' ? 'default licenses' : 'custom licenses';
      announce(QuestionAdd('researchOutput.announcements.licenseModeChanged', { mode: modeText }) || `License mode changed to ${modeText}`);
    }
  };

  // Handler for adding custom license types
  const handleAddCustomLicenseType = () => {
    if (newLicenseType.trim()) {
      const currentField = standardFields.find(f => f.id === 'licenses');
      if (currentField && currentField.licensesConfig) {
        // newLicenseType contains the URI, find the full license object
        const allLicenses = licensesData?.licenses?.items?.filter((license): license is NonNullable<typeof license> => license !== null) || [];
        const selectedLicense = allLicenses.find(license => license.uri === newLicenseType.trim());

        if (selectedLicense) {
          const updatedCustomTypes = [
            ...currentField.licensesConfig.customTypes,
            { name: selectedLicense.name, uri: selectedLicense.uri }
          ];
          updateStandardFieldProperty('licenses', 'licensesConfig', {
            ...currentField.licensesConfig,
            customTypes: updatedCustomTypes
          });
          setNewLicenseType('');
          announce(QuestionAdd('researchOutput.announcements.licenseAdded', { name: selectedLicense.name }) || `License ${selectedLicense.name} added`);
        }
      }
    }
  };

  // Handler for removing custom license types
  const handleRemoveCustomLicenseType = (nameToRemove: string) => {
    const currentField = standardFields.find(f => f.id === 'licenses');
    if (currentField && currentField.licensesConfig) {
      const updatedCustomTypes = currentField.licensesConfig.customTypes.filter(
        (license) => license.name !== nameToRemove
      );
      updateStandardFieldProperty('licenses', 'licensesConfig', {
        ...currentField.licensesConfig,
        customTypes: updatedCustomTypes
      });
      announce(QuestionAdd('researchOutput.announcements.licenseRemoved', { name: nameToRemove }) || `License ${nameToRemove} removed`);
    }
  };

  // Handler for output type mode changes (defaults, mine, add to defaults)
  const handleOutputTypeModeChange = (mode: 'defaults' | 'mine') => {
    const currentField = standardFields.find(f => f.id === 'outputType');
    if (currentField && currentField.outputTypeConfig) {
      // When switching to 'mine' mode, pre-populate with defaults if customTypes is empty
      // Transform backend data to match OutputTypeInterface structure
      const backendOutputTypes = defaultResearchOutputTypesData?.defaultResearchOutputTypes
        ?.filter((item): item is NonNullable<typeof item> => item !== null)
        .map(item => ({
          type: item.name,
          description: item.description || ''
        })) || [];

      const customTypes = mode === 'mine' && currentField.outputTypeConfig.customTypes.length === 0
        ? backendOutputTypes
        : currentField.outputTypeConfig.customTypes;

      updateStandardFieldProperty('outputType', 'outputTypeConfig', {
        ...currentField.outputTypeConfig,
        mode,
        customTypes
      });

      // Announce the change
      const modeText = mode === 'defaults' ? 'default output types' : 'custom output types';
      announce(QuestionAdd('researchOutput.announcements.outputTypeModeChanged', { mode: modeText }) || `Output type mode changed to ${modeText}`);
    }
  };

  // Handler for adding custom output types
  const handleAddCustomOutputType = () => {
    if (newOutputType.type && newOutputType.type.trim()) {
      const currentField = standardFields.find(f => f.id === 'outputType');
      if (currentField && currentField.outputTypeConfig) {
        // Add to customTypes array
        const updatedCustomTypes = [
          ...currentField.outputTypeConfig.customTypes,
          { type: newOutputType.type.trim(), description: newOutputType.description?.trim() || '' }
        ];

        updateStandardFieldProperty('outputType', 'outputTypeConfig', {
          ...currentField.outputTypeConfig,
          customTypes: updatedCustomTypes
        });

        // Clear the input fields
        const typeName = newOutputType.type.trim();
        setNewOutputType({ type: '', description: '' });
        announce(QuestionAdd('researchOutput.announcements.outputTypeAdded', { type: typeName }) || `Output type ${typeName} added`);
      }
    }
  };

  // Handler for removing custom output types
  const handleRemoveCustomOutputType = (typeToRemove: string) => {
    const currentField = standardFields.find(f => f.id === 'outputType');
    if (currentField && currentField.outputTypeConfig) {
      const updatedCustomTypes = currentField.outputTypeConfig.customTypes.filter(
        (customType: OutputTypeInterface) => customType.type !== typeToRemove
      );
      updateStandardFieldProperty('outputType', 'outputTypeConfig', {
        ...currentField.outputTypeConfig,
        customTypes: updatedCustomTypes
      });
      announce(QuestionAdd('researchOutput.announcements.outputTypeRemoved', { type: typeToRemove }) || `Output type ${typeToRemove} removed`);
    }
  };

  const addAdditionalField = () => {
    const newId = `custom_field_${Date.now()}`;
    const newField = {
      id: newId,
      label: 'Custom Field',
      enabled: true,
      defaultValue: '',
      customLabel: '',
      helpText: '',
      maxLength: ''
    };

    setAdditionalFields(prev => [...prev, newField]);
    setExpandedFields(prev => [...prev, newId]); // Auto-expand for editing
    setHasUnsavedChanges(true);
    announce(QuestionAdd('researchOutput.announcements.fieldAdded') || 'Field added');
  };

  // Handler for deleting additional fields
  const handleDeleteAdditionalField = (fieldId: string) => {
    setAdditionalFields(prev => prev.filter(field => field.id !== fieldId));
    setExpandedFields(prev => prev.filter(id => id !== fieldId));
    setHasUnsavedChanges(true);
    announce(QuestionAdd('researchOutput.announcements.fieldDeleted') || 'Field deleted');
  };

  // Handler for updating additional field properties
  const handleUpdateAdditionalField = (fieldId: string, propertyName: string, value: unknown) => {
    setAdditionalFields(prev =>
      prev.map(field => {
        return field.id === fieldId ? { ...field, [propertyName]: value } : field;
      })
    );
    setHasUnsavedChanges(true);
  };



  return {
    buildResearchOutputFormState,
    licensesData,
    defaultResearchOutputTypesData,
    standardKeys,
    expandedFields,
    nonCustomizableFieldIds,
    standardFields,
    additionalFields,
    newOutputType,
    setNewOutputType,
    newLicenseType,
    setNewLicenseType,
    handleRepositoriesChange,
    handleMetaDataStandardsChange,
    handleStandardFieldChange,
    handleCustomizeField,
    handleToggleMetaDataStandards,
    handleTogglePreferredRepositories,
    handleLicenseModeChange,
    handleAddCustomLicenseType,
    handleRemoveCustomLicenseType,
    handleOutputTypeModeChange,
    handleAddCustomOutputType,
    handleRemoveCustomOutputType,
    addAdditionalField,
    handleDeleteAdditionalField,
    handleUpdateAdditionalField,
    setStandardFields,
    setAdditionalFields,
    setExpandedFields,
    updateStandardFieldProperty
  };
};
