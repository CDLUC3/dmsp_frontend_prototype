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
  TypeAheadSearch
} from '@/components/Form';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionPreview from '@/components/QuestionPreview';
import QuestionView from '@/components/QuestionView';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';
import RepositorySelectionSystem from './ReposSelector';
import MetaDataStandards from './MetaDataStandards';
import OutputTypeField from './OutputTypeField';
import LicenseField, { otherLicenses } from './LicenseField';
import InitialAccessLevel from './InitialAccessLevel';

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

// Default licenses
const defaultLicenses = [
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-NC-4.0',
  'CC-BY-NC-SA-4.0',
  'CC-BY-ND-4.0',
  'CC-BY-NC-ND-4.0',
  'CCo-1.0'
];

const defaultAccessLevels = [
  { id: 'controlledAccess', level: 'Controlled access', description: 'Restricts access to certain areas' },
  { id: 'unrestrictedAccess', level: 'Unrestricted access', description: 'Allows access to all areas' },
  { id: 'Other', level: 'Other', description: 'Other type of access' },
];

const defaultOutputTypes = [
  { id: 'Audiovisual', type: 'Audiovisual', description: 'A series of visual representations imparting an impression of motion when shown in succession. May or may not include sound.' },
  { id: 'Collection', type: 'Collection', description: 'An aggregation of resources, which may encompass collections of one resourceType as well as those of mixed types. A collection is described as a group; its parts may also be separately described.' },
  { id: 'Data paper', type: 'Data paper', description: 'A factual and objective publication with a focused intent to identify and describe specific data, sets of data, or data collections to facilitate discoverability.' },
  { id: 'Dataset', type: 'Dataset', description: 'Data encoded in a defined structure.' },
  { id: 'Event', type: 'Event', description: 'A non-persistent, time-based occurrence.' },
  { id: 'Image', type: 'Image', description: 'A visual representation other than text.' },
  { id: 'Interactive resource', type: 'Interactive resource', description: 'A resource requiring interaction from the user to be understood, executed, or experienced.' },
  { id: 'Model representation', type: 'Model representation', description: 'An abstract, conceptual, graphical, mathematical or visualization model that represents empirical objects, phenomena, or physical processes.' },
  { id: 'Physical object', type: 'Physical object', description: 'A physical object or substance.' },
  { id: 'Service', type: 'Service', description: 'An organized system of apparatus, appliances, staff, etc., for supplying some function(s) required by end users.' },
  { id: 'Software', type: 'Software', description: 'A computer program other than a computational notebook, in either source code (text) or compiled form. Use this type for general software components supporting scholarly research. Use the “ComputationalNotebook” value for virtual notebooks.' },
  { id: 'Sound', type: 'Sound', description: 'A resource primarily intended to be heard.' },
  { id: 'Text', type: 'Text', description: 'A resource consisting primarily of words for reading that is not covered by any other textual resource type in this list.' },
  { id: 'Workflow', type: 'Workflow', description: 'A structured series of steps which can be executed to produce a final outcome, allowing users a means to specify and enact their work in a more reproducible manner.' }
];

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
      customTypes: defaultLicenses as string[],
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
  // State for managing custom access levels
  const [newAccessLevel, setNewAccessLevel] = useState<AccessLevelInterface>({ level: '', description: '' });

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
      updateStandardFieldProperty('repoSelector', 'repoConfig', {
        ...currentField.repoConfig,
        customRepos: repos
      });
      // Only enable if a repo is added and the box is currently unchecked
      if (!wasEnabled && repos.length > (currentField.repoConfig.customRepos?.length || 0)) {
        updateStandardFieldProperty('repoSelector', 'enabled', true);
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
      updateStandardFieldProperty('metadataStandards', 'metaDataConfig', {
        ...currentField.metaDataConfig,
        customStandards: standards // Store metadata standard data
      });
      // Only enable if a standard is added and the box is currently unchecked
      if (!wasEnabled && standards.length > (currentField.metaDataConfig.customStandards?.length || 0)) {
        updateStandardFieldProperty('metadataStandards', 'enabled', true);
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
  };

  // Handler for customize button clicks
  const handleCustomizeField = (fieldId: string) => {
    setExpandedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId) // collapse
        : [...prev, fieldId]                // expand
    );
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
      updateStandardFieldProperty('licenses', 'licensesConfig', {
        ...currentField.licensesConfig,
        mode
      });
    }
  };

  // Handler for access level mode changes (defaults, add to defaults)  
  const handleAccessLevelModeChange = (mode: 'defaults' | 'mine') => {
    const currentField = standardFields.find(f => f.id === 'accessLevels');
    if (currentField && currentField.accessLevelsConfig) {
      // When switching to 'mine' mode, pre-populate with defaults if customTypes is empty
      const customLevels = mode === 'mine' && currentField.accessLevelsConfig.customLevels.length === 0
        ? defaultAccessLevels
        : currentField.accessLevelsConfig.customLevels;

      updateStandardFieldProperty('accessLevels', 'accessLevelsConfig', {
        ...currentField.accessLevelsConfig,
        mode,
        customLevels
      });
    }
  };

  // Handler for adding custom license types
  const handleAddCustomLicenseType = () => {
    if (newLicenseType.trim()) {
      const currentField = standardFields.find(f => f.id === 'licenses');
      if (currentField && currentField.licensesConfig) {
        // Find the license object by ID and get its name
        const selectedLicense = otherLicenses.find(license => license.id === newLicenseType.trim());
        const licenseNameToAdd = selectedLicense ? selectedLicense.name : newLicenseType.trim();

        const updatedCustomTypes = [...currentField.licensesConfig.customTypes, licenseNameToAdd];
        updateStandardFieldProperty('licenses', 'licensesConfig', {
          ...currentField.licensesConfig,
          customTypes: updatedCustomTypes
        });
        setNewLicenseType('');
      }
    }
  };

  // Handler for removing custom license types
  const handleRemoveCustomLicenseType = (typeToRemove: string) => {
    const currentField = standardFields.find(f => f.id === 'licenses');
    if (currentField && currentField.licensesConfig) {
      const updatedCustomTypes = currentField.licensesConfig.customTypes.filter((type: string) => type !== typeToRemove);
      updateStandardFieldProperty('licenses', 'licensesConfig', {
        ...currentField.licensesConfig,
        customTypes: updatedCustomTypes
      });
    }
  };

  // Handler for adding custom access levels
  const handleAddCustomAccessLevel = () => {
    if (newAccessLevel.level && newAccessLevel.level.trim()) {
      const currentField = standardFields.find(f => f.id === 'accessLevels');
      if (currentField && currentField.accessLevelsConfig) {
        // Add to custom access levels array
        const updatedCustomTypes = [
          ...currentField.accessLevelsConfig.customLevels,
          { level: newAccessLevel.level.trim(), description: newAccessLevel.description?.trim() || '' }
        ];

        updateStandardFieldProperty('accessLevels', 'accessLevelsConfig', {
          ...currentField.accessLevelsConfig,
          customLevels: updatedCustomTypes
        });

        // Clear the input fields
        setNewAccessLevel({ level: '', description: '' });
      }
    }
  };

  // Handler for removing custom access levels
  const handleRemoveCustomAccessLevels = (levelToRemove: string) => {
    const currentField = standardFields.find(f => f.id === 'accessLevels');
    if (currentField && currentField.accessLevelsConfig) {
      const updatedCustomLevels = currentField.accessLevelsConfig.customLevels.filter(
        (customLevel: AccessLevelInterface) => customLevel.level !== levelToRemove
      );
      updateStandardFieldProperty('accessLevels', 'accessLevelsConfig', {
        ...currentField.accessLevelsConfig,
        customLevels: updatedCustomLevels
      });
    }
  };


  // Handler for output type mode changes (defaults, mine, add to defaults)
  const handleOutputTypeModeChange = (mode: 'defaults' | 'mine') => {
    const currentField = standardFields.find(f => f.id === 'outputType');
    if (currentField && currentField.outputTypeConfig) {
      // When switching to 'mine' mode, pre-populate with defaults if customTypes is empty
      const customTypes = mode === 'mine' && currentField.outputTypeConfig.customTypes.length === 0
        ? defaultOutputTypes
        : currentField.outputTypeConfig.customTypes;

      updateStandardFieldProperty('outputType', 'outputTypeConfig', {
        ...currentField.outputTypeConfig,
        mode,
        customTypes
      });
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
        setNewOutputType({ type: '', description: '' });
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

    if (updatedJSON) {
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
      setErrors(prevErrors => [
        ...prevErrors,
        QuestionAdd('messages.errors.questionAddingError'),
      ]);
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
  };

  // Handler for deleting additional fields
  const handleDeleteAdditionalField = (fieldId: string) => {
    setAdditionalFields(prev => prev.filter(field => field.id !== fieldId));
    setExpandedFields(prev => prev.filter(id => id !== fieldId));
    setHasUnsavedChanges(true);
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
                  description={QuestionAdd('helpText.requirementText')}
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
                  <div className={styles.fieldsContainer}>
                    <h3>{QuestionAdd('researchOutput.headings.enableStandardFields')}</h3>

                    <p className={styles.fieldsDescription}>
                      {QuestionAdd('researchOutput.description')}
                    </p>
                    <div className={styles.fieldsList}>
                      {standardFields.map((field, index) => {
                        // These fields are always required and cannot be turned off
                        const isDisabled = field.id === 'title' || field.id === 'outputType';

                        return (
                          <div key={field.id} className={styles.fieldRowWrapper}>
                            <div className={styles.fieldRow}>
                              <div className={isDisabled ? styles.tooltipWrapper : undefined}>

                                <Checkbox
                                  isSelected={field.enabled}
                                  isDisabled={isDisabled}
                                  className={
                                    `react-aria-Checkbox ${(field.id === 'title' || field.id === 'outputType')
                                      ? styles.disabledCheckbox
                                      : ''
                                    }`
                                  }

                                  onChange={(isSelected) => handleStandardFieldChange(field.id, isSelected)}
                                >
                                  <div className="checkbox">
                                    <svg viewBox="0 0 18 18" aria-hidden="true">
                                      <polyline points="1 9 7 14 15 4" />
                                    </svg>
                                  </div>
                                  <span>{field.label}</span>
                                </Checkbox>
                                {isDisabled && <span className={styles.tooltipText}>{QuestionAdd('researchOutput.tooltip.requiredFields')}</span>}
                              </div>
                              {field.id !== 'title' && (
                                <Button
                                  type="button"
                                  className={`buttonLink link`}
                                  onPress={() => handleCustomizeField(field.id)}
                                >
                                  {expandedFields.includes(field.id)
                                    ? Global('buttons.close')
                                    : nonCustomizableFieldIds.includes(field.id)
                                      ? Global('links.expand')
                                      : Global('buttons.customize')}
                                </Button>
                              )}

                            </div>

                            {/* Expanded panel OUTSIDE the .fieldRow flex container */}
                            {expandedFields.includes(field.id) && (
                              <div className={styles.fieldPanel}>
                                {/** Description */}
                                {field.id === 'description' && (
                                  <>
                                    <FormTextArea
                                      name={QuestionAdd('researchOutput.labels.descriptionLowerCase')}
                                      isRequired={false}
                                      richText={true}
                                      label={QuestionAdd('researchOutput.labels.description')}
                                      value={field.value}
                                      onChange={(newValue) => updateStandardFieldProperty('description', 'value', newValue)}
                                    />

                                    <FormInput
                                      name="descriptionHelpText"
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: QuestionAdd('researchOutput.labels.description') })}
                                      value={field.helpText || ''}
                                      onChange={(e) => updateStandardFieldProperty('description', 'helpText', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />
                                  </>
                                )}

                                {/** Data Flags Configuration */}
                                {field.id === 'dataFlags' && (
                                  <div style={{ marginBottom: '1.5rem' }}>
                                    <fieldset>
                                      <legend>{QuestionAdd('researchOutput.legends.dataFlag')}</legend>
                                      <div className={styles.dataFlagsConfig}>
                                        <RadioGroupComponent
                                          name="dataFlagsMode"
                                          value={field.flagsConfig?.mode || 'both'}
                                          description={QuestionAdd('researchOutput.dataFlags.description')}
                                          onChange={(mode) => updateStandardFieldProperty('dataFlags', 'flagsConfig', {
                                            ...field.flagsConfig,
                                            mode,
                                            showSensitiveData: mode === 'sensitiveOnly' || mode === 'both',
                                            showPersonalData: mode === 'personalOnly' || mode === 'both'
                                          })}
                                        >
                                          <div>
                                            <Radio value="sensitiveOnly">{QuestionAdd('researchOutput.dataFlags.options.sensitiveOnly')}</Radio>
                                          </div>
                                          <div>
                                            <Radio value="personalOnly">{QuestionAdd('researchOutput.dataFlags.options.personalOnly')}</Radio>
                                          </div>
                                          <div>
                                            <Radio value="both">{QuestionAdd('researchOutput.dataFlags.options.both')}</Radio>
                                          </div>
                                        </RadioGroupComponent>
                                      </div>
                                    </fieldset>
                                  </div>
                                )}

                                {/** Output Type Configuration */}
                                {field.id === 'outputType' && (
                                  <OutputTypeField
                                    field={field}
                                    newOutputType={newOutputType}
                                    setNewOutputType={setNewOutputType}
                                    onModeChange={handleOutputTypeModeChange}
                                    onAddCustomType={handleAddCustomOutputType}
                                    onRemoveCustomType={handleRemoveCustomOutputType}
                                  />
                                )}

                                {/** Repository Selector */}
                                {field.id === 'repoSelector' && (
                                  <>
                                    <RepositorySelectionSystem
                                      field={field}
                                      handleTogglePreferredRepositories={handleTogglePreferredRepositories}
                                      onRepositoriesChange={handleRepositoriesChange}
                                    />

                                    <FormTextArea
                                      name="repoSelectorDescription"
                                      isRequired={false}
                                      richText={true}
                                      label={QuestionAdd('researchOutput.repoSelector.descriptionLabel')}
                                      value={field.value}
                                      onChange={(value) => updateStandardFieldProperty('repoSelector', 'value', value)}
                                    />

                                    <FormInput
                                      name="repositoriesHelpText"
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: field.label })}
                                      value={field.helpText || ''}
                                      onChange={(e) => updateStandardFieldProperty('repoSelector', 'helpText', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />
                                  </>
                                )}

                                {/** Metadata Standards */}
                                {field.id === 'metadataStandards' && hasMetaDataConfig(field) && (
                                  <>
                                    <MetaDataStandards
                                      field={field}
                                      handleToggleMetaDataStandards={handleToggleMetaDataStandards}
                                      onMetaDataStandardsChange={handleMetaDataStandardsChange}
                                    />

                                    <FormTextArea
                                      name="metadataStandardsDescription"
                                      isRequired={false}
                                      richText={true}
                                      label={QuestionAdd('researchOutput.metaDataStandards.descriptionLabel')}
                                      value={field.value}
                                      helpMessage={QuestionAdd('researchOutput.metaDataStandards.helpText')}
                                      onChange={(value) => updateStandardFieldProperty('metaDataStandards', 'value', value)}
                                    />

                                    <FormInput
                                      name="metadataStandardsHelpText"
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: field.label })}
                                      value={field.helpText || ''}
                                      onChange={(e) => updateStandardFieldProperty('metadataStandards', 'helpText', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />
                                  </>
                                )}

                                {/**License configurations */}
                                {field.id === 'licenses' && (
                                  <>
                                    <LicenseField
                                      field={field}
                                      newLicenseType={newLicenseType}
                                      setNewLicenseType={setNewLicenseType}
                                      onModeChange={handleLicenseModeChange}
                                      onAddCustomType={handleAddCustomLicenseType}
                                      onRemoveCustomType={handleRemoveCustomLicenseType}
                                    />
                                    <FormInput
                                      name="licensesHelpText"
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: field.label })}
                                      value={field.helpText || ''}
                                      onChange={(e) => updateStandardFieldProperty('licenses', 'helpText', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />
                                  </>
                                )}

                                {/**Access level configurations */}
                                {field.id === 'accessLevels' && (
                                  <>
                                    <InitialAccessLevel
                                      field={field}
                                      newAccessLevel={newAccessLevel}
                                      setNewAccessLevel={setNewAccessLevel}
                                      onModeChange={handleAccessLevelModeChange}
                                      onAddCustomType={handleAddCustomAccessLevel}
                                      onRemoveCustomType={handleRemoveCustomAccessLevels}
                                    />

                                    <FormInput
                                      name="accessLevelsHelpText"
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: field.label })}
                                      value={field.helpText || ''}
                                      onChange={(e) => updateStandardFieldProperty('accessLevels', 'helpText', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />
                                  </>
                                )}
                              </div>
                            )}
                            {index < standardFields.length - 1 && <hr className={styles.fieldDivider} />}

                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.fieldsContainer}>
                      <h3>{QuestionAdd('researchOutput.headings.additionalTextFields')}</h3>
                      <div className={styles.fieldsList}>
                        {additionalFields.map((field, index) => {

                          return (
                            <div key={field.id} className={styles.fieldRowWrapper}>
                              <div className={styles.fieldRow}>
                                <Checkbox
                                  isSelected={field.enabled}
                                  onChange={(isSelected) => handleStandardFieldChange(field.id, isSelected)}
                                >
                                  <div className="checkbox">
                                    <svg viewBox="0 0 18 18" aria-hidden="true">
                                      <polyline points="1 9 7 14 15 4" />
                                    </svg>
                                  </div>
                                  <span>{field.customLabel !== undefined && field.customLabel !== '' ? field.customLabel : field.label}</span>
                                </Checkbox>
                                <div className={styles.fieldActions}>
                                  <Button
                                    type="button"
                                    className={`buttonLink link`}
                                    onPress={() => handleCustomizeField(field.id)}
                                  >
                                    {expandedFields.includes(field.id) ? Global('buttons.close') : Global('buttons.customize')}
                                  </Button>

                                  <Button
                                    type="button"
                                    className={`buttonLink link ${styles.deleteButton}`}
                                    onPress={() => handleDeleteAdditionalField(field.id)}
                                    aria-label={`Delete ${field.label}`}
                                  >
                                    {Global('buttons.delete')}
                                  </Button>

                                </div>
                              </div>

                              {/* Expanded panel for Additional Custom Fields */}
                              {expandedFields.includes(field.id) && (
                                <div className={styles.customizePanel}>
                                  <div className={styles.fieldCustomization}>
                                    {/* Field Label */}
                                    <FormInput
                                      name={`${field.id}_label`}
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('researchOutput.additionalFields.fieldLabel.label')}
                                      value={field.customLabel !== undefined ? field.customLabel : field.label}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'customLabel', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.additionalFields.fieldLabel.helpText')}
                                    />

                                    {/* Help Text */}
                                    <FormInput
                                      name={`${field.id}_help`}
                                      isRequired={false}
                                      label={QuestionAdd('labels.helpText', { fieldName: field.customLabel || field.label })}
                                      value={field.helpText}
                                      onChange={(value) => handleUpdateAdditionalField(field.id, 'helpText', value)}
                                      helpMessage={QuestionAdd('researchOutput.helpText')}
                                      maxLength={300}
                                    />

                                    {/* Max Length for text field */}
                                    <FormInput
                                      name={`${field.id}_maxLength`}
                                      type="number"
                                      isRequired={false}
                                      label={QuestionAdd('researchOutput.additionalFields.maxLength.label')}
                                      value={field.maxLength || ''}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'maxLength', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.additionalFields.maxLength.helpText')}
                                    />

                                    {/* Default Value for the custom field */}
                                    <FormInput
                                      name={`${field.id}_defaultValue`}
                                      type="text"
                                      isRequired={false}
                                      label={QuestionAdd('researchOutput.additionalFields.defaultValue.label')}
                                      value={field.defaultValue}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'defaultValue', e.currentTarget.value)}
                                      helpMessage={QuestionAdd('researchOutput.additionalFields.defaultValue.helpText')}
                                    />
                                  </div>
                                </div>
                              )}
                              {index < additionalFields.length - 1 && <hr className={styles.fieldDivider} />}
                            </div>
                          );
                        })}
                        <div className={styles.additionalFieldsContainer}>
                          <Button
                            type="button"
                            className={styles.addFieldButton}
                            onPress={addAdditionalField}
                          >
                            + {QuestionAdd('researchOutput.additionalFields.addFieldBtn')}
                          </Button>
                        </div>
                      </div>
                    </div>

                  </div>
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

