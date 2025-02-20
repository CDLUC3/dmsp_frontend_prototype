'use client'

import {useEffect, useRef, useState} from 'react';
import {ApolloError} from '@apollo/client';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
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
  useQuestionTypesQuery,
  useUpdateQuestionMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';
import FormInput from '@/components/Form/FormInput';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';

//Other
import {useToast} from '@/context/ToastContext';
import {Question, QuestionOptions} from '@/app/types';
import styles from './questionEdit.module.scss';


const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastState = useToast(); // Access the toast state from context
  const { templateId } = params; // From route /template/:templateId
  const questionId = params.q_slug; //question id
  const questionTypeIdQueryParam = searchParams.get('questionTypeId') || null;

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([]);//Question options, initially set as an empty array
  const [questionType, setQuestionType] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [hasOptions, setHasOptions] = useState<boolean | null>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize update question mutation
  const [updateQuestionMutation] = useUpdateQuestionMutation();

  // localization keys
  const Global = useTranslations('Global');
  const QuestionEdit = useTranslations('QuestionEdit');

  // Run selected question query
  const { data: selectedQuestion, loading, error: selectedQuestionQueryError } = useQuestionQuery(
    {
      variables: {
        questionId: Number(questionId)
      }
    },
  );

  // Query for getting all question types
  const { data: questionTypes } = useQuestionTypesQuery({
    skip: !questionId
  });

  const getQuestionTypeName = (id: number) => {
    if (questionTypes && questionTypes?.questionTypes) {
      const questionType = questionTypes?.questionTypes?.find(qt => qt && qt.id === id);
      return questionType ? questionType.name : null; // Return question type name if found, else null
    }
    return '';
  };

  // Return user back to the page to select a question type
  const redirectToQuestionTypes = () => {
    const sectionId = selectedQuestion?.question?.sectionId;
    // questionId as query param included to let page know that user is updating an existing question
    router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=1&questionId=${questionId}`)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question) {
      setFormSubmitted(true);

      try {
        // Add mutation for question. If user has questionTypeId in query param because they just selected
        // a new question type, then use that as the questionTypeId rather than what is currently in the db
        const response = await updateQuestionMutation({
          variables: {
            input: {
              questionId: Number(questionId),
              questionTypeId: Number(questionTypeIdQueryParam) ?? selectedQuestion?.question?.questionTypeId,
              displayOrder: question.displayOrder,
              questionText: question.questionText,
              requirementText: question.requirementText,
              guidanceText: question.guidanceText,
              sampleText: question.sampleText,
              useSampleTextAsDefault: question?.useSampleTextAsDefault || false,
              questionOptions: rows || selectedQuestion?.question?.questionOptions
            }
          },
        });

        if (response?.data) {
          toastState.add(QuestionEdit('messages.success.questionUpdated'), { type: 'success' });
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
    // if the question with the given questionId exists, then set the data in state
    if (selectedQuestion) {

      const q = selectedQuestion?.question || null;

      // Set question and rows in state
      if (q && q.questionOptions) {
        setQuestion(q);
        const optionRows = q.questionOptions
          .map(({ id, orderNumber, text, isDefault, questionId }) => ({
            id: id ?? 0, // Ensure id is always a number
            orderNumber,
            text,
            isDefault: isDefault || false,
            questionId
          }))
          .sort((a, b) => a.orderNumber - b.orderNumber); // Sort in ascending order

        setRows(optionRows);
        // If user has the questionTypeId in the query param because they just selected a new question type
        // then use that over the one in the data
        const qt = getQuestionTypeName(Number(questionTypeIdQueryParam ?? selectedQuestion?.question?.questionTypeId))
        if (qt) {
          setQuestionType(qt);
        }

      }
    }

    if (questionTypeIdQueryParam && rows.length === 0) {
      // If there is a questionTypeId query param, then that means that user switched to a new question type
      // so we want to reset the rows to a fresh, empty row
      if ([3, 4, 5].includes(Number(questionTypeIdQueryParam))) {
        setRows([{ id: 1, orderNumber: 1, text: "", isDefault: false, questionId: Number(questionId) }]);
      }
    }
  }, [selectedQuestion])


  useEffect(() => {
    if (selectedQuestionQueryError) {
      setErrors(prev => [...prev, selectedQuestionQueryError.message])
    }
  }, [selectedQuestionQueryError])

  useEffect(() => {
    // To determine if the question type selected is one that includes options fields
    const questionTypeOptions = !!(
      (questionTypeIdQueryParam && [3, 4, 5].includes(Number(questionTypeIdQueryParam))) ??
      (selectedQuestion?.question?.questionTypeId && [3, 4, 5].includes(selectedQuestion?.question?.questionTypeId))
    );
    setHasOptions(questionTypeOptions);
  }, [questionTypeIdQueryParam, selectedQuestion])

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <>
      <PageHeader
        title={QuestionEdit('title', { title: selectedQuestion?.question?.questionText })}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
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
            <div className="messages error" role="alert" aria-live="assertive" ref={errorRef}>
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
                  <Label className={`${styles.searchLabel} react-aria-Label`}>{QuestionEdit('labels.type')}</Label>
                  <Input
                    value={questionType}
                    className={`${styles.searchInput} react-aria-Input`}
                    disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>{QuestionEdit('buttons.changeType')}</Button>
                  <Text slot="description" className={`${styles.searchHelpText} help-text`}>
                    {QuestionEdit('helpText.textField')}
                  </Text>
                </TextField>

                {/**Question type fields here */}
                {hasOptions && (
                  <div className={styles.optionsWrapper}>
                    <p className={styles.optionsDescription}>{QuestionEdit('helpText.questionOptions', { questionType })}</p>
                    <QuestionOptionsComponent rows={rows} setRows={setRows} questionId={Number(questionId)} formSubmitted={formSubmitted} setFormSubmitted={setFormSubmitted} />
                  </div>
                )}

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

                <FormTextArea
                  name="question_requirements"
                  isRequired={false}
                  description={QuestionEdit('helpText.requirementText')}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionEdit('labels.requirementText')}
                  value={question?.requirementText ? question.requirementText : ''}
                  onChange={(e) => setQuestion({
                    ...question,
                    requirementText: e.currentTarget.value
                  })}
                  helpMessage={QuestionEdit('helpText.requirementText')}
                />

                <FormTextArea
                  name="question_guidance"
                  isRequired={false}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionEdit('labels.guidanceText')}
                  value={question?.guidanceText ? question.guidanceText : ''}
                  onChange={(e) => setQuestion({
                    ...question,
                    guidanceText: e.currentTarget.value
                  })}
                />

                <FormTextArea
                  name="sample_text"
                  isRequired={false}
                  description={QuestionEdit('descriptions.sampleText')}
                  textAreaClasses={styles.questionFormField}
                  label={QuestionEdit('labels.sampleText')}
                  value={question?.sampleText ? question?.sampleText : ''}
                  onChange={(e) => setQuestion({
                    ...question,
                    sampleText: e.currentTarget.value
                  })}
                />

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

                <Button type="submit" onPress={() => setFormSubmitted(true)}>{Global('buttons.save')}</Button>

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
          <p>{QuestionEdit('descriptions.previewText')}</p>
          <Button>{QuestionEdit('buttons.previewQuestion')}</Button>

          <h3>{QuestionEdit('headings.bestPractice')}</h3>
          <p>{QuestionEdit('descriptions.bestPracticePara1')}</p>
          <p>{QuestionEdit('descriptions.bestPracticePara2')}</p>
          <p>{QuestionEdit('descriptions.bestPracticePara3')}</p>
        </div>
      </div >
    </>

  );
}

export default QuestionEdit;
