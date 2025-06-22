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
  Form,
  Input,
  Label,
  Link,
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
  useQuestionTypesLazyQuery,
  useUpdateQuestionMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import QuestionPreview from '@/components/QuestionPreview';
import {
  FormInput,
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
import { questionTypeHandlers, QuestionTypeMap } from '@/utils/questionTypeHandlers';
import {
  Question,
  QuestionOptions,
  QuestionTypesInterface
} from '@/app/types';
import {
  isOptionsType,
  getOverrides,
  getParsedQuestionJSON
} from './hooks/useEditQuestion';

import styles from './questionEdit.module.scss';

// Define the type for the options in json.options
interface Option {
  type: string;
  attributes: {
    label: string;
    value: string;
    selected?: boolean;
    checked?: boolean;
  };
}

type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];


const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastState = useToast(); // Access the toast state from context
  const templateId = String(params.templateId);
  const questionId = params.q_slug; //question id
  const questionTypeIdQueryParam = searchParams.get('questionType') || null;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 0, text: "", isSelected: false }]);
  const [questionType, setQuestionType] = useState<string>('');
  const [questionTypes, setQuestionTypes] = useState<QuestionTypesInterface[]>([]);
  const [questionTypeName, setQuestionTypeName] = useState<string>(''); // Added to store friendly question name
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dateRangeLabels, setDateRangeLabels] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [typeaheadHelpText, setTypeAheadHelpText] = useState<string>('');
  const [typeaheadSearchLabel, setTypeaheadSearchLabel] = useState<string>('');
  const [parsedQuestionJSON, setParsedQuestionJSON] = useState<AnyParsedQuestion>();


  // Initialize update question mutation
  const [updateQuestionMutation] = useUpdateQuestionMutation();

  // localization keys
  const Global = useTranslations('Global');
  const QuestionEdit = useTranslations('QuestionEdit');

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

  // Get question types if the questionType is in the query param
  const [getQuestionTypes, {
    data: questionTypesData,
    error: questionTypesError,
  }] = useQuestionTypesLazyQuery();


  // Update rows state and question.json when options change
  const updateRows = (newRows: QuestionOptions[]) => {
    setRows(newRows);

    // Only update `question.json` if it's an options question
    if (hasOptions && questionType && question?.json) {
      if (parsedQuestionJSON) {
        const formState = {
          options: newRows.map(row => ({
            label: row.text,
            value: row.text,
            selected: row.isSelected,
          })),
        };

        const updatedJSON = questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](
          parsedQuestionJSON,
          formState
        );

        // Store the updated JSON string in question.json
        setQuestion((prev) => ({
          ...prev,
          json: JSON.stringify(updatedJSON.data),
        }));
      }
    }
  };

  // Return user back to the page to select a question type
  const redirectToQuestionTypes = () => {
    const sectionId = selectedQuestion?.question?.sectionId;
    // questionId as query param included to let page know that user is updating an existing question
    router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=1&questionId=${questionId}`)
  }

  // Handler for date range label changes
  const handleRangeLabelChange = (field: 'start' | 'end', value: string) => {
    setDateRangeLabels(prev => ({ ...prev, [field]: value }));

    if (
      typeof questionType === 'string' &&
      ['dateRange', 'numberRange'].includes(questionType) &&
      question?.json
    ) {
      // Handle both string and object cases
      const source = question.json;
      const parsed = typeof source === 'string' ? JSON.parse(source) : source;

      // Deep clone to prevent mutation (keep your original)
      const updated = JSON.parse(JSON.stringify(parsed));

      if (updated?.columns?.[field]?.attributes) {
        updated.columns[field].attributes.label = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(updated),
        }));
      }
    }
  };

  // Handler for typeahead search label changes
  const handleTypeAheadSearchLabelChange = (value: string) => {
    setTypeaheadSearchLabel(value);

    // Update the label in the question JSON and sync to question state
    if (parsedQuestionJSON && (parsedQuestionJSON?.type === "typeaheadSearch")) {
      if (parsedQuestionJSON?.graphQL?.displayFields?.[0]) {
        parsedQuestionJSON.graphQL.displayFields[0].label = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(parsedQuestionJSON),
        }));
      }
    }
  };

  // Handler for typeahead help text changes
  const handleTypeAheadHelpTextChange = (value: string) => {
    setTypeAheadHelpText(value);

    if (parsedQuestionJSON && (parsedQuestionJSON?.type === "typeaheadSearch")) {
      if (parsedQuestionJSON?.graphQL?.variables?.[0]) {
        parsedQuestionJSON.graphQL.variables[0].label = value;
        setQuestion(prev => ({
          ...prev,
          json: JSON.stringify(parsedQuestionJSON),
        }));
      }
    }
  };

  const getFormState = (question: Question) => {
    if (hasOptions) {
      return {
        options: rows.map(row => ({
          label: row.text,
          value: row.text,
          selected: row.isSelected,
        })),
      };
    }
    const formState = getParsedQuestionJSON(question);
    return { ...formState, attributes: { ...formState?.attributes, ...getOverrides(questionType) } };
  };

  const buildUpdatedJSON = (question: Question) => {
    const userInput = getFormState(question);
    return questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](getParsedQuestionJSON(question), userInput);
  };


  // Handle form submission to update the question
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set formSubmitted to true to indicate the form has been submitted
    setFormSubmitted(true);

    if (question) {
      // Pass the merged userInput to questionTypeHandlers to generate json and do type and schema validation
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
              json: JSON.stringify(updatedJSON.data),
              questionText: cleanedQuestionText,
              requirementText: question.requirementText,
              guidanceText: question.guidanceText,
              sampleText: question.sampleText,
              useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
            }
          },
        });

        if (response?.data) {
          // Show success message and redirect to Edit Template page
          toastState.add(QuestionEdit('messages.success.questionUpdated'), { type: 'success' });
          router.push(TEMPLATE_URL);
        }
      } catch (error) {
        if (error instanceof ApolloError) {
          //
        } else {
          // Handle other types of errors
          setErrors(prevErrors => [...prevErrors, QuestionEdit('messages.errors.questionUpdateError')]);
        }
      }
    }
  }

  useEffect(() => {
    // if the question with the given questionType exists, then set the data in state
    if (selectedQuestion) {

      const q = selectedQuestion?.question || null;
      const parsed = getParsedQuestionJSON(q);
      const questionType = parsed.type;
      const questionTypeFriendlyName = Global(`questionTypes.${questionType}`);

      setQuestionType(questionType);
      setQuestionTypeName(questionTypeFriendlyName);
      if (parsed) {
        setParsedQuestionJSON(parsed);
      }
      const isOptionsQuestion = isOptionsType(questionType)

      // Set question and rows in state
      if (q) {
        setQuestion(q);
        setHasOptions(isOptionsQuestion);

      }

      // Set options info
      if (isOptionsQuestion && parsed.options) {
        const optionRows = parsed.options
          .map((option: Option, index: number) => ({
            id: index,
            text: option.attributes.label,
            isSelected: option.attributes.selected || option.attributes.checked || false,
          }));

        setRows(optionRows);
      }
    }
  }, [selectedQuestion])


  // Saves any query errors to errors state
  useEffect(() => {
    const allErrors = [];

    if (selectedQuestionQueryError) {
      allErrors.push(selectedQuestionQueryError.message);
    }

    if (questionTypesError) {
      allErrors.push(questionTypesError.message);
    }

    setErrors(allErrors);
  }, [selectedQuestionQueryError, questionTypesError]);


  useEffect(() => {

    if ((parsedQuestionJSON?.type === 'dateRange' || parsedQuestionJSON?.type === 'numberRange')) {
      try {

        setDateRangeLabels({
          start: parsedQuestionJSON?.columns?.start?.attributes?.label,
          end: parsedQuestionJSON?.columns?.end?.attributes?.label,
        });
      } catch {
        setDateRangeLabels({ start: '', end: '' });
      }
    }
  }, [parsedQuestionJSON])

  useEffect(() => {
    if ((parsedQuestionJSON?.type === 'typeaheadSearch')) {
      setTypeaheadSearchLabel(parsedQuestionJSON?.graphQL?.displayFields[0]?.label);
      setTypeAheadHelpText(parsedQuestionJSON?.graphQL?.variables?.[0]?.label ?? '');
    }
  }, [questionType, question?.json])


  // If a user changes their question type, then we need to fetch the question types to set the new json schema
  useEffect(() => {
    // Only fetch question types if we have a questionType query param present
    if (questionTypeIdQueryParam) {
      getQuestionTypes();
    }
  }, [questionTypeIdQueryParam]);


  function getMatchingQuestionType(qTypes: QuestionTypesInterface[], questionTypeIdQueryParam: string) {
    return qTypes.find((q) => {
      try {
        const parsed = getParsedQuestionJSON(q);
        return parsed.type === questionTypeIdQueryParam;
      } catch {
        return false;
      }
    });
  }
  // If a user passes in a questionType query param we will find the matching questionTypes 
  // json schema and update the question with it
  useEffect(() => {
    if (questionTypesData?.questionTypes && questionTypeIdQueryParam && question) {

      const filteredQuestionTypes = questionTypesData.questionTypes.filter((qt): qt is QuestionTypesInterface => qt !== null);
      // Save the question types to state
      setQuestionTypes(filteredQuestionTypes);
      // Find the matching question type
      const matchedQuestionType = getMatchingQuestionType(filteredQuestionTypes, questionTypeIdQueryParam);

      if (matchedQuestionType?.json) {

        // Update the question object with the new JSON
        setQuestion(prev => ({
          ...prev,
          json: matchedQuestionType.json
        }));

        setQuestionType(questionTypeIdQueryParam)

        // Update the questionTypeName
        const questionTypeFriendlyName = Global(`questionTypes.${questionTypeIdQueryParam}`);
        setQuestionTypeName(questionTypeFriendlyName);

        const isOptionsQuestion = isOptionsType(questionTypeIdQueryParam)
        setHasOptions(isOptionsQuestion);

      }
    }
  }, [questionTypesData, questionTypeIdQueryParam]);


  useEffect(() => {
    if (question) {
      const parsed = getParsedQuestionJSON(question);
      setParsedQuestionJSON(parsed);
    }
  }, [question])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={QuestionEdit('title', { title: selectedQuestion?.question?.questionText ?? '' })}
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
                    className={`${styles.searchLabel} react-aria-Label`}>{QuestionEdit('labels.type')}</Label>
                  <Input
                    value={questionTypeName}
                    className={`${styles.searchInput} react-aria-Input`}
                    disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`}
                    type="button"
                    onPress={redirectToQuestionTypes}>{QuestionEdit('buttons.changeType')}</Button>
                  <Text slot="description"
                    className={`${styles.searchHelpText} help-text`}>
                    {QuestionEdit('helpText.textField')}
                  </Text>
                </TextField>

                <FormInput
                  name="question_text"
                  type="text"
                  isRequired={true}
                  label={QuestionEdit('labels.questionText')}
                  value={question?.questionText ? question.questionText : ''}
                  onChange={(e) => setQuestion({
                    ...question,
                    questionText: e.currentTarget.value
                  })}
                  helpMessage={QuestionEdit('helpText.questionText')}
                  isInvalid={!question?.questionText}
                  errorMessage={QuestionEdit('messages.errors.questionTextRequired')}
                />

                {/**Question type fields here */}
                {hasOptions && (
                  <div className={styles.optionsWrapper}>
                    <p
                      className={styles.optionsDescription}>{QuestionEdit('helpText.questionOptions', { questionType })}</p>
                    <QuestionOptionsComponent
                      rows={rows}
                      setRows={updateRows}
                      questionJSON={question ? getParsedQuestionJSON(question) : {}}
                      formSubmitted={formSubmitted}
                      setFormSubmitted={setFormSubmitted} />
                  </div>
                )}

                {/**Date and Number range question types */}
                {questionType && (questionType === 'dateRange' || questionType === 'numberRange') && (
                  <RangeComponent
                    startLabel={dateRangeLabels.start}
                    endLabel={dateRangeLabels.end}
                    handleRangeLabelChange={handleRangeLabelChange}
                  />
                )}

                {/**Typeahead search question type */}
                {questionType && (questionType === 'typeaheadSearch') && (
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
                  description={QuestionEdit('helpText.requirementText')}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionEdit('labels.requirementText')}
                  value={question?.requirementText ? question.requirementText : ''}
                  onChange={(newValue) => setQuestion(prev => ({
                    ...prev,
                    requirementText: newValue
                  }))}
                />

                <FormTextArea
                  name="question_guidance"
                  isRequired={false}
                  richText={true}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionEdit('labels.guidanceText')}
                  value={question?.guidanceText ? question.guidanceText : ''}
                  onChange={(newValue) => setQuestion(prev => ({
                    ...prev,
                    guidanceText: newValue
                  }))}

                />

                {!hasOptions && (
                  <FormTextArea
                    name="sample_text"
                    isRequired={false}
                    richText={true}
                    description={QuestionEdit('descriptions.sampleText')}
                    textAreaClasses={styles.questionFormField}
                    label={QuestionEdit('labels.sampleText')}
                    value={question?.sampleText ? question?.sampleText : ''}
                    onChange={(newValue) => setQuestion(prev => ({
                      ...prev,
                      sampleText: newValue
                    }))}
                  />
                )}

                {!hasOptions && (
                  <Checkbox
                    onChange={() => setQuestion({
                      ...question,
                      useSampleTextAsDefault: !question?.useSampleTextAsDefault
                    })}
                    isSelected={question?.useSampleTextAsDefault || false}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    {QuestionEdit('descriptions.sampleTextAsDefault')}

                  </Checkbox>
                )}

                <Button type="submit" onPress={() => setFormSubmitted(true)}>{Global('buttons.saveAndUpdate')}</Button>

              </Form>


            </TabPanel>
            <TabPanel id="options">
              <h2>{Global('tabs.options')}</h2>
            </TabPanel>
            <TabPanel id="logic">
              <h2>{Global('tabs.logic')}</h2>
            </TabPanel>
          </Tabs>

        </div>



        <div className="sidebar">
          <h2>{Global('headings.preview')}</h2>
          <p>{QuestionEdit('descriptions.previewText')}</p>
          <QuestionPreview
            buttonLabel={QuestionEdit('buttons.previewQuestion')}
            previewDisabled={question ? false : true}
          >
            <QuestionView
              isPreview={true}
              question={question}
              templateId={Number(templateId)}
            />
          </QuestionPreview>

          <h3>{QuestionEdit('headings.bestPractice')}</h3>
          <p>{QuestionEdit('descriptions.bestPracticePara1')}</p>
          <p>{QuestionEdit('descriptions.bestPracticePara2')}</p>
          <p>{QuestionEdit('descriptions.bestPracticePara3')}</p>
        </div>
      </div>
    </>

  );
}

export default QuestionEdit;
