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
import CustomizeFieldForm from '@/components/QuestionAdd/CustomizeFieldForm';

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

const defaultQuestion = {
  guidanceText: '',
  requirementText: '',
  sampleText: '',
  useSampleTextAsDefault: false,
  required: false,
};

type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];


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

  const [expandedFields, setExpandedFields] = useState<string[]>([]);

  // Standard fields for research output questions
  const [standardFields, setStandardFields] = useState([
    { id: 'title', label: 'Title', enabled: true, required: true },
    { id: 'description', label: 'Description', enabled: true, placeholder: '', helpText: '', maxLength: '', required: true },
    {
      id: 'outputType',
      label: 'Output Type',
      enabled: true,
      helpText: '',
      required: true,
      outputTypeConfig: {
        mode: 'defaults' as const,
        selectedDefaults: [],
        customTypes: []
      }
    },
    { id: 'dataFlags', label: 'Data Flags', enabled: false, helpText: '', defaultValue: '', allowMultiple: false },
    { id: 'intendedRepos', label: 'Intended Repositories', enabled: false, placeholder: '', helpText: '', enableSearch: false },
    { id: 'metadataStandards', label: 'Metadata Standards', enabled: false, helpText: '', showSuggestions: false },
    { id: 'licenses', label: 'Licenses', enabled: false, defaultValue: '', helpText: '', showDescriptions: false },
  ]);

  // Additional fields for research output questions
  const [additionalFields, setAdditionalFields] = useState([
    { id: 'retentionPeriod', label: 'Retention Period', enabled: true, defaultValue: '', customLabel: '', helpText: '' },
    { id: 'fundingSource', label: 'Funding Source', enabled: false, placeholder: '', helpText: '', linkToDatabase: false },
    { id: 'conclusions', label: 'Conclusions', enabled: false, placeholder: '', maxLength: '', helpText: '' }
  ]);


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

  // Handler for standard field checkbox changes
  const handleStandardFieldChange = (fieldId: string, enabled: boolean) => {
    setStandardFields(prev =>
      prev.map(field =>
        field.id === fieldId ? { ...field, enabled } : field
      )
    );
    setHasUnsavedChanges(true);
  };

  // Handler for customize button clicks
  const handleCustomizeField = (fieldId: string) => {
    setExpandedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId) // collapse
        : [...prev, fieldId]                // expand
    );
  };

  const handleCustomizeOptions = (fieldId: string, updatedValues: Record<string, any>) => {
    // Update standard fields
    setStandardFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updatedValues } : field
      )
    );

    // Update additional fields
    setAdditionalFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updatedValues } : field
      )
    );

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
    console.log('Add additional field clicked');
  }
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
                                {isDisabled && <span className={styles.tooltipText}>Always required</span>}
                              </div>
                              <Button
                                type="button"
                                className={`buttonLink link`}
                                onPress={() => handleCustomizeField(field.id)}
                                isDisabled={!field.enabled}
                              >
                                {expandedFields.includes(field.id) ? "Close" : "Customize"}
                              </Button>
                            </div>

                            {/* Expanded panel OUTSIDE the .fieldRow flex container */}
                            {expandedFields.includes(field.id) && (
                              <div className={styles.customizePanel}>
                                <CustomizeFieldForm field={field} onChange={handleCustomizeOptions} />
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
                        {additionalFields.map((field, index) => (
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
                                <span>{field.label}</span>
                              </Checkbox>
                              <Button
                                type="button"
                                className={`buttonLink link`}
                                onPress={() => handleCustomizeField(field.id)}
                                isDisabled={!field.enabled}
                              >
                                {expandedFields.includes(field.id) ? "Close" : "Customize"}
                              </Button>
                            </div>

                            {/* Expanded panel for additional fields */}
                            {expandedFields.includes(field.id) && (
                              <div className={styles.customizePanel}>
                                <CustomizeFieldForm field={field} onChange={handleCustomizeOptions} />
                              </div>
                            )}
                            {index < additionalFields.length - 1 && <hr className={styles.fieldDivider} />}
                          </div>
                        ))}
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

