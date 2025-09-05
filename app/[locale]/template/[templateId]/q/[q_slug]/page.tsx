'use client'

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
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
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextField
} from "react-aria-components";

// GraphQL queries and mutations
import {
  QuestionErrors,
  useQuestionQuery,
  useUpdateQuestionMutation,
  useRemoveQuestionMutation,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import QuestionPreview from '@/components/QuestionPreview';
import {
  FormInput,
  RadioGroupComponent,
  RangeComponent,
  TypeAheadSearch
} from '@/components/Form';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionView from '@/components/QuestionView';

//Other
import { useToast } from '@/context/ToastContext';

import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import {
  getQuestionFormatInfo,
  getQuestionTypes,
  questionTypeHandlers
} from '@/utils/questionTypeHandlers';
import { checkErrors } from '@/utils/errorHandler';
import { QuestionTypeMap } from "@dmptool/types";
import {
  Question,
  QuestionOptions,
  QuestionFormatInterface
} from '@/app/types';
import {
  RANGE_QUESTION_TYPE,
  TYPEAHEAD_QUESTION_TYPE,
  DATE_RANGE_QUESTION_TYPE,
  NUMBER_RANGE_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE
} from '@/lib/constants';
import {
  isOptionsType,
  getOverrides,
} from './hooks/useEditQuestion';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';

import styles from './questionEdit.module.scss';

// Define the type for the options in json.options
interface Option {
  label: string;
  value: string;
  selected?: boolean;
  checked?: boolean;
}

type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];

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

  // Initialize update question mutation
  const [updateQuestionMutation] = useUpdateQuestionMutation();
  const [removeQuestionMutation] = useRemoveQuestionMutation();

  // localization keys
  const Global = useTranslations('Global');
  const t = useTranslations('QuestionEdit');

  // Set URLs
  const TEMPLATE_URL = routePath('template.show', { templateId });

  const radioData = {
    radioGroupLabel: Global('labels.requiredField'),
    radioButtonData: [
      {
        value: 'yes',
        label: Global('form.yesLabel'),
      },
      {
        value: 'no',
        label: Global('form.noLabel')
      }
    ]
  }


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
    router.push(routePath('template.q.new', { templateId }, { section_id: sectionId, step: 1, questionId: questionId }))
    //window.location.href = routePath('template.q.new', { templateId }, { section_id: sectionId, step: 1, questionId: questionId });
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
    const { parsed, error } = getParsedQuestionJSON(question, routePath('template.q.slug', { templateId, q_slug: questionId }), Global);

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

  // Handle form submission to update the question
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Set formSubmitted to true to indicate the form has been submitted
    setFormSubmitted(true);

    if (question) {
      const updatedJSON = buildUpdatedJSON(question);

      // Strip all tags from questionText before sending to backend
      const cleanedQuestionText = stripHtmlTags(question.questionText ?? '');

      try {
        // Add mutation for question
        const response = await updateQuestionMutation({
          variables: {
            input: {
              questionId: Number(questionId),
              displayOrder: question.displayOrder,
              json: JSON.stringify(updatedJSON ? updatedJSON.data : ''),
              questionText: cleanedQuestionText,
              requirementText: question.requirementText,
              guidanceText: question.guidanceText,
              sampleText: question.sampleText,
              useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
              required: question.required
            }
          },
        });

        const [hasErrors, errs] = checkErrors(
          response?.data?.updateQuestion?.errors as QuestionErrors,
          ['general', 'questionText']
        );

        if (hasErrors) {
          setErrors([String(errs.general)]);
        } else {
          setIsSubmitting(false);
          // Show success message and redirect to Edit Template page
          toastState.add(t('messages.success.questionUpdated'), { type: 'success' });
          router.push(TEMPLATE_URL);
        }
      } catch (error) {
        if (!(error instanceof ApolloError)) {
          setErrors(prevErrors => [...prevErrors, t('messages.errors.questionUpdateError')]);
        }
      } finally {
        setIsSubmitting(false);
        setHasUnsavedChanges(false);
      }
    }
  }

  // Handle form submission to delete the question
  const handleDelete = async () => {
    try {
      const response = await removeQuestionMutation({
        variables: {
          questionId: Number(questionId),
        }
      });

      if (response?.data) {
        // Show success message and redirect to Edit Template page
        toastState.add(t('messages.success.questionRemoved'), { type: 'success' });
        router.push(TEMPLATE_URL);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        //
      } else {
        // Handle other types of errors
        setErrors(prevErrors => [...prevErrors, t('messages.errors.questionRemoveError')]);
      }
    }
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
            .map((option: Option, index: number) => ({
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
                  description={t('helpText.requirementText')}
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
                  value={question?.guidanceText ? question.guidanceText : ''}
                  onChange={(newValue) => {
                    setQuestion(prev => ({
                      ...prev,
                      guidanceText: newValue
                    }));
                    setHasUnsavedChanges(true);
                  }}
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

                <RadioGroupComponent
                  name="radioGroup"
                  value={question?.required ? 'yes' : 'no'}
                  radioGroupLabel={radioData.radioGroupLabel}
                  radioButtonData={radioData.radioButtonData}
                  description={Global('descriptions.requiredFieldDescription')}
                  onChange={handleRadioChange}
                />
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
