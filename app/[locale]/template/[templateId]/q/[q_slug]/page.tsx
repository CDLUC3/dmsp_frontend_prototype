'use client'

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
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
import styles from './questionEdit.module.scss';



// Sample data stub representing data fetched from a GraphQL server
const sampleQuestion = {
  id: 'q_mnopqr',
  templateId: 't_abcdef', // Added template ID
  type: 'Rich Text',
  text: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
  requirements: 'Keep the question concise and clear. Use the requirements or guidance to provide additional explanation.',
  guidance: 'Be concise\nExplain the data file format\nExplain the expected size\nExplain the blah blah blah blah blah blah blah',
  sampleText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};

interface QuestionOptions {
  id?: number | null;
  text: string;
  orderNumber: number;
  isDefault?: boolean | null;
  questionId: number;
}
interface Question {
  id?: number | null | undefined;
  displayOrder?: number | null;
  questionText?: string | null;
  requirementText?: string | null;
  guidanceText?: string | null;
  sampleText?: string | null;
  required?: boolean;
  questionOptions?: QuestionOptions[] | null;
}

const QuestionEdit = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast(); // Access the toast state from context
  const { templateId } = params; // From route /template/:templateId
  const { q_slug } = params; //question id

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([]);
  const [questionType, setQuestionType] = useState<string>('');

  const [errors, setErrors] = useState<string[]>([]);

  // Initialize add and update question mutations
  const [updateQuestionMutation] = useUpdateQuestionMutation();

  // Run selected question query
  const { data: selectedQuestion, loading, error: selectedQuestionQueryError } = useQuestionQuery(
    {
      variables: {
        questionId: Number(q_slug)
      }
    },
  );

  // Query for question types
  const { data: questionTypes } = useQuestionTypesQuery({
    skip: !q_slug
  });

  const getQuestionTypeName = (id: number) => {
    if (questionTypes && questionTypes?.questionTypes) {
      const questionType = questionTypes?.questionTypes?.find(qt => qt && qt.id === id);
      return questionType ? questionType.name : null; // Return question type name if found, else null
    }
    return '';
  };

  const handleGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, guidanceText: e.currentTarget.value });
  };

  const redirectToQuestionTypes = () => {
    const sectionId = selectedQuestion?.question?.sectionId;
    router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=1`)
  }

  const transformOptions = () => {
    let transformedRows: QuestionOptions[] = [];

    if (rows && rows.length > 0) {
      // If duplicate order numbers or text, do we want to give the user an error message?
      transformedRows = rows.map(option => {
        return { id: option.id, text: option.text, orderNumber: option.orderNumber, isDefault: option.isDefault, questionId: Number(q_slug) }
      })
    }

    return transformedRows;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const transformedQuestionOptions = transformOptions();
    if (question) {
      try {
        // Add mutation for question
        const response = await updateQuestionMutation({
          variables: {
            input: {
              questionId: Number(q_slug),
              displayOrder: question.displayOrder,
              questionText: question.questionText,
              requirementText: question.requirementText,
              guidanceText: question.guidanceText,
              sampleText: question.sampleText,
              questionOptions: transformedQuestionOptions || selectedQuestion?.question?.questionOptions
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


  return (
    <>
      <PageHeader
        title={`Edit: ${selectedQuestion?.question?.questionText}`}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>Edit Template</Link></Breadcrumb>
            <Breadcrumb>Question</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

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
              <Tab id="edit">Edit Question</Tab>
              <Tab id="options">Options</Tab>
              <Tab id="logic">Logic</Tab>
            </TabList>

            <TabPanel id="edit">
              <Form onSubmit={handleUpdate}>
                <TextField
                  name="type"
                  type="text"
                  className={`${styles.searchField} react-aria-TextField`}
                  isRequired
                >
                  <Label className={`${styles.searchLabel} react-aria-Label`}>Type (required)</Label>
                  <Input
                    value={questionType}
                    className={`${styles.searchInput} react-aria-Input`}
                    disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>Change type</Button>
                  <Text slot="description" className={`${styles.searchHelpText} help-text`}>
                    Changing the question type, for example from Short question to Radio button, may result in some data being lost.
                  </Text>
                </TextField>

                {/**Question type fields here */}
                {selectedQuestion?.question?.questionTypeId && [3, 4, 5].includes(selectedQuestion?.question?.questionTypeId) && (
                  <div className={styles.optionsWrapper}>
                    <p className={styles.optionsDescription}>Please enter answer choices for the {questionType}</p>
                    <QuestionOptionsComponent rows={rows} setRows={setRows} />
                  </div>
                )}

                <TextField
                  name="question_text"
                  type="text"
                  isRequired
                >
                  <Label>Question text (required)</Label>
                  <Input
                    value={question?.questionText ? question.questionText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      questionText: e.currentTarget.value
                    })}
                  />
                  <Text slot="description" className="help-text">
                    Keep the question text concise and clear. Use the requirements or guidance to provide additional explanation.
                  </Text>
                  <FieldError />
                </TextField>

                <TextField
                  name="question_requirements"
                  isRequired
                >
                  <Label>Requirements plan writer must meet (optional but recommended)</Label>
                  <Text slot="description" className="help-text">
                    Try to be precise and concise, so the plan writers won't miss any requirements. Question guidance is better for more general advice.
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
                  name="question_guidance"                >
                  <Label>Question guidance (optional but recommended)</Label>
                  <TextArea
                    value={question?.guidanceText ? question.guidanceText : ''}
                    onChange={handleGuidanceChange}
                    style={{ height: '150px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="sample_text"
                >
                  <Label>Sample text</Label>
                  <Text slot="description" className="help-text">
                    Provide an example or template of expected answer (optional
                    but
                    recommended)
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
                    Plan creators will be able to copy the sample text into the field as a starting point, to speed up content entry.
                  </Text>
                </TextField>

                <Button type="submit">Save</Button>

              </Form>


            </TabPanel>
            <TabPanel id="options">
              <h2>Options</h2>
            </TabPanel>
            <TabPanel id="logic">
              <h2>logic</h2>
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
