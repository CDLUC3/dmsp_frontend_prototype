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
  useQuestionsDisplayOrderQuery,
  useAddQuestionMutation,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import QuestionOptionsComponent from '@/components/Form/QuestionOptionsComponent';
import FormInput from '@/components/Form/FormInput';

//Other
import { useToast } from '@/context/ToastContext';
import { Question, QuestionOptions } from '@/app/types';
import styles from './questionAdd.module.scss';

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
  const toastState = useToast();
  const { templateId } = params; // From route /template/:templateId

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const step1Url = `/template/${templateId}/q/new?section_id=${sectionId}&step=1`;

  // State for managing form inputs
  const [question, setQuestion] = useState<Question>();
  const [rows, setRows] = useState<QuestionOptions[]>([{ id: 1, orderNumber: 1, text: "", isDefault: false, questionId: 0, }]);
  const [errors, setErrors] = useState<string[]>([]);

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
            questionText: question?.questionText,
            requirementText: question?.requirementText,
            guidanceText: question?.guidanceText,
            sampleText: question?.sampleText,
            required: false,
            questionOptions: transformedQuestionOptions
          }
        },
      });

      if (response?.data) {
        toastState.add(QuestionAdd('messages.success.questionAdded'), { type: 'success' });
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        //
      } else {
        // Handle other types of errors
        setErrors(prevErrors => [...prevErrors, QuestionAdd('messages.errors.questionAddingError')]);
      }
    }

  }

  useEffect(() => {
    if (!questionTypeId) {
      // If questionTypeId is missing, return user to the Question Types selection page
      toastState.add(Global('messaging.somethingWentWrong'), { type: 'error' });
      router.push(step1Url);

      // If the sectionId is missing, return user back to the Edit Template page
      router.push(`/template/${templateId}`);
    }
  }, [])


  return (
    <>
      <PageHeader
        title={QuestionAdd('title')}
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
              <Form onSubmit={handleAdd}>
                <TextField
                  name="type"
                  type="text"
                  className={`${styles.searchField} react-aria-TextField`}
                  isRequired
                  value={questionTypeName ? questionTypeName : ''}
                >
                  <Label className={`${styles.searchLabel} react-aria-Label`}>{QuestionAdd('labels.type')}</Label>
                  <Input className={`${styles.searchInput} react-aria-Input`} disabled />
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>Change type</Button>
                  <Text slot="description" className={`${styles.searchHelpText} help-text`}>
                    {QuestionAdd('helpText.textField')}
                  </Text>
                </TextField>

                {/**Question type fields here */}
                <p className={styles.optionsDescription}>{QuestionAdd('helpText.questionOptions', { questionTypeName })}</p>

                {questionTypeId && [3, 4, 5].includes(questionTypeId) && (
                  <div className={styles.optionsWrapper}>
                    <QuestionOptionsComponent rows={rows} setRows={setRows} />
                  </div>
                )}

                <FormInput
                  name="question_text"
                  type="text"
                  isRequired={true}
                  label={QuestionAdd('labels.questionText')}
                  value={question?.questionText ? question.questionText : ''}
                  onChange={(e) => setQuestion({
                    ...question,
                    questionText: e.currentTarget.value
                  })}
                  helpMessage={QuestionAdd('helpText.questionText')}
                  isInvalid={!question?.questionText}
                  errorMessage={QuestionAdd('messages.errors.questionTextRequired')}
                />

                <TextField
                  name="question_requirements"
                >
                  <Label>{QuestionAdd('labels.requirementText')}</Label>
                  <Text slot="description" className="help-text">
                    {QuestionAdd('helpText.requirementText')}
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
                  name="question_guidance"
                >
                  <Label>{QuestionAdd('labels.guidanceText')}</Label>
                  <TextArea
                    value={question?.guidanceText ? question?.guidanceText : ''}
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
                  <Label>{QuestionAdd('labels.sampleText')}</Label>
                  <Text slot="description" className="help-text">
                    {QuestionAdd('descriptions.sampleText')}
                  </Text>
                  <TextArea
                    value={question?.sampleText ? question.sampleText : ''}
                    onChange={(e) => setQuestion({
                      ...question,
                      sampleText: e.currentTarget.value
                    })}
                    style={{ height: '80px' }}
                  />
                  <FieldError />
                  <Text slot="description" className="help-text">
                    {QuestionAdd('helpText.sampleText')}
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
          <h2>{Global('headings.preview')}</h2>
          <p>{QuestionAdd('descriptions.previewText')}</p>
          <Button>{QuestionAdd('buttons.previewQuestion')}</Button>

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
