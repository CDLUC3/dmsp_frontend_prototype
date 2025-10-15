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
  Dialog,
  DialogTrigger,
  Form,
  Heading,
  Input,
  Label,
  Link,
  ListBoxItem,
  Modal,
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

// Components
import PageHeader from "@/components/PageHeader";
import {
  FormInput,
  FormSelect,
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
import styles from './questionAdd.module.scss';
import { set } from 'zod';

const defaultQuestion = {
  guidanceText: '',
  requirementText: '',
  sampleText: '',
  useSampleTextAsDefault: false,
  required: false,
};

type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];

type DataFlagsConfig = {
  showSensitiveData: boolean;
  showPersonalData: boolean;
  mode: 'sensitiveOnly' | 'personalOnly' | 'both';
};

type RepoConfig = {
  hasCustomRepos: boolean;
  customRepos: string[];
}

type StandardField = {
  id: string;
  label: string;
  enabled: boolean;
  [key: string]: any; // For additional properties like helpText, required, etc.
  flagsConfig?: DataFlagsConfig;
  repoConfig?: RepoConfig;
};

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

  const [expandedFields, setExpandedFields] = useState<string[]>(['title', 'outputType']);
  const [isReposModalOpen, setReposModalOpen] = useState<boolean>(false);
  const outputTypeOptions = [
    { id: 'defaults', name: 'Use defaults' },
    { id: 'mine', name: 'Use mine' },
    { id: 'addToDefaults', name: 'Add mine to defaults' }
  ]
  const licenseTypeOptions = [
    { id: 'defaults', name: 'Use defaults' },
    { id: 'addToDefaults', name: 'Use mine' }
  ]
  // Default output types
  const defaultOutputTypes = [
    'Audiovisual',
    'Collection',
    'Data paper',
    'Dataset',
    'Event',
    'Image',
    'Interactive resource',
    'Model representation',
    'Physical object',
    'Service',
    'Software',
    'Sound',
    'Text',
    'Workflow'
  ];

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

  // Other licenses
  const otherLicenses = [
    { id: 'obsd', name: 'OBSD' },
    { id: 'aal', name: 'AAL' },
    { id: 'adsl', name: 'ADSL' },
    { id: 'afl11', name: 'AFL-1.1' },
    { id: 'aml', name: 'AML' }
  ]

  // Standard fields for research output questions
  const [standardFields, setStandardFields] = useState([
    { id: 'title', label: 'Title', enabled: true, required: true },
    { id: 'description', label: 'Description', enabled: false, placeholder: '', helpText: '', maxLength: '', required: true, value: '' },
    {
      id: 'outputType',
      label: 'Output Type',
      enabled: true,
      helpText: '',
      required: true,
      outputTypeConfig: {
        mode: 'defaults' as 'defaults' | 'mine' | 'addToDefaults',
        selectedDefaults: [] as string[],
        customTypes: [] as string[]
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
      label: 'Repo selector',
      enabled: false,
      placeholder: '',
      helpText: '',
      enableSearch: false,
      value: '',
      repoConfig: {
        hasCustomRepos: false,
        customRepos: [] as string[],
      }
    },
    {
      id: 'metadataStandards',
      label: 'Metadata Standards',
      enabled: false,
      helpText: '',
      showSuggestions: false,
      metaDataConfig: {
        hasCustomStandards: false,
        customStandards: [] as number[],
      }
    },
    {
      id: 'licenses',
      label: 'Licenses',
      enabled: false,
      defaultValue: '',
      helpText: '',
      showDescriptions: false,
      licensesConfig: {
        mode: 'defaults' as 'defaults' | 'addToDefaults',
        selectedDefaults: [] as string[],
        customTypes: defaultLicenses as string[],
      }
    },
  ]);

  // Additional fields for research output questions
  const [additionalFields, setAdditionalFields] = useState([
    { id: 'retentionPeriod', label: 'Retention Period', enabled: true, defaultValue: '', customLabel: '', helpText: '' },
    { id: 'fundingSource', label: 'Funding Source', enabled: false, placeholder: '', helpText: '', linkToDatabase: false },
    { id: 'conclusions', label: 'Conclusions', enabled: false, placeholder: '', maxLength: '', helpText: '' }
  ]);

  // State for managing custom output types
  const [newOutputType, setNewOutputType] = useState<string>('');
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
  const updateStandardFieldProperty = (fieldId: string, propertyName: string, value: any) => {
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
      handleCustomizeField(fieldId);
    } else {
      removeCustomizeField(fieldId);
    }
  };

  const removeCustomizeField = (fieldId: string) => {
    setExpandedFields(prev => prev.filter(id => id !== fieldId));
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
      const updatedCustomTypes = currentField.licensesConfig.customTypes.filter(type => type !== typeToRemove);
      updateStandardFieldProperty('licenses', 'licensesConfig', {
        ...currentField.licensesConfig,
        customTypes: updatedCustomTypes
      });
    }
  };

  // Handler for output type mode changes (defaults, mine, add to defaults)
  const handleOutputTypeModeChange = (mode: 'defaults' | 'mine' | 'addToDefaults') => {
    const currentField = standardFields.find(f => f.id === 'outputType');
    if (currentField && currentField.outputTypeConfig) {
      updateStandardFieldProperty('outputType', 'outputTypeConfig', {
        ...currentField.outputTypeConfig,
        mode
      });
    }
  };

  // Handler for adding custom output types
  const handleAddCustomOutputType = () => {
    if (newOutputType.trim()) {
      const currentField = standardFields.find(f => f.id === 'outputType');
      if (currentField && currentField.outputTypeConfig) {
        const updatedCustomTypes = [...currentField.outputTypeConfig.customTypes, newOutputType.trim()];
        updateStandardFieldProperty('outputType', 'outputTypeConfig', {
          ...currentField.outputTypeConfig,
          customTypes: updatedCustomTypes
        });
        setNewOutputType('');
      }
    }
  };

  // Handler for removing custom output types
  const handleRemoveCustomOutputType = (typeToRemove: string) => {
    const currentField = standardFields.find(f => f.id === 'outputType');
    if (currentField && currentField.outputTypeConfig) {
      const updatedCustomTypes = currentField.outputTypeConfig.customTypes.filter(type => type !== typeToRemove);
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
      enabled: false, // Default to not required
      defaultValue: '',
      customLabel: '',
      helpText: ''
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
  const handleUpdateAdditionalField = (fieldId: string, propertyName: string, value: any) => {
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
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
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
            <TabList aria-label="Question editing">
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
                    <h3>Enable Standard Fields</h3>

                    <p className={styles.fieldsDescription}>
                      Select which standard fields to include in your research output question. You can customize each field individually.
                    </p>
                    <div className={styles.fieldsList}>
                      {standardFields.map((field, index) => {
                        const isExpanded = expandedFields.includes(field.id);
                        const isDisabled = field.id === 'title' || field.id === 'outputType';// These fields are already required

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
                                {isDisabled && <span className={styles.tooltipText}>These fields are required</span>}
                              </div>
                              {field.id !== 'title' && (
                                <Button
                                  type="button"
                                  className={`buttonLink link`}
                                  onPress={() => handleCustomizeField(field.id)}
                                // isDisabled={!field.enabled}
                                >
                                  {expandedFields.includes(field.id) ? "Close" : "Customize"}
                                </Button>
                              )}

                            </div>

                            {/* Expanded panel OUTSIDE the .fieldRow flex container */}
                            {expandedFields.includes(field.id) && (
                              <div className={styles.fieldPanel}>
                                {/** Title */}
                                {field.id === 'title' && (
                                  <Checkbox
                                    onChange={() => updateStandardFieldProperty('title', 'required', !field.required)}
                                    isSelected={field.required}
                                  >
                                    <div className="checkbox">
                                      <svg viewBox="0 0 18 18" aria-hidden="true">
                                        <polyline points="1 9 7 14 15 4" />
                                      </svg>
                                    </div>
                                    Is Required field
                                  </Checkbox>
                                )}

                                {/** Description */}
                                {field.id === 'description' && (
                                  <FormTextArea
                                    name="description"
                                    isRequired={false}
                                    richText={true}
                                    label="Description"
                                    value={field.value}
                                    onChange={(newValue) => updateStandardFieldProperty('description', 'value', newValue)}
                                  />
                                )}

                                {/** Data Flags Configuration */}
                                {field.id === 'dataFlags' && (
                                  <div className={styles.dataFlagsConfig}>
                                    <RadioGroupComponent
                                      name="dataFlagsMode"
                                      value={field.flagsConfig?.mode || 'both'}
                                      radioGroupLabel="Which data flags to display:"
                                      description="Select which data sensitivity flags should be shown to users"
                                      onChange={(mode) => updateStandardFieldProperty('dataFlags', 'flagsConfig', {
                                        ...field.flagsConfig,
                                        mode,
                                        showSensitiveData: mode === 'sensitiveOnly' || mode === 'both',
                                        showPersonalData: mode === 'personalOnly' || mode === 'both'
                                      })}
                                    >
                                      <div>
                                        <Radio value="sensitiveOnly">Display only "May contain sensitive data?" checkbox</Radio>
                                      </div>
                                      <div>
                                        <Radio value="personalOnly">Display only "May contain personally identifiable information?" checkbox</Radio>
                                      </div>
                                      <div>
                                        <Radio value="both">Display both data flag checkboxes</Radio>
                                      </div>
                                    </RadioGroupComponent>
                                  </div>
                                )}

                                {/** Output Type Configuration */}
                                {field.id === 'outputType' && (

                                  <div className={styles.outputTypeConfig}>
                                    <div className={styles.outputTypeModeSelector}>
                                      <FormSelect
                                        label="Define output types"
                                        ariaLabel="define output types"
                                        isRequired={false}
                                        name="status"
                                        items={outputTypeOptions}
                                        onChange={(value) =>
                                          handleOutputTypeModeChange(
                                            value as 'defaults' | 'mine' | 'addToDefaults'
                                          )
                                        }
                                        selectedKey={field.outputTypeConfig?.mode || 'defaults'}
                                      >
                                        {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                                      </FormSelect>
                                    </div>

                                    {/* --- USE DEFAULTS MODE --- */}
                                    {field.outputTypeConfig?.mode === 'defaults' && (
                                      <div className={styles.defaultOutputTypes}>
                                        <fieldset>
                                          <legend>Default Output Types</legend>
                                          <ul className={`${styles.outputTypesList} ${styles.bulletList}`}>
                                            {defaultOutputTypes.map((outputType) => (
                                              <li key={outputType} className={styles.outputTypeItem}>
                                                <span>{outputType}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </fieldset>
                                      </div>
                                    )}

                                    {/* --- USE MINE MODE --- */}
                                    {field.outputTypeConfig?.mode === 'mine' && (
                                      <div className={styles.customOutputTypes}>
                                        <fieldset>
                                          <legend>My Output Types</legend>

                                          {/* Add new custom types */}
                                          <div className={styles.addOutputTypeContainer}>
                                            <FormInput
                                              name="custom_types"
                                              type="text"
                                              isRequired={false}
                                              label="Enter an output type"
                                              className={styles.outputTypeWrapper}
                                              value={newOutputType}
                                              onChange={(e) => setNewOutputType(e.target.value)}
                                              aria-label="Enter an output type"
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  handleAddCustomOutputType();
                                                }
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              onPress={handleAddCustomOutputType}
                                              isDisabled={!newOutputType.trim()}
                                            >
                                              Add output type
                                            </Button>
                                          </div>

                                          {/* List of custom types (with delete 'x') */}
                                          {field.outputTypeConfig?.customTypes?.length > 0 && (
                                            <ul className={`${styles.customOutputTypesList} ${styles.deletableList}`}>
                                              {field.outputTypeConfig.customTypes.map((customType, index) => (
                                                <li key={index} className={styles.customOutputTypeItem}>
                                                  <span>{customType}</span>
                                                  <Button
                                                    type="button"
                                                    className={styles.removeButton}
                                                    onPress={() => handleRemoveCustomOutputType(customType)}
                                                    aria-label={`Remove ${customType}`}
                                                  >
                                                    x
                                                  </Button>
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </fieldset>
                                      </div>
                                    )}

                                    {/* --- ADD TO DEFAULTS MODE (unchanged) --- */}
                                    {field.outputTypeConfig?.mode === 'addToDefaults' && (
                                      <>
                                        <div className={styles.defaultOutputTypes}>
                                          <fieldset>
                                            <legend>Default Output Types</legend>
                                            <ul className={`${styles.outputTypesList} ${styles.bulletList}`}>
                                              {defaultOutputTypes.map((outputType) => (
                                                <li key={outputType} className={styles.outputTypeItem}>
                                                  <span>{outputType}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </fieldset>
                                        </div>

                                        {/* Add user-defined types (same logic as before) */}
                                        <div className={styles.customOutputTypes}>
                                          <fieldset>
                                            <legend>My Output Types</legend>
                                            <div className={styles.addOutputTypeContainer}>
                                              <Input
                                                type="text"
                                                value={newOutputType}
                                                onChange={(e) => setNewOutputType(e.target.value)}
                                                placeholder="Enter an output type"
                                                aria-label="Enter an output type"
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomOutputType();
                                                  }
                                                }}
                                              />
                                              <Button
                                                type="button"
                                                onPress={handleAddCustomOutputType}
                                                isDisabled={!newOutputType.trim()}
                                              >
                                                Add output type
                                              </Button>
                                            </div>
                                            {field.outputTypeConfig?.customTypes?.length > 0 && (
                                              <ul className={styles.customOutputTypesList}>
                                                {field.outputTypeConfig.customTypes.map((customType, index) => (
                                                  <li key={index} className={styles.customOutputTypeItem}>
                                                    <span>{customType}</span>
                                                    <Button
                                                      type="button"
                                                      className={styles.removeButton}
                                                      onPress={() => handleRemoveCustomOutputType(customType)}
                                                      aria-label={`Remove ${customType}`}
                                                    >
                                                      x
                                                    </Button>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </fieldset>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                                {/** Repository Selector */}
                                {field.id === 'repoSelector' && (
                                  <>
                                    <RepositorySelectionSystem
                                      field={field}
                                      handleTogglePreferredRepositories={handleTogglePreferredRepositories}
                                      updateStandardFieldProperty={updateStandardFieldProperty}
                                    />

                                    <FormTextArea
                                      name="repoSelectorDescription"
                                      isRequired={false}
                                      richText={true}
                                      label="Description for Repositories field"
                                      value={field.value}
                                      onChange={(value) => updateStandardFieldProperty('repoSelector', 'value', value)}
                                    />
                                  </>
                                )}

                                {/** Metadata Standards */}
                                {field.id === 'metadataStandards' && (
                                  <>
                                    <MetaDataStandards
                                      field={field}
                                      handleToggleMetaDataStandards={handleToggleMetaDataStandards}
                                      updateStandardFieldProperty={updateStandardFieldProperty}
                                    />

                                    <FormTextArea
                                      name="metadataStandardsDescription"
                                      isRequired={false}
                                      richText={true}
                                      label="Description for Metadata Standards field"
                                      value={field.value}
                                      helpMessage="This can be used to provide custom guidance and/or instructions for researchers."
                                      onChange={(value) => updateStandardFieldProperty('metadataStandards', 'value', value)}
                                    />

                                    <DialogTrigger>
                                      <Button>Open Dialog</Button>
                                      <Modal
                                        isDismissable
                                        isOpen={isReposModalOpen}
                                        onOpenChange={setReposModalOpen.bind(this, !isReposModalOpen)}
                                      >
                                        <Dialog>
                                          {({ close }) => ( // The 'close' function is provided by DialogTrigger
                                            <>
                                              <Heading slot="title">Metadata Standard search</Heading>
                                              <div>

                                              </div>
                                              <p>This is the content of the modal.</p>
                                              <Button onPress={close}>Close</Button> {/* Using the 'close' function */}
                                            </>
                                          )}
                                        </Dialog>
                                      </Modal>
                                    </DialogTrigger>
                                  </>
                                )}


                                {/**License configurations */}
                                {field.id === 'licenses' && (

                                  <div className={styles.outputTypeConfig}>
                                    <div className={styles.outputTypeModeSelector}>
                                      <FormSelect
                                        label="Define preferred licenses"
                                        ariaLabel="define preferred licenses"
                                        isRequired={false}
                                        name="status"
                                        items={licenseTypeOptions}
                                        onChange={(value) =>
                                          handleLicenseModeChange(
                                            value as 'defaults' | 'addToDefaults'
                                          )
                                        }
                                        selectedKey={field.licensesConfig?.mode || 'defaults'}
                                      >
                                        {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                                      </FormSelect>
                                    </div>

                                    {/* --- USE DEFAULTS MODE --- */}
                                    {field.licensesConfig?.mode === 'defaults' && (
                                      <div className={styles.defaultOutputTypes}>
                                        <fieldset>
                                          <legend>Default Preferred Licenses</legend>
                                          <ul className={`${styles.outputTypesList} ${styles.bulletList}`}>
                                            {defaultLicenses.map((outputType) => (
                                              <li key={outputType} className={styles.outputTypeItem}>
                                                <span>{outputType}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </fieldset>
                                      </div>
                                    )}


                                    {/* --- ADD TO DEFAULTS MODE (unchanged) --- */}
                                    {field.licensesConfig?.mode === 'addToDefaults' && (
                                      <>

                                        {/* Add user-defined types (same logic as before) */}
                                        <div className={styles.customOutputTypes}>
                                          <fieldset>
                                            <legend>My Licenses</legend>
                                            <div className={styles.addLicenseTypeContainer}>
                                              <FormSelect
                                                label="Add license"
                                                ariaLabel="Add license"
                                                isRequired={false}
                                                name="add-license"
                                                items={otherLicenses}
                                                selectClasses={styles.licenseSelector}
                                                onChange={(value) => setNewLicenseType(value)}
                                                selectedKey={field.licensesConfig?.mode || 'defaults'}
                                              >
                                                {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                                              </FormSelect>
                                              <Button
                                                type="button"
                                                onPress={handleAddCustomLicenseType}
                                                isDisabled={!newLicenseType.trim()}
                                              >
                                                Add license type
                                              </Button>
                                            </div>
                                            {field.licensesConfig?.customTypes?.length > 0 && (
                                              <ul className={styles.customOutputTypesList}>
                                                {field.licensesConfig.customTypes.map((customType, index) => (
                                                  <li key={index} className={styles.customOutputTypeItem}>
                                                    <span>{customType}</span>
                                                    <Button
                                                      type="button"
                                                      className={styles.removeButton}
                                                      onPress={() => handleRemoveCustomLicenseType(customType)}
                                                      aria-label={`Remove ${customType}`}
                                                    >
                                                      x
                                                    </Button>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </fieldset>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}

                              </div>
                            )}
                            {index < standardFields.length - 1 && <hr className={styles.fieldDivider} />}

                          </div>
                        );
                      })}
                    </div>

                    <div className={styles.fieldsContainer}>
                      <h3>Additional Text Fields</h3>
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
                                  <span>{field.customLabel || field.label}</span>
                                </Checkbox>
                                <div className={styles.fieldActions}>
                                  <Button
                                    type="button"
                                    className={`buttonLink link`}
                                    onPress={() => handleCustomizeField(field.id)}
                                  >
                                    {expandedFields.includes(field.id) ? "Close" : "Customize"}
                                  </Button>

                                  <Button
                                    type="button"
                                    className={`buttonLink link ${styles.deleteButton}`}
                                    onPress={() => handleDeleteAdditionalField(field.id)}
                                    aria-label={`Delete ${field.label}`}
                                  >
                                    Delete
                                  </Button>

                                </div>
                              </div>

                              {/* Expanded panel for Additional Fields */}
                              {expandedFields.includes(field.id) && (
                                <div className={styles.customizePanel}>
                                  <div className={styles.fieldCustomization}>
                                    {/* Field Label */}
                                    <FormInput
                                      name={`${field.id}_label`}
                                      type="text"
                                      isRequired={false}
                                      label="Field Label"
                                      value={field.customLabel || field.label}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'customLabel', e.currentTarget.value)}
                                      helpMessage="The label that will be displayed for this field"
                                    />

                                    {/* Help Text */}
                                    <FormTextArea
                                      name={`${field.id}_help`}
                                      isRequired={false}
                                      richText={false}
                                      label="Help Text"
                                      value={field.helpText}
                                      onChange={(value) => handleUpdateAdditionalField(field.id, 'helpText', value)}
                                      helpMessage="Optional help text to guide users"
                                    />

                                    {/* Placeholder for text field */}
                                    <FormInput
                                      name={`${field.id}_placeholder`}
                                      type="text"
                                      isRequired={false}
                                      label="Placeholder Text"
                                      value={field.placeholder || ''}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'placeholder', e.currentTarget.value)}
                                      helpMessage="Placeholder text shown in the input field"
                                    />

                                    {/* Max Length for text field */}
                                    <FormInput
                                      name={`${field.id}_maxLength`}
                                      type="number"
                                      isRequired={false}
                                      label="Maximum Length"
                                      value={field.maxLength || ''}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'maxLength', e.currentTarget.value)}
                                      helpMessage="Maximum number of characters allowed (leave empty for no limit)"
                                    />

                                    {/* Default Value for the custom field */}
                                    <FormInput
                                      name={`${field.id}_defaultValue`}
                                      type="text"
                                      isRequired={false}
                                      label="Default Value"
                                      value={field.defaultValue}
                                      onChange={(e) => handleUpdateAdditionalField(field.id, 'defaultValue', e.currentTarget.value)}
                                      helpMessage="Default value for this field"
                                    />

                                    {/* Is a required field */}
                                    <Checkbox
                                      onChange={() => handleUpdateAdditionalField(field.id, 'enabled', !field.enabled)}
                                      isSelected={field.enabled || false}
                                    >
                                      <div className="checkbox">
                                        <svg viewBox="0 0 18 18" aria-hidden="true">
                                          <polyline points="1 9 7 14 15 4" />
                                        </svg>
                                      </div>
                                      Is Required field
                                    </Checkbox>
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
                            + Add additional field
                          </Button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/** Research Output question types have "required" at individual fields, and not on the whole question */}
                {questionType !== RESEARCH_OUTPUT_QUESTION_TYPE && (

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
                )}

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

