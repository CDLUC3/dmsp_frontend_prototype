'use client'

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Dialog,
  DialogTrigger,
  Form,
  Input,
  Label,
  Link,
  Modal,
  ModalOverlay,
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
  useQuestionQuery,
  useLicensesQuery,
  useDefaultResearchOutputTypesQuery,
} from '@/generated/graphql';

import {
  removeQuestionAction,
  updateQuestionAction
} from './actions/index';

import {
  AnyParsedQuestion,
  AccessLevelInterface,
  OutputTypeInterface,
  StandardField,
  MetaDataConfig,
  Question,
  QuestionOption,
  QuestionOptions,
  QuestionFormatInterface,
  RepositoryInterface,
  MetaDataStandardInterface,
  RemoveQuestionErrors,
  UpdateQuestionErrors,
} from '@/app/types';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import QuestionPreview from '@/components/QuestionPreview';
import {
  FormInput,
  RadioGroupComponent,
  RangeComponent,
  TypeAheadSearch,
  ResearchOutputComponent
} from '@/components/Form';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionView from '@/components/QuestionView';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';

//Utils and Other
import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { extractErrors } from "@/utils/errorHandler";
import {
  getQuestionFormatInfo,
  getQuestionTypes,
  questionTypeHandlers
} from '@/utils/questionTypeHandlers';

import {
  RANGE_QUESTION_TYPE,
  TYPEAHEAD_QUESTION_TYPE,
  DATE_RANGE_QUESTION_TYPE,
  NUMBER_RANGE_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE,
  RESEARCH_OUTPUT_QUESTION_TYPE
} from '@/lib/constants';
import {
  isOptionsType,
  getOverrides,
} from './hooks/useEditQuestion';
import styles from './questionEdit.module.scss';

// Type guard function to check if a field has metaDataConfig
const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
  return field.metaDataConfig !== undefined;
};


const standardKeys = new Set([
  'researchOutput.title',
  'researchOutput.description',
  'researchOutput.outputType',
  'researchOutput.dataFlags',
  'researchOutput.repositories',
  'researchOutput.metadataStandards',
  'researchOutput.licenses',
  'researchOutput.accessLevels',
  'Sensitive Data',
  'Personal Data',
  'Title',
  'Description',
  'Output Type',
  'Repositories',
  'Metadata Standards',
  'Licenses',
  'Initial Access Levels',
]);


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


const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastState = useToast(); // Access the toast state from context
  const templateId = String(params.templateId);
  const questionId = String(params.q_slug); //question id
  const questionTypeIdQueryParam = searchParams.get('questionType') || null;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const hasHydrated = useRef(false);
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 0, text: "", isSelected: false }]);
  const [questionType, setQuestionType] = useState<string>('');
  const [questionTypeName, setQuestionTypeName] = useState<string>(''); // Added to store friendly question name
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dateRangeLabels, setDateRangeLabels] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [typeaheadHelpText, setTypeAheadHelpText] = useState<string>('');
  const [typeaheadSearchLabel, setTypeaheadSearchLabel] = useState<string>('');
  const [parsedQuestionJSON, setParsedQuestionJSON] = useState<AnyParsedQuestion>();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  // Add state for live region announcements
  const [announcement, setAnnouncement] = useState('');

  // States for Research Output table question type
  // Which fields are expanded for customization
  const [expandedFields, setExpandedFields] = useState<string[]>(['title', 'outputType']);
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
  const t = useTranslations('QuestionEdit');
  const QuestionAdd = useTranslations('QuestionAdd');

  // Set URLs
  const TEMPLATE_URL = routePath('template.show', { templateId });

  // Run selected question query
  const {
    data: selectedQuestion,
    loading,
    error: selectedQuestionQueryError
  } = useQuestionQuery(
    {
      variables: {
        questionId: Number(questionId)
      }
    },
  );

  // Query request for all licenses
  const { data: licensesData } = useLicensesQuery();

  // Query request for default research output types
  const { data: defaultResearchOutputTypesData } = useDefaultResearchOutputTypesQuery();

  // Helper function to make announcements
  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after announcement is made
    setTimeout(() => setAnnouncement(''), 100);
  };

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
        setHasUnsavedChanges(true);
      }
    }
  };

  // Return user back to the page to select a question type
  const redirectToQuestionTypes = () => {
    const sectionId = selectedQuestion?.question?.sectionId;
    // questionId as query param included to let page know that user is updating an existing question
    router.push(routePath('template.q.new', { templateId }, { section_id: sectionId, step: 1, questionId }))
  }

  //Handle change to Question Text
  const handleQuestionTextChange = (value: string) => {
    setQuestion(prev => ({
      ...prev,
      questionText: value
    }));
    setHasUnsavedChanges(true);
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

    if (parsedQuestionJSON && parsedQuestionJSON?.type === "affiliationSearch") {
      const updatedParsed = structuredClone(parsedQuestionJSON); // To avoid mutating state directly
      updatedParsed.attributes.label = value;
      setQuestion(prev => ({
        ...prev,
        json: JSON.stringify(updatedParsed),
      }));
      setHasUnsavedChanges(true);
    }
  };

  // Handler for typeahead help text changes
  const handleTypeAheadHelpTextChange = (value: string) => {
    setTypeAheadHelpText(value);

    if (parsedQuestionJSON && parsedQuestionJSON?.type === "affiliationSearch") {
      if (parsedQuestionJSON?.attributes?.help) {
        const updatedParsed = structuredClone(parsedQuestionJSON); // To avoid mutating state directly
        updatedParsed.attributes.help = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(updatedParsed),
        }));
        setHasUnsavedChanges(true);
      }
    }
  };

  // Handle updates to RepositorySelectionSystem component
  const handleRepositoriesChange = (repos: RepositoryInterface[]) => {
    console.log("***Handle Repositories Change", repos);
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
    console.log("***Handle License Mode Change", mode);
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
    const columns: any[] = [];

    standardFields.forEach(field => {
      if (!field.enabled) return;

      switch (field.id) {
        case 'title':
          columns.push({
            heading: field.label || 'Title',
            content: {
              type: 'text',
              attributes: {
                label: field.label || 'Title',
                help: field.helpText || '',
                maxLength: 500,
                minLength: 1
              }
            }
          });
          break;

        case 'description':
          columns.push({
            heading: field.label || 'Description',
            content: {
              type: 'textArea',
              attributes: {
                label: field.label || 'Description',
                help: field.helpText || '',
                maxLength: field.maxLength ? Number(field.maxLength) : undefined,
                asRichText: true,
                rows: 4
              }
            }
          });
          break;

        case 'outputType': {
          const outputTypeOptions: any[] = [];
          if (field.outputTypeConfig?.mode === 'defaults' || !field.outputTypeConfig?.mode) {
            field.outputTypeConfig?.selectedDefaults?.forEach(defaultType => {
              const backendType = defaultResearchOutputTypesData?.defaultResearchOutputTypes?.find(
                (item) => item?.name === defaultType
              );
              outputTypeOptions.push({
                label: defaultType,
                value: backendType?.value || defaultType.toLowerCase().replace(/\s+/g, '-')
              });
            });
          }
          if (field.outputTypeConfig?.mode === 'mine' || !field.outputTypeConfig?.mode) {
            field.outputTypeConfig?.customTypes?.forEach(customType => {
              outputTypeOptions.push({
                label: customType.type || '',
                value: customType.type?.toLowerCase().replace(/\s+/g, '-') || ''
              });
            });
          }
          columns.push({
            heading: field.label || 'Output Type',
            content: {
              type: 'selectBox',
              attributes: {
                label: field.label || 'Output Type',
                help: field.helpText || '',
                multiple: false
              },
              options: outputTypeOptions
            }
          });
          break;
        }

        case 'dataFlags':
          if (field.flagsConfig?.showSensitiveData) {
            columns.push({
              heading: 'Sensitive Data',
              content: {
                type: 'checkBoxes',
                attributes: {
                  label: 'Data Flags',
                  help: field.helpText || '',
                  labelTranslationKey: 'researchOutput.dataFlags.heading'
                },
                options: [{
                  label: 'May contain sensitive data?',
                  value: 'sensitive',
                  checked: false
                }]
              }
            });
          }
          if (field.flagsConfig?.showPersonalData) {
            columns.push({
              heading: 'Personal Data',
              content: {
                type: 'checkBoxes',
                attributes: {
                  label: 'Data Flags',
                  help: field.helpText || '',
                  labelTranslationKey: 'researchOutput.dataFlags.heading'
                },
                options: [{
                  label: 'May contain personally identifiable information?',
                  value: 'personal',
                  checked: false
                }]
              }
            });
          }
          break;

        case 'repoSelector': {
          const repoColumn: any = {
            heading: field.label || 'Repositories',
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
              }
            }
          };
          console.log("***FIELD REPO CONFIG", field.repoConfig);
          if (field.repoConfig?.customRepos && field.repoConfig.customRepos.length > 0) {
            repoColumn.preferences = field.repoConfig.customRepos.map(repo => ({
              id: repo.uri,
              label: repo.name,
              value: repo.uri || ''
            }));
          }
          columns.push(repoColumn);
          break;
        }

        case 'metadataStandards': {
          const metadataColumn: any = {
            heading: field.label || 'Metadata Standards',
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

        case 'licenses': {
          const licenseColumn: any = {
            heading: field.label || 'Licenses',
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

          console.log("***License Column", licenseColumn);
          columns.push(licenseColumn);
          break;
        }

        case 'accessLevels': {
          const accessLevelOptions: any[] = [];
          if (field.accessLevelsConfig?.mode === 'defaults' || !field.accessLevelsConfig?.mode) {
            field.accessLevelsConfig?.selectedDefaults?.forEach(level => {
              accessLevelOptions.push({
                label: level,
                value: level
              });
            });
          }
          if (field.accessLevelsConfig?.mode === 'mine') {
            field.accessLevelsConfig?.customLevels?.forEach(customLevel => {
              accessLevelOptions.push({
                label: customLevel.label,
                value: customLevel.value
              });
            });
          }
          columns.push({
            heading: field.label || 'Initial Access Levels',
            content: {
              type: 'selectBox',
              attributes: {
                label: field.label || 'Initial Access Levels',
                help: field.helpText || '',
                multiple: false
              },
              options: accessLevelOptions
            }
          });
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

    const { parsed, error } = getParsedQuestionJSON(question, routePath('template.q.slug', { templateId, q_slug: questionId }), Global);

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
      ...parsed,
      attributes: {
        ...('attributes' in parsed ? parsed.attributes : {}),
        ...getOverrides(questionType),
      },
    };
  };

  // Pass the merged userInput to questionTypeHandlers to generate json and do type and schema validation
  const buildUpdatedJSON = (question: Question, rowsOverride?: QuestionOptions[]) => {
    const userInput = getFormState(question, rowsOverride);
    console.log("***USER INPUT for Research Output", userInput);
    const { parsed, error } = getParsedQuestionJSON(question, routePath('template.q.slug', { templateId, q_slug: questionId }), Global);
    console.log("***PARSED JSON for Research Output", parsed);

    if (!parsed) {
      if (error) {
        setErrors(prev => [...prev, error])
      }
      return;
    }
    const temp = questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](
      parsed,
      userInput
    );

    console.log("***Returned from questionTypeHandlers", temp);
    return temp;
  };

  // Handle form submission to update the question
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Set formSubmitted to true to indicate the form has been submitted
    setFormSubmitted(true);

    console.log("***Handle Update standard fields", standardFields);

    if (question) {
      const updatedJSON = buildUpdatedJSON(question);
      const { success, error } = updatedJSON ?? {};

      if (success && !error) {
        // Strip all tags from questionText before sending to backend
        const cleanedQuestionText = stripHtmlTags(question.questionText ?? '');

        // Add mutation for question
        const response = await updateQuestionAction({
          questionId: Number(questionId),
          displayOrder: Number(question.displayOrder),
          json: JSON.stringify(updatedJSON ? updatedJSON.data : ''),
          questionText: cleanedQuestionText,
          requirementText: String(question.requirementText),
          guidanceText: String(question.guidanceText),
          sampleText: String(question.sampleText),
          useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
          required: Boolean(question.required)
        });

        if (response.redirect) {
          router.push(response.redirect);
        }

        if (!response.success) {
          const errors = response.errors;

          // Announcement for screen readers
          announce(QuestionAdd('researchOutput.announcements.errorOccurred') || 'An error occurred. Please check the form.');

          //Check if errors is an array or an object
          if (Array.isArray(errors)) {
            //Handle errors as an array
            setErrors(errors);
          }
        } else {
          if (response?.data?.errors) {
            const errs = extractErrors<UpdateQuestionErrors>(response?.data?.errors, ["general", "questionText"]);
            if (errs.length > 0) {
              setErrors(errs);
            }
          }
          setIsSubmitting(false);
          setHasUnsavedChanges(false);
          toastState.add(QuestionAdd('messages.success.questionUpdated'), { type: 'success' });

          // Redirect user to the Edit Question view with their new question id after successfully adding the new question
          router.push(TEMPLATE_URL);
        }
      }
    }
  };

  // Handle form submission to delete the question
  const handleDelete = async () => {
    const response = await removeQuestionAction({
      questionId: Number(questionId),
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    if (!response.success) {
      const errors = response.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        setErrors(errors);
      }
    } else {
      if (response?.data?.errors) {
        const errs = extractErrors<RemoveQuestionErrors>(response?.data?.errors, ["general", "guidanceText", "questionText", "requirementText", "sampleText"]);
        if (errs.length > 0) {
          setErrors(errs);
        } else {
          // Show success message and redirect to Edit Template page
          toastState.add(t('messages.success.questionRemoved'), { type: 'success' });
          router.push(TEMPLATE_URL);
        }
      }
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

  // Saves any query errors to errors state
  useEffect(() => {
    const allErrors = [];

    if (selectedQuestionQueryError) {
      allErrors.push(selectedQuestionQueryError.message);
    }

    setErrors(allErrors);
  }, [selectedQuestionQueryError]);

  useEffect(() => {
    if (selectedQuestion?.question) {
      const q = {
        ...selectedQuestion.question,
        required: selectedQuestion.question.required ?? false // convert null to false
      };
      try {
        const { parsed, error } = getParsedQuestionJSON(q, routePath('template.show', { templateId }), Global);
        if (!parsed?.type) {
          if (error) {
            logECS('error', 'Parsing error', {
              error: 'Invalid question type in parsed JSON',
              url: { path: routePath('template.q.slug', { templateId, q_slug: questionId }) }
            });

            setErrors(prev => [...prev, error])
          }
          return;
        }

        const questionType = parsed.type;
        const questionTypeFriendlyName = Global(`questionTypes.${questionType}`);

        setQuestionType(questionType);
        setQuestionTypeName(questionTypeFriendlyName);
        setParsedQuestionJSON(parsed);

        const isOptionsQuestion = isOptionsType(questionType);
        setQuestion(q);
        setHasOptions(isOptionsQuestion);

        if (questionType === TYPEAHEAD_QUESTION_TYPE) {
          setTypeaheadSearchLabel(parsed?.attributes?.label ?? '');
          setTypeAheadHelpText(parsed?.attributes?.help ?? '');
        }

        // Set options info with proper type checking
        if (isOptionsQuestion && 'options' in parsed && parsed.options && Array.isArray(parsed.options)) {
          const optionRows: QuestionOptions[] = parsed.options
            .map((option: QuestionOption, index: number) => ({
              id: index,
              text: option?.label || '',
              isSelected: option?.selected || option?.checked || false,
            }));
          setRows(optionRows);
        }
      } catch (error) {
        logECS('error', 'Parsing error', {
          error,
          url: { path: routePath('template.q.slug', { templateId, q_slug: questionId }) }
        });
        setErrors(prev => [...prev, 'Error parsing question data']);
      }
    }
  }, [selectedQuestion]);

  useEffect(() => {
    if (questionType) {
      // To determine if we have an options question type
      const isOptionQuestion = isOptionsType(questionType);

      setHasOptions(isOptionQuestion);
    }

  }, [questionType])

  // Set labels for dateRange and numberRange
  useEffect(() => {
    if ((parsedQuestionJSON?.type === DATE_RANGE_QUESTION_TYPE || parsedQuestionJSON?.type === NUMBER_RANGE_QUESTION_TYPE)) {
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
    if (!hasHydrated.current && parsedQuestionJSON?.type === RESEARCH_OUTPUT_QUESTION_TYPE && Array.isArray(parsedQuestionJSON.columns)) {
      try {
        // Helper to find a column by labelTranslationKey or heading
        const findColumn = (keys: string[]) =>
          parsedQuestionJSON.columns.find(
            (col) =>
              (col?.meta?.labelTranslationKey && keys.includes(col.meta.labelTranslationKey)) ||
              (col?.heading && keys.includes(col.heading))
          );

        // Hydrate standard fields
        setStandardFields((prevFields) => prevFields.map((field) => {
          let updated = { ...field };
          switch (field.id) {
            case 'repoSelector': {
              const col = findColumn(['researchOutput.repositories', 'Repositories']);
              if (col && 'preferences' in col && Array.isArray((col as any).preferences)) {
                updated.enabled = !!col.enabled;
                updated.helpText = col.content.attributes?.help || '';
                updated.repoConfig = {
                  ...updated.repoConfig,
                  customRepos: col.preferences.map((repo) => ({
                    name: repo.label,
                    uri: repo.value
                  })),
                  hasCustomRepos: col?.preferences.length > 0,
                };
              }
              break;
            }
            case 'accessLevels': {
              const col = findColumn(['researchOutput.accessLevels', 'Initial Access Levels']);
              if (col && col.enabled === true) {
                updated.enabled = col.enabled;
                updated.helpText = col.content.attributes?.help || '';
              }
              break;
            }
            case 'metadataStandards': {
              const col = findColumn(['researchOutput.metadataStandards', 'Metadata Standards']);
              if (col && 'preferences' in col && Array.isArray((col as any).preferences)) {
                updated.enabled = !!col.enabled;
                updated.helpText = col.content.attributes?.help || '';
                updated.metaDataConfig = {
                  ...updated.metaDataConfig,
                  customStandards: col.preferences.map((std) => ({
                    name: std.label,
                    uri: std.value
                  })),
                  hasCustomStandards: col?.preferences.length > 0,
                };
              }
              break;
            }
            case 'licenses': {
              const col = findColumn(['researchOutput.licenses', 'Licenses']);
              if (col && 'preferences' in col && Array.isArray((col as any).preferences)) {
                updated.enabled = !!col.enabled;
                updated.helpText = col.content.attributes?.help || '';
                updated.licensesConfig = {
                  ...updated.licensesConfig,
                  mode: col?.preferences.length > 0 ? 'addToDefaults' : 'defaults',
                  customTypes: col.preferences.map((lic) => ({
                    name: lic.label,
                    uri: lic.value
                  })),
                  selectedDefaults: updated.licensesConfig?.selectedDefaults || [],
                };
              }
              break;
            }
            case 'outputType': {
              const col = findColumn(['researchOutput.outputType', 'Output Type']);
              if (col && col.content && 'options' in col.content && Array.isArray(col?.content?.options) && col?.content?.options.length > 0) {
                updated.enabled = !!col.enabled;
                updated.outputTypeConfig = {
                  ...updated.outputTypeConfig,
                  mode: 'mine',
                  customTypes: col.content.options.map(opt => ({ type: opt.label, description: '' })),
                  selectedDefaults: [],
                };
              }
              break;
            }
            case 'dataFlags': {
              const sensCol = findColumn(['researchOutput.sensitiveData', 'Sensitive Data']);
              const persCol = findColumn(['researchOutput.personalData', 'Personal Data']);
              updated.enabled = !!(sensCol || persCol);
              updated.flagsConfig = {
                ...updated.flagsConfig,
                showSensitiveData: !!sensCol,
                showPersonalData: !!persCol,
                mode: updated.flagsConfig?.mode || 'both'
              };
              break;
            }
            case 'title':
            case 'description': {
              const col = findColumn([
                field.id === 'title' ? 'researchOutput.title' : 'researchOutput.description',
                field.id === 'title' ? 'Title' : 'Description',
              ]);
              if (col) {
                updated.enabled = !!col.enabled;
                updated.label = col.heading || updated.label;
                updated.helpText = col.content?.attributes?.help || updated.helpText;
                updated.required = !!col.required;
              }
              break;
            }
            default:
              break;
          }
          return updated;
        }));

        // Hydrate additional fields (custom columns)
        const customCols = parsedQuestionJSON.columns.filter(
          (col) =>
            !(col?.meta?.labelTranslationKey && standardKeys.has(col.meta.labelTranslationKey)) &&
            !(col?.heading && standardKeys.has(col.heading))
        );

        function hasDefaultValue(attr: any): attr is { defaultValue: string } {
          return attr && typeof attr.defaultValue !== 'undefined';
        }
        function hasMaxLength(attr: any): attr is { maxLength: string } {
          return attr && typeof attr.maxLength !== 'undefined';
        }

        setAdditionalFields(
          customCols.map((col, idx) => ({
            id: col.heading?.toLowerCase().replace(/\s+/g, '_') || `custom_field_${idx}`,
            label: col.heading || `Custom Field ${idx + 1}`,
            enabled: !!col.enabled,
            defaultValue: hasDefaultValue(col.content?.attributes) ? col.content.attributes.defaultValue : '',
            customLabel: col.heading || '',
            helpText: col.content?.attributes?.help || '',
            maxLength: hasMaxLength(col.content?.attributes) ? col.content.attributes.maxLength : '',
          }))
        );

        // Hydrate expanded fields (expand all enabled fields by default)
        setExpandedFields([
          ...parsedQuestionJSON.columns
            .filter((col) => col.enabled)
            .map((col) => {
              // Try to match to field id by labelTranslationKey or heading
              const key = col?.meta?.labelTranslationKey || col?.heading;
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
                  // For custom fields, use the generated id
                  return col.heading?.toLowerCase().replace(/\s+/g, '_');
              }
            })
        ]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error hydrating research output fields from JSON', error);
      }
      hasHydrated.current = true;
    }
  }, [parsedQuestionJSON]);

  // If a user changes their question type, then we need to fetch the question types to set the new json schema
  useEffect(() => {
    // Only fetch question types if we have a questionType query param present
    if (questionTypeIdQueryParam) {
      getQuestionTypes();
    }
  }, [questionTypeIdQueryParam]);


  // If a user passes in a questionType query param we will find the matching questionTypes 
  // json schema and update the question with it
  useEffect(() => {
    if (questionType && questionTypeIdQueryParam && question) {
      // Find the matching question type
      const qInfo: QuestionFormatInterface | null = getQuestionFormatInfo(questionTypeIdQueryParam);

      if (qInfo?.defaultJSON) {
        // Update the question object with the new JSON
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(qInfo.defaultJSON)
        }));

        setHasUnsavedChanges(true);

        setQuestionType(questionTypeIdQueryParam)

        // Update the questionTypeName
        const questionTypeFriendlyName = Global(`questionTypes.${questionTypeIdQueryParam}`);
        setQuestionTypeName(questionTypeFriendlyName);

        const isOptionsQuestion = isOptionsType(questionTypeIdQueryParam)
        setHasOptions(isOptionsQuestion);

      }
    }
  }, [questionType, questionTypeIdQueryParam]);

  useEffect(() => {
    if (question) {
      const { parsed, error } = getParsedQuestionJSON(question, routePath('template.show', { templateId }), Global);
      if (!parsed) {
        if (error) {
          setErrors(prev => [...prev, error])
        }
        return;
      }
      setParsedQuestionJSON(parsed);
    }
  }, [question])

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

  useEffect(() => {
    console.log("***Standard Fields", standardFields);
  }, [standardFields])
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={t('title', { title: selectedQuestion?.question?.questionText ?? '' })}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.index', { templateId })}>{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.show', { templateId })}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.question')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

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

      <div className="template-editor-container">
        <div className="main-content">
          <Tabs>
            <TabList aria-label="Question editing">
              <Tab id="edit">{Global('tabs.editQuestion')}</Tab>
              <Tab id="options">{Global('tabs.options')}</Tab>
              <Tab id="logic">{Global('tabs.logic')}</Tab>
            </TabList>

            <TabPanel id="edit">
              <Form onSubmit={handleUpdate}>
                <TextField
                  name="type"
                  type="text"
                  className={`${styles.searchField} react-aria-TextField`}
                  isRequired
                >
                  <Label
                    className={`${styles.searchLabel} react-aria-Label`}>{t('labels.type')}</Label>
                  <Input
                    value={questionTypeName}
                    className={`${styles.searchInput} react-aria-Input`}
                    disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`}
                    type="button"
                    onPress={redirectToQuestionTypes}>{t('buttons.changeType')}</Button>
                  <Text slot="description"
                    className={`${styles.searchHelpText} help-text`}>
                    {t('helpText.textField')}
                  </Text>
                </TextField>

                <FormInput
                  name="question_text"
                  type="text"
                  isRequired={true}
                  label={t('labels.questionText')}
                  value={question?.questionText ? question.questionText : ''}
                  onChange={(e) => handleQuestionTextChange(e.target.value)}
                  helpMessage={t('helpText.questionText')}
                  isInvalid={!question?.questionText}
                  errorMessage={t('messages.errors.questionTextRequired')}
                />

                {/**Question type fields here */}
                {hasOptions && (
                  <div className={styles.optionsWrapper}>
                    <p
                      className={styles.optionsDescription}>{t('helpText.questionOptions', { questionType })}</p>
                    <QuestionOptionsComponent
                      rows={rows}
                      setRows={updateRows}
                      questionJSON={(() => {
                        if (!question) return undefined;
                        const result = getParsedQuestionJSON(question, routePath('template.show', { templateId }), Global);
                        return result.parsed ? JSON.stringify(result.parsed) : undefined;
                      })()}
                      formSubmitted={formSubmitted}
                      setFormSubmitted={setFormSubmitted} />
                  </div>
                )}

                {/**Date and Number range question types */}
                {questionType && RANGE_QUESTION_TYPE.includes(questionType) && (
                  <RangeComponent
                    startLabel={dateRangeLabels.start}
                    endLabel={dateRangeLabels.end}
                    handleRangeLabelChange={handleRangeLabelChange}
                  />
                )}

                {/**Typeahead search question type */}
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
                  helpMessage={t('helpText.requirementText')}
                  textAreaClasses={styles.questionFormField}
                  label={t('labels.requirementText')}
                  value={question?.requirementText ? question.requirementText : ''}
                  onChange={(newValue) => {
                    setQuestion(prev => ({
                      ...prev,
                      requirementText: newValue
                    }));
                    setHasUnsavedChanges(true);
                  }}
                />


                <FormTextArea
                  name="question_guidance"
                  isRequired={false}
                  richText={true}
                  textAreaClasses={styles.questionFormField}
                  label={t('labels.guidanceText')}
                  value={question?.guidanceText ? question?.guidanceText : ''}
                  onChange={(newValue) => {
                    setQuestion(prev => ({
                      ...prev,
                      guidanceText: newValue
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  helpMessage={t('helpText.guidanceText')}
                />

                {questionType === TEXT_AREA_QUESTION_TYPE && (
                  <FormTextArea
                    name="sample_text"
                    isRequired={false}
                    richText={true}
                    description={t('descriptions.sampleText')}
                    textAreaClasses={styles.questionFormField}
                    label={t('labels.sampleText')}
                    value={question?.sampleText ? question?.sampleText : ''}
                    onChange={(newValue) => {
                      setQuestion(prev => ({
                        ...prev,
                        sampleText: newValue
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                )}

                {questionType === TEXT_AREA_QUESTION_TYPE && (
                  <Checkbox
                    onChange={() => {
                      setQuestion({
                        ...question,
                        useSampleTextAsDefault: !question?.useSampleTextAsDefault
                      });
                      setHasUnsavedChanges(true);
                    }}
                    isSelected={question?.useSampleTextAsDefault || false}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    {t('descriptions.sampleTextAsDefault')}

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


                <Button
                  type="submit"
                  aria-disabled={isSubmitting}
                  onPress={() => setFormSubmitted(true)}
                >
                  {isSubmitting ? Global('buttons.saving') : Global('buttons.saveAndUpdate')}
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

          <div className={styles.deleteZone}>
            <h2>{t('headings.deleteQuestion')}</h2>
            <p>{t('descriptions.deleteWarning')}</p>
            <DialogTrigger isOpen={isConfirmOpen} onOpenChange={setConfirmOpen}>
              <Button className={`danger`}>{t('buttons.deleteQuestion')}</Button>
              <ModalOverlay>
                <Modal>
                  <Dialog>
                    {({ close }) => (
                      <>
                        <h3>{t('headings.confirmDelete')}</h3>
                        <p>{t('descriptions.deleteWarning')}</p>
                        <div className={styles.deleteConfirmButtons}>
                          <Button className='react-aria-Button' autoFocus onPress={close}>{Global('buttons.cancel')}</Button>
                          <Button className={`danger `} onPress={() => {
                            handleDelete();
                            close();
                          }}>{Global('buttons.confirm')}</Button>
                        </div>
                      </>
                    )}
                  </Dialog>
                </Modal>
              </ModalOverlay>
            </DialogTrigger>
          </div>

        </div>



        <div className="sidebar">
          <h2>{Global('headings.preview')}</h2>
          <p>{t('descriptions.previewText')}</p>
          <QuestionPreview
            buttonLabel={t('buttons.previewQuestion')}
            previewDisabled={question ? false : true}
          >
            <QuestionView
              isPreview={true}
              question={question}
              templateId={Number(templateId)}
              path={routePath('template.q.slug', { templateId, q_slug: questionId })}
            />
          </QuestionPreview>

          <h3>{t('headings.bestPractice')}</h3>
          <p>{t('descriptions.bestPracticePara1')}</p>
          <p>{t('descriptions.bestPracticePara2')}</p>
          <p>{t('descriptions.bestPracticePara3')}</p>
        </div>
      </div >
    </>

  );
}

export default QuestionEdit;
