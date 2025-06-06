'use client'

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from "zod";

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

import { QuestionTypesEnum } from "@dmptool/types";

//Other
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';
import { stripHtmlTags } from '@/utils/general';
import { questionTypeHandlers } from '@/utils/questionTypeHandlers';
import { routePath } from '@/utils/routes';
import { Question, QuestionOptions } from '@/app/types';
import styles from './questionAdd.module.scss';

const defaultQuestion = {
  guidanceText: '',
  requirementText: '',
  sampleText: '',
  useSampleTextAsDefault: false,
  required: false,
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
  }); const [rows, setRows] = useState<QuestionOptions[]>([{ id: 0, text: "", isDefault: false }]);
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

  const validateOptions = () => {
    const newErrors: { [key: number]: string } = {};
    rows.forEach((row) => {
      if (!row.text.trim()) {
        newErrors[row.id || 0] = "This field is required";
      }
    });

    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const redirectToQuestionTypes = () => {
    router.push(step1Url)
  }

  const transformOptions = () => {
    // If duplicate order numbers or text, do we want to give the user an error message?
    const transformedRows = rows.map(option => {
      return { text: option.text, isDefault: option.isDefault }
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

    setFormSubmitted(true);

    const displayOrder = getDisplayOrder();

    const parsedQuestionJSON = JSON.parse(questionJSON);

    const typeResult = QuestionTypesEnum.safeParse(parsedQuestionJSON.type); // using Zod's safeParse to validate that parsedQuestionJSON.type is a valid value according to QuestionTypesEnum

    if (!typeResult.success) {
      const errorMsg = `Invalid question type: ${parsedQuestionJSON.type}`;
      setErrors(prevErrors => [...prevErrors, errorMsg]);
      logECS('error', 'adding question', {
        error: errorMsg,
        url: { path: routePath('template.q.new') }
      });
      return;
    }

    const type = typeResult.data;

    const getHandlerInput = (type: string) => {
      switch (type) {
        case 'radioButtons':
        case 'checkBoxes':
        case 'selectBox': {
          const options = rows.map((row) => ({
            label: row.text,
            value: row.text.toLowerCase().replace(/\s+/g, '_'), // e.g., "Yes" → "yes"
            selected: row.isDefault ?? false
          }));
          return { options };
        }
        case 'url':
          return { pattern: "https?://.+" };
        case 'textArea':
        case 'text':
          return {
            maxLength: 1000,
            rows: 2,
            cols: 20
          };
        case 'boolean':
          return { checked: false }; // or get from form state
        default:
          return {}; // fallback safe default
      }
    };

    const handlerInput = getHandlerInput(type);
    const handlerFn = questionTypeHandlers[type as keyof typeof questionTypeHandlers];

    if (!handlerFn) {
      const msg = `No handler found for question type: ${type}`;
      setErrors(prev => [...prev, msg]);
      logECS('error', 'Missing question type handler', {
        type,
        url: { path: routePath('template.q.new') }
      });
      return;

    }

    // Call the handler and check validation result
    const handlerResult = handlerFn(parsedQuestionJSON, handlerInput);

    if (!handlerResult.success) {
      const errorMsg = handlerResult.error || 'Question validation failed';
      setErrors(prev => [...prev, errorMsg]);
      logECS('error', 'Question validation failed', {
        type,
        error: errorMsg,
        url: { path: routePath('template.q.new') }
      });
      return;
    }

    const updatedQuestionJSON = handlerResult.data;

    // string all tags from questionText before sending to backend
    const cleanedQuestionText = stripHtmlTags(question?.questionText ?? '');
    const input = {
      templateId: Number(templateId),
      sectionId: Number(sectionId),
      displayOrder,
      isDirty: true,
      questionText: cleanedQuestionText,
      json: JSON.stringify(updatedQuestionJSON),
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
        //redirect user to the Edit Question view with their new question id after successfully adding the new question
        router.push(`/template/${templateId}`)
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
      // If questionId is missing, return user to the Question Types selection page
      toastState.add(Global('messaging.somethingWentWrong'), { type: 'error' });
      router.push(step1Url);

      // If the sectionId is missing, return user back to the Edit Template page
      router.push(`/template/${templateId}`);
    }
  }, [])

  useEffect(() => {
    // Make sure to add the questionType to the question object so it can be used in the QuestionView component
    if (question) {
      setQuestion({
        ...question,
        questionType
      });
      console.log("***QUESTION***", question);
    } else {
      setQuestion({ questionType });
    }
  }, [questionType]);

  useEffect(() => {
    // To determine if the question type selected is one that includes options fields
    const isOptionQuestion = Boolean(questionType && ["radioButtons", "checkBoxes", "selectBox"].includes(questionType)); // Ensure the result is a boolean

    setHasOptions(isOptionQuestion);
  }, [questionType])

  useEffect(() => {
    console.log("***ROWS***", rows);
  }, [rows])

  // Update state when input changes
  const handleInputChange = (field: keyof Question, value: string | boolean | undefined) => {
    setQuestion((prev) => ({
      ...prev,
      [field]: value === undefined ? '' : value, // Default to empty string if value is undefined
    }));
  };

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
                  <Button className={`${styles.searchButton} react-aria-Button`} type="button" onPress={redirectToQuestionTypes}>Change type</Button>
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


                {questionType && ["radioButtons", "checkBoxes", "selectBox"].includes(questionType) && (
                  <>
                    <p className={styles.optionsDescription}>{QuestionAdd('helpText.questionOptions', { questionName })}</p>
                    <div className={styles.optionsWrapper}>
                      <QuestionOptionsComponent rows={rows} setRows={setRows} formSubmitted={formSubmitted} setFormSubmitted={setFormSubmitted} />
                    </div>
                  </>
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


                {questionType && ["text", "textarea"].includes(questionType) && (
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

