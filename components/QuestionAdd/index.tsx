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
  useQuestionsDisplayOrderQuery,
  useQuestionQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent from '@/components/Form/QuestionOptionsComponent';

//Other
import { useToast } from '@/context/ToastContext';
import styles from './questionAdd.module.scss';


interface QuestionOptions {
  id?: number | null;
  text: string;
  orderNumber: number;
  isDefault?: boolean | null;
  questionId: number;
}

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

const QuestionAdd = ({
  questionTypeId,
  questionTypeName,
  sectionId }:
  {
    questionTypeId?: number | null,
    questionTypeName?: string | null,
    sectionId?: string
  }) => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast(); // Access the toast state from context
  const { templateId } = params; // From route /template/:templateId
  const { q_slug } = params; //question id

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const step1Url = `/template/${templateId}/q/new?section_id=${sectionId}&step=1`;

  // State for managing form inputs
  const [question, setQuestion] = useState(sampleQuestion);
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 1, orderNumber: 1, text: "", isDefault: false, questionId: 0, }]);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize add and update question mutations
  const [addQuestionMutation] = useAddQuestionMutation();
  const [updateQuestionMutation] = useUpdateQuestionMutation();

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

  const handleGuidanceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion({ ...question, guidance: e.currentTarget.value });
  };

  const transformOptions = () => {
    // If duplicate order numbers or text, do we want to give the user an error message?
    const transformedRows = rows.map(option => {
      return { text: option.text, orderNumber: option.orderNumber, isDefault: option.isDefault }
    })

    return transformedRows;
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const transformedQuestionOptions = transformOptions();
    try {
      const displayOrder = getDisplayOrder();
      // Add mutation for question
      const response = await addQuestionMutation({
        variables: {
          input: {
            templateId: Number(templateId),
            sectionId: Number(sectionId),
            displayOrder: displayOrder,
            isDirty: true,
            questionTypeId: questionTypeId,
            questionText: question.text,
            requirementText: question.requirements,
            guidanceText: question.guidance,
            sampleText: question.sampleText,
            required: false,
            questionOptions: transformedQuestionOptions
          }
        },
      });

      if (response?.data) {
        toastState.add('Question was successfully added', { type: 'success' });
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

  // useEffect(() => {
  //   if (!questionTypeId) {
  //     // If questionTypeId is missing, return user to the Question Types selection page
  //     toastState.add('Something went wrong. Please try again.', { type: 'error' });
  //     router.push(step1Url);

  //     // If the sectionId is missing, return user back to the Edit Template page
  //     router.push(`/template/${templateId}`);
  //   }
  // }, [])

  return (
    <>
      <PageHeader
        title={`Edit: ${question.text}`}
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
              <Form onSubmit={handleAdd}>
                <TextField
                  name="type"
                  type="text"
                  className={`${styles.searchField} react-aria-TextField`}
                  isRequired
                  value={questionTypeName ? questionTypeName : ''}
                >
                  <Label className={`${styles.searchLabel} react-aria-Label`}>Type (required)</Label>
                  <Input className={`${styles.searchInput} react-aria-Input`} disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>Change type</Button>
                  <Text slot="description" className={`${styles.searchHelpText} help-text`}>
                    Changing the question type, for example from Short question to Radio button, may result in some data being lost.
                  </Text>
                </TextField>

                {/**Question type fields here */}
                {questionTypeId && [3, 4, 5].includes(questionTypeId) && (
                  <div className={styles.optionsWrapper}>
                    <p className={styles.optionsDescription}>Please enter answer choices for the {questionTypeName}</p>
                    <QuestionOptionsComponent rows={rows} setRows={setRows} />
                  </div>
                )}

                <TextField
                  name="question_text"
                  type="text"
                  isRequired
                  value={question.text}
                >
                  <Label>Question text (required)</Label>
                  <Input
                    value={question.text}
                    onChange={(e) => setQuestion({
                      ...question,
                      text: e.currentTarget.value
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
                  value={question.requirements}
                >
                  <Label>Requirements plan writer must meet (optional but recommended)</Label>
                  <Text slot="description" className="help-text">
                    Try to be precise and concise, so the plan writers won't miss any requirements. Question guidance is better for more general advice.
                  </Text>
                  <TextArea
                    value={question.requirements}
                    onChange={(e) => setQuestion({
                      ...question,
                      requirements: e.currentTarget.value
                    })}
                    style={{ height: '100px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="question_guidance"
                  value={question.guidance}
                >
                  <Label>Question guidance (optional but recommended)</Label>
                  <TextArea
                    value={question.guidance}
                    onChange={handleGuidanceChange}
                    style={{ height: '150px' }}
                  />
                  <FieldError />
                </TextField>

                <TextField
                  name="sample_text"
                  value={question.sampleText}
                >
                  <Label>Sample text</Label>
                  <Text slot="description" className="help-text">
                    Provide an example or template of expected answer (optional
                    but
                    recommended)
                  </Text>
                  <TextArea
                    value={question.sampleText}
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

export default QuestionAdd;
