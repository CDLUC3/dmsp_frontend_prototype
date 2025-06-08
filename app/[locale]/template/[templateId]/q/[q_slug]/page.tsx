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
  useUpdateQuestionMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import QuestionPreview from '@/components/QuestionPreview';
import FormInput from '@/components/Form/FormInput';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';
import QuestionView from '@/components/QuestionView';

//Other
import { useToast } from '@/context/ToastContext';

import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import { questionTypeHandlers } from '@/utils/questionTypeHandlers';
import { Question, QuestionOptions } from '@/app/types';
import styles from './questionEdit.module.scss';

// Configure what overrides you want to apply to the question type json objects
const getOverrides = (questionType: string | null | undefined) => {
  switch (questionType) {
    case "text":
      return { maxLength: 500 };
    case "textArea":
      return { maxLength: 1000, rows: 5 };
    case "number":
      return { min: 0, max: 1000, step: 5 };
    case "currency":
      return { min: 0, max: 100000, step: 0.01 };
    case "url":
      return { maxLength: 2048, minLength: 2, pattern: "https?://.+" };
    default:
      return {};
  }
};

// Define the type for the options in json.options
interface Option {
  type: string;
  attributes: {
    label: string;
    value: string;
    selected?: boolean;
  };
}

const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastState = useToast(); // Access the toast state from context
  const templateId = Array.isArray(params.templateId) ? params.templateId[0] : params.templateId;
  const questionId = params.q_slug; //question id
  const questionTypeIdQueryParam = searchParams.get('questionType') || null;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([]);
  const [questionType, setQuestionType] = useState<string>('');
  const [questionTypeName, setQuestionTypeName] = useState<string>(''); // Added to store friendly question name
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);
  const [errors, setErrors] = useState<string[]>([]);

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

  const getParsedQuestionJSON = (question: Question | null) => {
    if (question) {
      const parsedJSON = question?.json ? JSON.parse(question.json) : null;
      return parsedJSON;
    }
    return null;
  }

  // Return user back to the page to select a question type
  const redirectToQuestionTypes = () => {
    const sectionId = selectedQuestion?.question?.sectionId;
    // questionId as query param included to let page know that user is updating an existing question
    router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=1&questionId=${questionId}`)
  }

  // Handle form submission to update the question
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (question) {
      const formState = hasOptions
        ? {
          options: rows.map(row => ({
            label: row.text,
            value: row.text, // Use the text directly as the value
            selected: row.isDefault,
          })),
        }
        : getParsedQuestionJSON(question); // Use parsed JSON for non-option types

      // Get any overrides for the question type json objects based on question type
      const overrides = getOverrides(questionType);

      // Merge formState with overrides for non-options questions
      const userInput = hasOptions
        ? formState
        : { ...formState, attributes: { ...formState.attributes, ...overrides } };

      // Pass the merged userInput to questionTypeHandlers for type and schema checks
      const result = questionTypeHandlers[questionType as keyof typeof questionTypeHandlers](
        getParsedQuestionJSON(question),
        userInput
      );

      // Set formSubmitted to true to indicate the form has been submitted
      setFormSubmitted(true);

      // Strip all tags from questionText before sending to backend
      const cleanedQuestionText = stripHtmlTags(question.questionText ?? '');
      try {
        // Add mutation for question
        const response = await updateQuestionMutation({
          variables: {
            input: {
              questionId: Number(questionId),
              displayOrder: question.displayOrder,
              json: JSON.stringify(result.data), // Updated json for question type
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
      const json = getParsedQuestionJSON(q);
      const questionType = json.type ?? questionTypeIdQueryParam;
      const questionTypeFriendlyName = Global(`questionTypes.${questionType}`) || '';

      setQuestionType(questionType);
      setQuestionTypeName(questionTypeFriendlyName);
      const isOptionQuestion = Boolean(questionType && ["radioButtons", "checkBoxes", "selectBox"].includes(questionType)); // Ensure the result is a boolean

      // Set question and rows in state
      if (q) {
        const sanitizedQuestion = {
          ...q,
          questionText: stripHtmlTags(q.questionText ?? ''), // Sanitize questionText
        };

        setQuestion(sanitizedQuestion);
        setHasOptions(isOptionQuestion);

      }

      // Set options info
      if (isOptionQuestion) {
        const optionRows = json.options
          .map((option: Option, index: number) => ({
            id: index,
            text: option.attributes.label,
            isDefault: option.attributes.selected || false,
          }));

        setRows(optionRows);
      }
    }
  }, [selectedQuestion])


  useEffect(() => {
    if (selectedQuestionQueryError) {
      setErrors(prev => [...prev, selectedQuestionQueryError.message])
    }
  }, [selectedQuestionQueryError])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={QuestionEdit('title', { title: selectedQuestion?.question?.questionText })}
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
          {errors && errors.length > 0 &&
            <div className="messages error" role="alert" aria-live="assertive"
              ref={errorRef}>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          }
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
                    <QuestionOptionsComponent rows={rows} setRows={setRows}
                      questionId={Number(questionId)}
                      formSubmitted={formSubmitted}
                      setFormSubmitted={setFormSubmitted} />
                  </div>
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
