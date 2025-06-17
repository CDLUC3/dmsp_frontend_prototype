'use client'

import { useEffect, useRef, useState } from 'react';
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
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import FormInput from '@/components/Form/FormInput';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionPreview from '@/components/QuestionPreview';
import QuestionView from '@/components/QuestionView';

//Other
import { useToast } from '@/context/ToastContext';
import { stripHtmlTags } from '@/utils/general';
import { questionTypeHandlers } from '@/utils/questionTypeHandlers';
import { Question, QuestionOptions } from '@/app/types';
import { OPTIONS_QUESTION_TYPES } from '@/lib/constants';
import styles from './questionAdd.module.scss';

const defaultQuestion = {
  guidanceText: '',
  requirementText: '',
  sampleText: '',
  useSampleTextAsDefault: false,
  required: false,
};

// Configure what overrides you want to apply to the question type json objects
const getOverrides = (questionType: string | null | undefined) => {
  switch (questionType) {
    case "text":
      return { maxLength: null };
    case "textArea":
      return { maxLength: null, rows: 20 };
    case "number":
      return { min: 0, max: 10000000, step: 1 };
    case "currency":
      return { min: 0, max: 10000000, step: 0.01 };
    case "url":
      return { maxLength: 2048, minLength: 2, pattern: "https?://.+" };
    default:
      return {};
  }
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
  const { templateId } = params; // From route /template/:templateId

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const step1Url = `/template/${templateId}/q/new?section_id=${sectionId}&step=1`;

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>({
    ...defaultQuestion,
  });
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 0, text: "", isSelected: false }]);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);

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

  const redirectToQuestionTypes = () => {
    router.push(step1Url)
  }

  const getDisplayOrder = () => {
    // Calculate max displayOrder
    let maxQuestionDisplayOrder = null;
    if (questionDisplayOrders?.questions && questionDisplayOrders.questions.length > 0) {
      // Find the maximum displayOrder
      maxQuestionDisplayOrder = questionDisplayOrders.questions.reduce(
        (max, question) => (question?.displayOrder ?? -Infinity) > max ? question?.displayOrder ?? max : max,
        0
      );
    }
    return maxQuestionDisplayOrder ? maxQuestionDisplayOrder + 1 : 1;
  }

  const updateRows = (newRows: QuestionOptions[]) => {
    setRows(newRows);

    // Only update `question.json` if it's an options question
    if (hasOptions && questionType && questionJSON) {
      const parsedQuestionJSON = JSON.parse(questionJSON);
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
  };

  // Handler for date range label changes
  const handleRangeLabelChange = (field: 'start' | 'end', value: string) => {
    setDateRangeLabels(prev => ({ ...prev, [field]: value }));

    // Update the label in the question JSON and sync to question state
    if (
      typeof questionType === 'string' &&
      ['dateRange', 'numberRange'].includes(questionType) &&
      questionJSON
    ) {

      // Deep clone to avoid mutating the original object
      const parsed = JSON.parse(question.json || questionJSON);
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

  const [typeaheadSearchLabel, setTypeaheadSearchLabel] = useState<string>('');
  const handleTypeAheadSearchLabelChange = (value: string) => {
    setTypeaheadSearchLabel(value);

    // Update the label in the question JSON and sync to question state
    if (questionType === 'typeaheadSearch' && questionJSON) {
      try {
        const parsed = JSON.parse(question.json || questionJSON);
        const updated = JSON.parse(JSON.stringify(parsed));
        if (updated?.graphQL?.displayFields?.[0]) {
          updated.graphQL.displayFields[0].label = value;
          setQuestion(prev => ({
            ...prev,
            json: JSON.stringify(updated),
          }));
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }

  const [typeaheadHelpText, setTypeAheadHelpText] = useState<string>('');
  const handleTypeAheadHelpTextChange = (value: string) => {
    setTypeAheadHelpText(value);

    // Update the help text in the question JSON and sync to question state
    if (questionType === 'typeaheadSearch' && questionJSON) {
      try {
        const parsed = JSON.parse(question.json || questionJSON);
        const updated = JSON.parse(JSON.stringify(parsed));
        if (updated?.graphQL?.variables?.[0]) {
          updated.graphQL.variables[0].label = value;
          setQuestion(prev => ({
            ...prev,
            json: JSON.stringify(updated),
          }));
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormSubmitted(true);

    const displayOrder = getDisplayOrder();
    // Use the latest question.json from state, fallback to questionJSON prop
    const currentQuestionJSON = question.json || questionJSON;
    const parsedQuestionJSON = JSON.parse(currentQuestionJSON);

    // Prepare input for the questionTypeHandler. For options questions, we update the 
    // values with rows state. For non-options questions, we use the parsed JSON
    const formState = hasOptions
      ? {
        options: rows.map(row => ({
          label: row.text,
          value: row.text,
          selected: row.isSelected,
        })),
      }
      : parsedQuestionJSON; // Use parsed JSON for non-option types

    // Get any overrides for the question type json objects based on question type
    const overrides = getOverrides(questionType);

    // Merge formState with overrides for non-options questions, and use formState directly for options questions
    const userInput = hasOptions
      ? formState
      : { ...formState, attributes: { ...formState.attributes, ...overrides } };

    // Pass the merged userInput to questionTypeHandlers to generate json and do type and schema validation
    const updatedJSON = questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](
      parsedQuestionJSON,
      userInput
    );

    // Strip all tags from questionText before sending to backend
    const cleanedQuestionText = stripHtmlTags(question?.questionText ?? '');
    const input = {
      templateId: Number(templateId),
      sectionId: Number(sectionId),
      displayOrder,
      isDirty: true,
      questionText: cleanedQuestionText,
      json: JSON.stringify(updatedJSON.data),
      requirementText: question?.requirementText,
      guidanceText: question?.guidanceText,
      sampleText: question?.sampleText,
      useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
      required: false,
    };

    try {
      const response = await addQuestionMutation({ variables: { input } });

      if (response?.data) {
        toastState.add(QuestionAdd('messages.success.questionAdded'), { type: 'success' });
        // Redirect user to the Edit Question view with their new question id after successfully adding the new question
        router.push(`/template/${templateId}`);
      }
    } catch (error) {
      if (!(error instanceof ApolloError)) {
        setErrors(prevErrors => [
          ...prevErrors,
          QuestionAdd('messages.errors.questionAddingError'),
        ]);
      }
    }
  };
  useEffect(() => {
    if (!questionType) {
      // If questionType is missing, return user to the Question Types selection page
      toastState.add(Global('messaging.somethingWentWrong'), { type: 'error' });
      router.push(step1Url);

      // If the sectionId is missing, return user back to the Edit Template page
      router.push(`/template/${templateId}`);
    }
  }, [])

  useEffect(() => {
    // Make sure to add questionJSON and questionType to the question object so it can be used in the QuestionView component
    if (question) {
      setQuestion({
        ...question,
        questionType,
        json: questionJSON
      });
    }
  }, [questionType, questionJSON]);

  useEffect(() => {
    // To determine if the question type selected is one that includes options fields
    const isOptionQuestion = Boolean(questionType && OPTIONS_QUESTION_TYPES.includes(questionType)); // Ensure the result is a boolean

    setHasOptions(isOptionQuestion);
  }, [questionType])


  // Update state when input changes
  const handleInputChange = (field: keyof Question, value: string | boolean | undefined) => {
    setQuestion((prev) => ({
      ...prev,
      [field]: value === undefined ? '' : value, // Default to empty string if value is undefined
    }));
  };

  // Sync dateRangeLabels with question.json when question changes
  useEffect(() => {
    if (questionType === 'dateRange' && questionJSON) {
      try {
        const parsed = JSON.parse(questionJSON);
        setDateRangeLabels({
          start: parsed?.columns?.start?.attributes?.label || '',
          end: parsed?.columns?.end?.attributes?.label || '',
        });
      } catch {
        setDateRangeLabels({ start: '', end: '' });
      }
    }
  }, [questionType, questionJSON]);

  const getInitialDateRangeLabels = () => {
    if (questionType === 'dateRange' && questionJSON) {
      try {
        const parsed = JSON.parse(questionJSON);
        return {
          start: parsed?.columns?.start?.attributes?.label || '',
          end: parsed?.columns?.end?.attributes?.label || '',
        };
      } catch {
        return { start: '', end: '' };
      }
    }
    return { start: '', end: '' };
  };

  const [dateRangeLabels, setDateRangeLabels] = useState<{ start: string; end: string }>(getInitialDateRangeLabels());

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

                {questionType && OPTIONS_QUESTION_TYPES.includes(questionType) && (
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

                {questionType && (questionType === 'dateRange' || questionType === 'numberRange') && (
                  <div className={`${styles.dateRangeLabels} two-item-row`}>
                    <div >
                      <Label htmlFor="rangeStart">Start Label</Label>
                      <Input
                        type="text"
                        id="rangeStart"
                        value={dateRangeLabels.start}
                        onChange={e => handleRangeLabelChange('start', e.currentTarget.value)}
                        className={styles.dateRangeInput}
                        placeholder="From"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rangeEnd">End Label</Label>
                      <Input
                        type="text"
                        id="rangeEnd"
                        value={dateRangeLabels.end}
                        onChange={e => handleRangeLabelChange('end', e.currentTarget.value)}
                        className={styles.dateRangeInput}
                        placeholder="To"
                      />
                    </div>
                  </div>
                )}

                {questionType && (questionType === 'typeaheadSearch') && (
                  <div>
                    <div>
                      <Label htmlFor="searchLabel">Search label</Label>
                      <Input
                        type="text"
                        id="searchLabel"
                        value={typeaheadSearchLabel}
                        onChange={(e) => handleTypeAheadSearchLabelChange(e.currentTarget.value)}
                        placeholder="Enter search label"
                      />
                    </div>
                    <div className={styles.dateRangeInput}>
                      <Label htmlFor="helpText">Help text</Label>
                      <Input
                        type="text"
                        id="helpText"
                        value={typeaheadHelpText}
                        onChange={e => handleTypeAheadHelpTextChange(e.currentTarget.value)}
                        className={styles.dateRangeInput}
                        placeholder="Enter the help text you want to display"
                      />
                    </div>
                  </div>
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

                {!hasOptions && (
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


                {questionType && ["text", "textArea"].includes(questionType) && (
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

                {/**We need to set formSubmitted here, so that it is passed down to the child component QuestionOptionsComponent */}
                <Button type="submit" onPress={() => setFormSubmitted(true)}>{Global('buttons.saveAndAdd')}</Button>
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

