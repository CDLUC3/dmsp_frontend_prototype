'use client'

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextArea,
  TextField
} from "react-aria-components";

// GraphQL queries and mutations
import {
  useQuestionQuery,
  useUpdateQuestionMutation,
  useQuestionTypesQuery
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent from '@/components/Form/QuestionOptionsComponent';

//Other
import { useToast } from '@/context/ToastContext';
import { Question, QuestionOptions } from '@/app/types';
import styles from './questionEdit.module.scss';


const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast(); // Access the toast state from context
  const { templateId } = params; // From route /template/:templateId
  const questionId = params.q_slug; //question id

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([]);//Question options, initially set as an empty array
  const [questionType, setQuestionType] = useState<string>('');
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
    router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=1`)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question) {
      try {
        // Add mutation for question
        const response = await updateQuestionMutation({
          variables: {
            input: {
              questionId: Number(questionId),
              displayOrder: question.displayOrder,
              questionText: question.questionText,
              requirementText: question.requirementText,
              guidanceText: question.guidanceText,
              sampleText: question.sampleText,
              questionOptions: rows || selectedQuestion?.question?.questionOptions
            }
          },
        });

        if (response?.data) {
          toastState.add('Question was successfully updated', { type: 'success' });
        }
      } catch (error) {
        if (error instanceof ApolloError) {
          //
        } else {
          // Handle other types of errors
          setErrors(prevErrors => [...prevErrors, 'Error when updating profile']);
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
        const qt = getQuestionTypeName(Number(selectedQuestion?.question?.questionTypeId))
        if (qt) {
          setQuestionType(qt);
        }

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
        title={`Edit: ${selectedQuestion?.question?.questionText}`}
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

      {errors && errors.length > 0 &&
        <div className="error">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      }

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
                {selectedQuestion?.question?.questionTypeId && [3, 4, 5].includes(selectedQuestion?.question?.questionTypeId) && (
                  <div className={styles.optionsWrapper}>
                    <p className={styles.optionsDescription}>{QuestionEdit('Please enter answer choices for the', { questionType })}</p>
                    <QuestionOptionsComponent rows={rows} setRows={setRows} questionId={Number(questionId)} />
                  </div>
                )}

                <TextField
                  name="question_text"
                  type="text"
                  isRequired
                >
                  <Label>{QuestionEdit('labels.questionText')}</Label>
                  <Input
                    value={question?.questionText ? question.questionText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      questionText: e.currentTarget.value
                    })}
                  />
                  <Text slot="description" className="help-text">
                    {QuestionEdit('helpText.questionText')}
                  </Text>
                  <FieldError />
                </TextField>

                <TextField
                  name="question_requirements"
                  isRequired
                >
                  <Label>{QuestionEdit('labels.requirementText')}</Label>
                  <Text slot="description" className="help-text">
                    {QuestionEdit('helpText.requirementText')}
                  </Text>
                  <TextArea
                    value={question?.requirementText ? question.requirementText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      requirementText: e.currentTarget.value
                    })}
                    style={{ height: '100px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="question_guidance">
                  <Label>{QuestionEdit('labels.guidanceText')}</Label>
                  <TextArea
                    value={question?.guidanceText ? question.guidanceText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      guidanceText: e.currentTarget.value
                    })}
                    style={{ height: '150px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="sample_text"
                >
                  <Label>{QuestionEdit('labels.sampleText')}</Label>
                  <Text slot="description" className="help-text">
                    {QuestionEdit('descriptions.sampleText')}
                  </Text>
                  <TextArea
                    value={question?.sampleText ? question?.sampleText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      sampleText: e.currentTarget.value
                    })}
                    style={{ height: '80px' }}
                  />
                  <FieldError />
                  <Text slot="description" className="help-text">
                    {QuestionEdit('helpText.sampleText')}
                  </Text>
                </TextField>

                <Button type="submit">{Global('buttons.save')}</Button>

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
          <h2>Preview</h2>
          <p>See how this question will look to users.</p>
          <Button>Preview question</Button>

          <h3>Best practice by DMP Tool</h3>
          <p>Keep the question concise and clear. Use the requirements or
            guidance
            to provide additional explanation.</p>
          <p>Outline the requirements that a user must consider for this
            question.</p>
          <p>Researchers will be able to copy the sample text into the field as
            a
            starting point, as a way to speed up content entry.</p>
        </div>
      </div >
    </>

  );
}

export default QuestionEdit;
