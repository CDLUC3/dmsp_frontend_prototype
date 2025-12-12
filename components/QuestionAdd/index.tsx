'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Form,
  Input,
  Label,
  Link,
  Radio,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField
} from "react-aria-components";

// GraphQL queries and mutations
import {
  useAddQuestionMutation,
  useQuestionsDisplayOrderQuery,
  useLicensesQuery,
  useDefaultResearchOutputTypesQuery,
} from '@/generated/graphql';

import {
  AccessLevelInterface,
  OutputTypeInterface
} from '@/app/types';

// Components
import PageHeader from "@/components/PageHeader";
import {
  FormInput,
  FormTextArea,
  RadioGroupComponent,
  RangeComponent,
  QuestionOptionsComponent,
  TypeAheadSearch,
  ResearchOutputComponent
} from '@/components/Form';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionPreview from '@/components/QuestionPreview';
import QuestionView from '@/components/QuestionView';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';

//Other
import { useToast } from '@/context/ToastContext';
import { stripHtmlTags } from '@/utils/general';
import { questionTypeHandlers } from '@/utils/questionTypeHandlers';
import { QuestionTypeMap } from "@dmptool/types";
import { routePath } from '@/utils/routes';
import { Question, QuestionOptions } from '@/app/types';
import {
  OPTIONS_QUESTION_TYPES,
  RANGE_QUESTION_TYPE,
  TYPEAHEAD_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE,
  RESEARCH_OUTPUT_QUESTION_TYPE
} from '@/lib/constants';
import {
  isOptionsType,
  getOverrides,
} from './hooks/useAddQuestion';

import {
  StandardField,
  MetaDataConfig,
  RepositoryInterface,
  MetaDataStandardInterface
} from '@/app/types';

import styles from './questionAdd.module.scss';

const defaultQuestion = {
  guidanceText: '',
  requirementText: '',
  sampleText: '',
  useSampleTextAsDefault: false,
  required: false,
};

type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];

// Type guard function to check if a field has metaDataConfig
const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
  return field.metaDataConfig !== undefined;
};

// Initial Standard Fields data
const initialStandardFields: StandardField[] = [
  {
    id: 'title',
    label: 'Title',
    enabled: true,
    required: true
  },
  {
    id: 'description',
    label: 'Description',
    enabled: false,
    placeholder: '',
    helpText: '',
    maxLength: '',
    required: true,
    value: ''
  },
  {
    id: 'outputType',
    label: 'Output Type',
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
    id: 'dataFlags',
    label: 'Data Flags',
    enabled: false,
    helpText: '',
    flagsConfig: {
      showSensitiveData: true,
      showPersonalData: true,
      mode: 'both' as 'sensitiveOnly' | 'personalOnly' | 'both'
    }
  },
  {
    id: 'repoSelector',
    label: 'Repositories',
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
    id: 'metadataStandards',
    label: 'Metadata Standards',
    enabled: false,
    helpText: '',
    metaDataConfig: {
      hasCustomStandards: false,
      customStandards: [] as MetaDataStandardInterface[],
    }
  },
  {
    id: 'licenses',
    label: 'Licenses',
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
    id: 'accessLevels',
    label: 'Initial Access Levels',
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

const QuestionAdd = ({
  questionType,
  questionName,
  questionJSON,
  sectionId }:
  {
    questionType?: string | null,
    questionName?: string | null,
    questionJSON: string,
    sectionId?: string
  }) => {

  const params = useParams();
  const router = useRouter();
  const toastState = useToast();
  const templateId = String(params.templateId);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const step1Url = routePath('template.q.new', { templateId }, { section_id: sectionId, step: 1 })
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Make sure to add questionJSON and questionType to the question object so it can be used in the QuestionView component
  const [question, setQuestion] = useState<Question>(() => ({
    ...defaultQuestion,
    // If questionType is non-null/undefined, use it, otherwise empty string
    questionType: questionType ?? '',
    // questionJSON is a string, so store it here
    json: questionJSON,
  }));
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 0, text: "", isSelected: false }]);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);
  const [typeaheadSearchLabel, setTypeaheadSearchLabel] = useState<string>('');
  const [typeaheadHelpText, setTypeAheadHelpText] = useState<string>('');
  const [parsedQuestionJSON, setParsedQuestionJSON] = useState<AnyParsedQuestion>();
  const [dateRangeLabels, setDateRangeLabels] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Which fields are expanded for customization
  const [expandedFields, setExpandedFields] = useState<string[]>(['title', 'outputType']);

  // Add state for live region announcements
  const [announcement, setAnnouncement] = useState('');

  // Which fields cannot be customized
  const nonCustomizableFieldIds = ['accessLevels'];

  // Standard fields for research output questions
  const [standardFields, setStandardFields] = useState(initialStandardFields);

  // Additional fields for research output questions
  const [additionalFields, setAdditionalFields] = useState([
    { id: 'coverage', label: 'Coverage', enabled: true, defaultValue: '', customLabel: '', helpText: '', maxLength: '' },
  ]);

  // State for managing custom output types
  const [newOutputType, setNewOutputType] = useState<OutputTypeInterface>({ type: '', description: '' });
  // State for managing custom license types
  const [newLicenseType, setNewLicenseType] = useState<string>('');

  // localization keys
  const Global = useTranslations('Global');
  const QuestionAdd = useTranslations('QuestionAdd');

  // Initialize add and update question mutations
  const [addQuestionMutation] = useAddQuestionMutation();

  // Query request for questions to calculate max displayOrder
  const { data: questionDisplayOrders } = useQuestionsDisplayOrderQuery({
    variables: {
      sectionId: Number(sectionId)
    },
    skip: !sectionId
  })

  // Query request for all licenses
  const { data: licensesData } = useLicensesQuery();

  // Query request for default research output types
  const { data: defaultResearchOutputTypesData } = useDefaultResearchOutputTypesQuery();

  // Send user back to the selection of question types
  const redirectToQuestionTypes = () => {
    router.push(step1Url)
  }

  // Calculate the display order of the new question based on the last displayOrder number
  const getDisplayOrder = useCallback(() => {
    if (!questionDisplayOrders?.questions?.length) {
      return 1;
    }

    // Filter out null/undefined questions and handle missing displayOrder
    const validDisplayOrders = questionDisplayOrders.questions
      .map(q => q?.displayOrder)
      .filter((order): order is number => typeof order === 'number');

    if (validDisplayOrders.length === 0) {
      return 1;
    }

    const maxDisplayOrder = Math.max(...validDisplayOrders);
    return maxDisplayOrder + 1;
  }, [questionDisplayOrders]);

  // Update rows state and question.json when options change
  const updateRows = (newRows: QuestionOptions[]) => {
    setRows(newRows);

    if (hasOptions && questionType && question?.json) {
      const updatedJSON = buildUpdatedJSON(question, newRows);

      if (updatedJSON) {
        setQuestion((prev) => ({
          ...prev,
          json: JSON.stringify(updatedJSON.data),
        }));
      }

    }
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

  // Handler for date range label changes
  const handleRangeLabelChange = (field: 'start' | 'end', value: string) => {
    setDateRangeLabels(prev => ({ ...prev, [field]: value }));

    if (parsedQuestionJSON && (parsedQuestionJSON?.type === "dateRange" || parsedQuestionJSON?.type === "numberRange")) {
      if (parsedQuestionJSON?.columns?.[field]) {
        const updatedParsed = structuredClone(parsedQuestionJSON); // To avoid mutating state directly
        updatedParsed.columns[field].label = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(updatedParsed),
        }));
        setHasUnsavedChanges(true);
      }
    }
  };

  // Handler for typeahead search label changes
  const handleTypeAheadSearchLabelChange = (value: string) => {
    setTypeaheadSearchLabel(value);
    // Update the label in the question JSON and sync to question state
    if (parsedQuestionJSON && (parsedQuestionJSON?.type === "affiliationSearch")) {
      const updatedParsed = structuredClone(parsedQuestionJSON); // To avoid mutating state directly

      if (updatedParsed?.attributes) {
        updatedParsed.attributes.label = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(updatedParsed),
        }));
        setHasUnsavedChanges(true);
      }
    }
  };

  // Handler for typeahead help text changes
  const handleTypeAheadHelpTextChange = (value: string) => {
    setTypeAheadHelpText(value);
    if (parsedQuestionJSON && (parsedQuestionJSON?.type === "affiliationSearch")) {
      const updatedParsed = structuredClone(parsedQuestionJSON); // To avoid mutating state directly

      if (updatedParsed?.attributes) {
        updatedParsed.attributes.help = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(updatedParsed),
        }));
        setHasUnsavedChanges(true);
      }
    }
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


  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    if (value) {
      const isRequired = value === 'yes' ? true : false;
      setQuestion(prev => ({
        ...prev,
        required: isRequired
      }));
      setHasUnsavedChanges(true);
    }
  };


  // Update common input fields when any of them change
  const handleInputChange = (field: keyof Question, value: string | boolean | undefined) => {
    setQuestion((prev) => ({
      ...prev,
      [field]: value === undefined ? '' : value, // Default to empty string if value is undefined
    }));
    setHasUnsavedChanges(true);
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
    const columns: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    standardFields.forEach(field => {
      if (!field.enabled) return;

      switch (field.id) {
        case 'title':
          columns.push({
            heading: field.label || 'Title',
            required: field.required ?? true,
            enabled: true,
            content: {
              type: 'text',
              attributes: {
                label: field.label || 'Title',
                help: field.helpText || '',
                maxLength: 500,
                minLength: 1
              },
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.title'
            }
          });
          break;

        case 'description':
          columns.push({
            heading: field.label || 'Description',
            required: field.required ?? false,
            enabled: true,
            content: {
              type: 'textArea',
              attributes: {
                label: field.label || 'Description',
                help: field.helpText || '',
                maxLength: field.maxLength ? Number(field.maxLength) : undefined,
                asRichText: true,
                rows: 4
              },
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.description'
            }
          });
          break;

        case 'outputType':
          // Build selectBox options from outputTypeConfig
          const outputTypeOptions: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

          if (field.outputTypeConfig?.mode === 'defaults' || !field.outputTypeConfig?.mode) {
            // Use selected defaults - need to match with backend value field
            field.outputTypeConfig?.selectedDefaults?.forEach(defaultType => {
              // Find the corresponding backend output type to get the value
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

          if (field.outputTypeConfig?.mode === 'mine' || !field.outputTypeConfig?.mode) {
            // Add custom types - use type as both label and value for custom types
            field.outputTypeConfig?.customTypes?.forEach(customType => {
              outputTypeOptions.push({
                label: customType.type || '',
                value: customType.type?.toLowerCase().replace(/\s+/g, '-') || '',
                selected: false
              });
            });
          }

          columns.push({
            heading: field.label || 'Output Type',
            required: field.required ?? true,
            enabled: true,
            content: {
              type: 'selectBox',
              attributes: {
                label: field.label || 'Output Type',
                help: field.helpText || '',
                multiple: false
              },
              options: outputTypeOptions,
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.outputType'
            }
          });
          break;

        case 'dataFlags':
          // Add sensitive data checkbox if enabled
          if (field.flagsConfig?.showSensitiveData) {
            columns.push({
              heading: 'Sensitive Data',
              required: false,
              enabled: true,
              content: {
                type: 'checkBoxes',
                attributes: {
                  label: 'Data Flags',
                  help: field.helpText || '',
                  labelTranslationKey: 'researchOutput.dataFlags.heading'
                },
                meta: {
                  schemaVersion: '1.0'
                },
                options: [{
                  label: 'May contain sensitive data?',
                  value: 'sensitive',
                  checked: false
                }]
              },
              meta: {
                schemaVersion: '1.0',
                labelTranslationKey: 'researchOutput.sensitiveData'
              }
            });
          }

          // Add personal data checkbox if enabled
          if (field.flagsConfig?.showPersonalData) {
            columns.push({
              heading: 'Personal Data',
              required: false,
              enabled: true,
              content: {
                type: 'checkBoxes',
                attributes: {
                  label: 'Data Flags',
                  help: field.helpText || '',
                  labelTranslationKey: 'researchOutput.dataFlags.heading'
                },
                meta: {
                  schemaVersion: '1.0'
                },
                options: [{
                  label: 'May contain personally identifiable information?',
                  value: 'personal',
                  checked: false
                }]
              },
              meta: {
                schemaVersion: '1.0',
                labelTranslationKey: 'researchOutput.personalData'
              }
            });
          }
          break;

        case 'repoSelector':
          // Build column with selected repositories if any
          const repoColumn: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
            heading: field.label || 'Repositories',
            required: false,
            enabled: true,
            content: {
              type: 'repositorySearch',
              attributes: {
                label: field.label || 'Repositories',
                help: field.helpText || ''
              },
              graphQL: {
                displayFields: [
                  { propertyName: 'name', label: 'Name' },
                  { propertyName: 'description', label: 'Description' },
                  { propertyName: 'website', label: 'Website' },
                  { propertyName: 'keywords', label: 'Subject Areas' }
                ],
                query: 'query Repositories($term: String, $keywords: [String!], $repositoryType: String, $paginationOptions: PaginationOptions){ repositories(term: $term, keywords: $keywords, repositoryType: $repositoryType, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description website keywords repositoryTypes } } }',
                responseField: 'repositories.items',
                variables: [
                  { minLength: 3, label: 'Search for a repository', name: 'term', type: 'string' },
                  { minLength: 3, label: 'Subject Areas', name: 'keywords', type: 'string' },
                  { minLength: 3, label: 'Repository type', name: 'repositoryType', type: 'string' },
                  { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions', options: { type: 'OFFSET', limit: 10, offset: 0, sortField: 'name', sortOrder: 'ASC' } }
                ],
                queryId: 'useRepositoriesQuery',
                answerField: 'uri'
              },
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.repositories'
            }
          };

          // Add selected repositories to preferences array
          if (field.repoConfig?.customRepos && field.repoConfig.customRepos.length > 0) {
            repoColumn.preferences = field.repoConfig.customRepos.map(repo => ({
              id: repo.uri,
              label: repo.name,
              /*eslint-disable @typescript-eslint/no-explicit-any*/
              value: repo.uri || (repo as any).url || ''
            }));
          }

          columns.push(repoColumn);
          break;

        case 'metadataStandards':
          // Build column with selected metadata standards if any
          const metadataColumn: any = {
            heading: field.label || 'Metadata Standards',
            required: false,
            enabled: true,
            content: {
              type: 'metadataStandardSearch',
              attributes: {
                label: field.label || 'Metadata Standards',
                help: field.helpText || ''
              },
              graphQL: {
                displayFields: [
                  { propertyName: 'name', label: 'Name' },
                  { propertyName: 'description', label: 'Description' },
                  { propertyName: 'website', label: 'Website' },
                  { propertyName: 'keywords', label: 'Subject Areas' }
                ],
                query: 'query MetadataStandards($term: String, $keywords: [String!], $paginationOptions: PaginationOptions){ metadataStandards(term: $term, keywords: $keywords, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description keywords } } }',
                responseField: 'metadataStandards.items',
                variables: [
                  { minLength: 3, label: 'Search for a metadata standard', name: 'term', type: 'string' },
                  { minLength: 3, label: 'Subject Areas', name: 'keywords', type: 'string' },
                  { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions', options: { type: 'OFFSET', limit: 10, offset: 0, sortField: 'name', sortOrder: 'ASC' } }
                ],
                queryId: 'useMetadataStandardsQuery',
                answerField: 'uri'
              },
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.metadataStandards'
            }
          };

          // Add selected metadata standards to preferences array
          if (hasMetaDataConfig(field) && field.metaDataConfig?.customStandards && field.metaDataConfig.customStandards.length > 0) {
            metadataColumn.preferences = field.metaDataConfig.customStandards.map(standard => ({
              label: standard.name,
              value: standard.uri || (standard as any).url || ''
            }));
          }

          columns.push(metadataColumn);
          break;

        case 'licenses':
          // Build column with selected licenses if any
          const licenseColumn: any = {
            heading: field.label || 'Licenses',
            required: false,
            enabled: true,
            content: {
              type: 'licenseSearch',
              attributes: {
                label: field.label || 'Licenses',
                help: field.helpText || ''
              },
              graphQL: {
                displayFields: [
                  { propertyName: 'name', label: 'Name' },
                  { propertyName: 'description', label: 'Description' },
                  { propertyName: 'recommended', label: 'Recommended' }
                ],
                query: 'query Licenses($term: String, $paginationOptions: PaginationOptions){ license(term: $term, paginationOptions: $paginationOptions) { totalCount currentOffset limit hasNextPage hasPreviousPage availableSortFields items { id name uri description } } }',
                responseField: 'licenses.items',
                variables: [
                  { minLength: 3, label: 'Search for a license', name: 'term', type: 'string' },
                  { label: 'Pagination Options', name: 'paginationOptions', type: 'paginationOptions' }
                ],
                answerField: 'uri'
              },
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0'
            }
          };

          // Add selected licenses to preferences array
          if (field.licensesConfig?.customTypes && field.licensesConfig.customTypes.length > 0) {
            licenseColumn.preferences = field.licensesConfig.customTypes.map(license => ({
              label: license.name,
              value: license.uri || ''
            }));
          }

          columns.push(licenseColumn);
          break;

        case 'accessLevels':
          // Build access level options
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

          columns.push({
            heading: field.label || 'Initial Access Levels',
            required: false,
            enabled: true,
            content: {
              type: 'selectBox',
              attributes: {
                label: field.label || 'Initial Access Levels',
                help: field.helpText || '',
                multiple: false
              },
              options: accessLevelOptions,
              meta: {
                schemaVersion: '1.0'
              }
            },
            meta: {
              schemaVersion: '1.0',
              labelTranslationKey: 'researchOutput.accessLevels'
            }
          });
          break;
      }
    });

    // Add any additional custom fields
    additionalFields.forEach(customField => {
      if (customField.enabled) {
        columns.push({
          heading: customField.customLabel || customField.label,
          required: false,
          enabled: true,
          content: {
            type: 'text',
            attributes: {
              label: customField.customLabel || customField.label,
              help: customField.helpText || '',
              maxLength: customField.maxLength ? Number(customField.maxLength) : undefined,
              defaultValue: customField.defaultValue || undefined
            },
            meta: {
              schemaVersion: '1.0'
            }
          },
          meta: {
            schemaVersion: '1.0'
          }
        });
      }
    });

    return {
      ...parsedQuestionJSON,
      columns,
      attributes: {
        ...(parsed && 'attributes' in parsed ? parsed.attributes : {}),
        label: '',
        help: '',
        canAddRows: true,
        canRemoveRows: true,
        initialRows: 1
      }
    };
  };

  // Prepare input for the questionTypeHandler. For options questions, we update the 
  // values with rows state. For non-options questions, we use the parsed JSON
  const getFormState = (question: Question, rowsOverride?: QuestionOptions[]) => {

    if (hasOptions) {
      const useRows = rowsOverride ?? rows;
      return {
        options: useRows.map(row => ({
          label: row.text,
          value: row.text,
          selected: row.isSelected,
        })),
      };
    }

    const { parsed, error } = getParsedQuestionJSON(question, routePath('template.q.new', { templateId }), Global);

    if (questionType === TYPEAHEAD_QUESTION_TYPE) {
      return {
        label: typeaheadSearchLabel,
        help: typeaheadHelpText,
      }
    }

    if (questionType === RESEARCH_OUTPUT_QUESTION_TYPE) {
      return buildResearchOutputFormState(parsed);
    }

    if (!parsed) {
      if (error) {
        setErrors(prev => [...prev, error])
      }
      return;
    }

    return {
      ...parsedQuestionJSON,
      attributes: {
        ...('attributes' in parsed ? parsed.attributes : {}),
        ...getOverrides(questionType),
      },
    };
  };

  // Pass the merged userInput to questionTypeHandlers to generate json and do type and schema validation
  const buildUpdatedJSON = (question: Question, rowsOverride?: QuestionOptions[]) => {
    const userInput = getFormState(question, rowsOverride);

    const { parsed, error } = getParsedQuestionJSON(question, routePath('template.q.new', { templateId }), Global);

    if (!parsed) {
      if (error) {
        setErrors(prev => [...prev, error])
      }
      return;
    }
    return questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](
      parsed,
      userInput
    );
  };

  // Function to add and save the new question
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    const displayOrder = getDisplayOrder();

    const updatedJSON = buildUpdatedJSON(question);

    const { success, error } = updatedJSON ?? {};
    if (success && !error) {
      // Strip all tags from questionText before sending to backend
      const cleanedQuestionText = stripHtmlTags(question?.questionText ?? '');

      const input = {
        templateId: Number(templateId),
        sectionId: Number(sectionId),
        displayOrder,
        isDirty: true,
        questionText: cleanedQuestionText,
        json: JSON.stringify(updatedJSON ? updatedJSON.data : ''),
        requirementText: question?.requirementText,
        guidanceText: question?.guidanceText,
        sampleText: question?.sampleText,
        useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
        required: question?.required,
      };

      try {
        const response = await addQuestionMutation({ variables: { input } });

        if (response?.data) {
          setIsSubmitting(false);
          setHasUnsavedChanges(false);
          toastState.add(QuestionAdd('messages.success.questionAdded'), { type: 'success' });
          // Redirect user to the Edit Question view with their new question id after successfully adding the new question
          router.push(routePath('template.show', { templateId }));
        }
      } catch (error) {
        if (!(error instanceof ApolloError)) {
          setErrors(prevErrors => [
            ...prevErrors,
            QuestionAdd('messages.errors.questionAddingError'),
          ]);
        }
      }
    } else {
      const errorMessage = error ?? QuestionAdd('messages.errors.questionAddingError');
      setErrors(prevErrors => [
        ...prevErrors,
        errorMessage,
      ]);
      announce(QuestionAdd('researchOutput.announcements.errorOccurred') || 'An error occurred. Please check the form.');
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
      prev.map(field =>
        field.id === fieldId ? { ...field, [propertyName]: value } : field
      )
    );
    setHasUnsavedChanges(true);
  };

  // Helper function to make announcements
  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after announcement is made
    setTimeout(() => setAnnouncement(''), 100);
  };

  // If questionType is missing, return user to the Question Types selection page
  // If sectionId is missing, return user back to the Edit Template page
  // This is to ensure that the user has selected a question type before proceeding
  // to the QuestionAdd page, and that they are in a valid section of the template
  useEffect(() => {
    if (!questionType) {
      toastState.add(Global('messaging.somethingWentWrong'), { type: 'error' });
      router.push(step1Url);
      return; // Early return to prevent further execution
    }

    if (!sectionId) {
      toastState.add(Global('messaging.somethingWentWrong'), { type: 'error' });
      router.push(routePath('template.show', { templateId }));
      return;
    }
  }, [])

  useEffect(() => {
    if (questionType) {
      // To determine if we have an options question type
      const isOptionQuestion = isOptionsType(questionType);

      setHasOptions(isOptionQuestion);
    }

  }, [questionType])


  // Set labels for dateRange and numberRange
  useEffect(() => {
    if ((parsedQuestionJSON?.type === 'dateRange' || parsedQuestionJSON?.type === 'numberRange')) {
      try {

        setDateRangeLabels({
          start: parsedQuestionJSON?.columns?.start?.label ?? '',
          end: parsedQuestionJSON?.columns?.end?.label ?? '',
        });
      } catch {
        setDateRangeLabels({ start: '', end: '' });
      }
    }
  }, [parsedQuestionJSON])

  useEffect(() => {
    if (question) {
      const { parsed, error } = getParsedQuestionJSON(
        question,
        routePath('template.q.new', { templateId }),
        Global
      );

      if (parsed) {
        setParsedQuestionJSON(parsed);
      } else if (error) {
        setErrors(prev => (prev.includes(error) ? prev : [...prev, error]));
      }
    }
  }, [question]);

  // Warn user of unsaved changes if they try to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome/Firefox to show the confirm dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return (
    <>
      <PageHeader
        title={QuestionAdd('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.index', { templateId })}>{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.show', { templateId })}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb><Link href={step1Url}>{Global('breadcrumbs.selectQuestionType')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.question')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <div className="template-editor-container">
        <div className="main-content">
          {/* Live region for announcements - visually hidden but read by screen readers */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="hidden-accessibly"
          >
            {announcement}
          </div>
          <ErrorMessages errors={errors} ref={errorRef} />
          <Tabs>
            <TabList aria-label={QuestionAdd('labels.questionEditing')}>
              <Tab id="edit">{Global('tabs.editQuestion')}</Tab>
              <Tab id="options">{Global('tabs.options')}</Tab>
              <Tab id="logic">{Global('tabs.logic')}</Tab>
            </TabList>

            <TabPanel id="edit">
              <Form onSubmit={handleAdd}>
                <TextField
                  name="type"
                  type="text"
                  className={`${styles.searchField} react-aria-TextField`}
                  isRequired
                  value={questionName ? questionName : ''}
                >
                  <Label className={`${styles.searchLabel} react-aria-Label`}>{QuestionAdd('labels.type')}</Label>
                  <Input className={`${styles.searchInput} react-aria-Input`} disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>{QuestionAdd('buttons.changeType')}</Button>
                  <Text slot="description" className={`${styles.searchHelpText} help-text`}>
                    {QuestionAdd('helpText.textField')}
                  </Text>
                </TextField>

                <FormInput
                  name="question_text"
                  type="text"
                  isRequired={true}
                  label={QuestionAdd('labels.questionText')}
                  value={question?.questionText ? question.questionText : ''}
                  onChange={(e) => handleInputChange('questionText', e.currentTarget.value)}
                  helpMessage={QuestionAdd('helpText.questionText')}
                  isInvalid={!question?.questionText && formSubmitted}
                  errorMessage={QuestionAdd('messages.errors.questionTextRequired')}
                />

                {/**Options question types*/}
                {questionType && OPTIONS_QUESTION_TYPES.includes(questionType) && parsedQuestionJSON && (
                  <>
                    <p className={styles.optionsDescription}>
                      {QuestionAdd('helpText.questionOptions', { questionName: questionName ?? '' })}
                    </p>
                    <div className={styles.optionsWrapper}>
                      <QuestionOptionsComponent
                        rows={rows}
                        setRows={updateRows}
                        questionJSON={questionJSON}
                        formSubmitted={formSubmitted}
                        setFormSubmitted={setFormSubmitted}
                      />
                    </div>
                  </>
                )}

                {/**Date and Number range question types */}
                {questionType && RANGE_QUESTION_TYPE.includes(questionType) && (
                  <RangeComponent
                    startLabel={dateRangeLabels.start}
                    endLabel={dateRangeLabels.end}
                    handleRangeLabelChange={handleRangeLabelChange}
                  />
                )}

                {questionType && (questionType === TYPEAHEAD_QUESTION_TYPE) && (
                  <TypeAheadSearch
                    typeaheadSearchLabel={typeaheadSearchLabel}
                    typeaheadHelpText={typeaheadHelpText}
                    handleTypeAheadSearchLabelChange={handleTypeAheadSearchLabelChange}
                    handleTypeAheadHelpTextChange={handleTypeAheadHelpTextChange}
                  />
                )}

                <FormTextArea
                  name="question_requirements"
                  isRequired={false}
                  richText={true}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionAdd('labels.requirementText')}
                  value={question?.requirementText ? question.requirementText : ''}
                  onChange={(newValue) => handleInputChange('requirementText', newValue)}
                  helpMessage={QuestionAdd('helpText.requirementText')}
                />

                <FormTextArea
                  name="question_guidance"
                  isRequired={false}
                  richText={true}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionAdd('labels.guidanceText')}
                  value={question?.guidanceText ? question?.guidanceText : ''}
                  onChange={(newValue) => handleInputChange('guidanceText', newValue)}
                  helpMessage={QuestionAdd('helpText.guidanceText')}
                />

                {questionType === TEXT_AREA_QUESTION_TYPE && (
                  <FormTextArea
                    name="sample_text"
                    isRequired={false}
                    richText={true}
                    description={QuestionAdd('descriptions.sampleText')}
                    textAreaClasses={styles.questionFormField}
                    label={QuestionAdd('labels.sampleText')}
                    value={question?.sampleText ? question.sampleText : ''}
                    onChange={(newValue) => handleInputChange('sampleText', newValue)}
                    helpMessage={QuestionAdd('helpText.sampleText')}
                  />
                )}

                {questionType === TEXT_AREA_QUESTION_TYPE && (
                  <Checkbox
                    onChange={() => handleInputChange('useSampleTextAsDefault', !question?.useSampleTextAsDefault)}
                    isSelected={question?.useSampleTextAsDefault || false}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    {QuestionAdd('descriptions.sampleTextAsDefault')}
                  </Checkbox>
                )}

                {questionType === RESEARCH_OUTPUT_QUESTION_TYPE && (
                  <ResearchOutputComponent
                    standardFields={standardFields}
                    additionalFields={additionalFields}
                    expandedFields={expandedFields}
                    nonCustomizableFieldIds={nonCustomizableFieldIds}
                    newOutputType={newOutputType}
                    setNewOutputType={setNewOutputType}
                    newLicenseType={newLicenseType}
                    setNewLicenseType={setNewLicenseType}
                    defaultResearchOutputTypesData={defaultResearchOutputTypesData}
                    licensesData={licensesData}
                    onStandardFieldChange={handleStandardFieldChange}
                    onCustomizeField={handleCustomizeField}
                    onUpdateStandardFieldProperty={updateStandardFieldProperty}
                    onTogglePreferredRepositories={handleTogglePreferredRepositories}
                    onRepositoriesChange={handleRepositoriesChange}
                    onToggleMetaDataStandards={handleToggleMetaDataStandards}
                    onMetaDataStandardsChange={handleMetaDataStandardsChange}
                    onOutputTypeModeChange={handleOutputTypeModeChange}
                    onAddCustomOutputType={handleAddCustomOutputType}
                    onRemoveCustomOutputType={handleRemoveCustomOutputType}
                    onLicenseModeChange={handleLicenseModeChange}
                    onAddCustomLicenseType={handleAddCustomLicenseType}
                    onRemoveCustomLicenseType={handleRemoveCustomLicenseType}
                    onDeleteAdditionalField={handleDeleteAdditionalField}
                    onUpdateAdditionalField={handleUpdateAdditionalField}
                    onAddAdditionalField={addAdditionalField}
                  />
                )}

                {/** Research Output question types have "required" at individual fields, and not on the whole question */}
                <RadioGroupComponent
                  name="radioGroup"
                  value={question?.required ? 'yes' : 'no'}
                  radioGroupLabel={Global('labels.requiredField')}
                  description={Global('descriptions.requiredFieldDescription')}
                  onChange={handleRadioChange}
                >
                  <div>
                    <Radio value="yes">{Global('form.yesLabel')}</Radio>
                  </div>

                  <div>
                    <Radio value="no">{Global('form.noLabel')}</Radio>
                  </div>
                </RadioGroupComponent>

                {/**We need to set formSubmitted here, so that it is passed down to the child component QuestionOptionsComponent */}
                <Button
                  type="submit"
                  onPress={() => setFormSubmitted(true)}
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? Global('buttons.saving') : Global('buttons.saveAndAdd')}
                </Button>
              </Form>

            </TabPanel>
            <TabPanel id="options">
              <h2>{Global('tabs.options')}</h2>
            </TabPanel>
            <TabPanel id="logic">
              <h2>{Global('tabs.logic')}</h2>
            </TabPanel>
          </Tabs>

        </div >

        <div className="sidebar">
          <h2>{Global('headings.preview')}</h2>
          <p>{QuestionAdd('descriptions.previewText')}</p>
          <QuestionPreview
            buttonLabel={QuestionAdd('buttons.previewQuestion')}
            previewDisabled={question ? false : true}
          >
            <QuestionView
              isPreview={true}
              question={question}
              templateId={Number(templateId)}
              path={routePath('template.q.new', { templateId })}
            />
          </QuestionPreview>

          <h3>{QuestionAdd('headings.bestPractice')}</h3>
          <p>{QuestionAdd('descriptions.bestPracticePara1')}</p>
          <p>{QuestionAdd('descriptions.bestPracticePara2')}</p>
          <p>{QuestionAdd('descriptions.bestPracticePara3')}</p>
        </div>
      </div >
    </>

  );
}

export default QuestionAdd;

