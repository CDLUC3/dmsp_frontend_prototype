'use client';

import React, { useEffect, useRef, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import classNames from 'classnames';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Label,
  Link,
  TextArea,
  TextField
} from "react-aria-components";
import { CalendarDate, DateValue } from "@internationalized/date";
import DOMPurify from 'dompurify';

import styles from './PlanOverviewQuestionPage.module.scss';
import { useTranslations } from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel,
  DrawerPanel
} from "@/components/Container";

import {
  SectionVersionsQuery,
  useAnswerByVersionedQuestionIdLazyQuery,
  useSectionVersionsQuery,
  usePlanQuery,
  useQuestionQuery,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { Card, } from "@/components/Card/card";
import ErrorMessages from '@/components/ErrorMessages';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';

// Context
import { useToast } from '@/context/ToastContext';

// Utils
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';

import {
  OPTIONS_QUESTION_TYPES
} from '@/lib/constants';
import { QuestionTypeMap } from '@/utils/questionTypeHandlers';

import {
  Question,
} from '@/app/types';
import { useRenderQuestionField } from '@/components/hooks/useRenderQuestionField';
import {
  addAnswerAction,
  updateAnswerAction
} from './actions';



type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];

interface PlanData {
  funder: string;
  funderName: string;
  title: string;
}

const PlanOverviewQuestionPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;
  const sectionId = params.sid as string;
  const questionId = params.qid as string;
  const toastState = useToast(); // Access the toast state from context


  const [question, setQuestion] = useState<Question>();
  const [plan, setPlan] = useState<PlanData>();
  const [questionType, setQuestionType] = useState<string>('');
  const [versionedSectionId, setVersionedSectionId] = useState<number | null>();

  // Drawer states
  const [isSampleTextDrawerOpen, setSampleTextDrawerOpen] = useState<boolean>(false);
  const [isCommentsDrawerOpen, setCommentsDrawerOpen] = useState<boolean>(false);
  const openSampleTextButtonRef = useRef<HTMLButtonElement | null>(null);
  const openCommentsButtonRef = useRef<HTMLButtonElement | null>(null);



  const [versionedQuestionId, setVersionedQuestionId] = useState<number | null>();
  const [parsed, setParsed] = useState<AnyParsedQuestion>();
  const [errors, setErrors] = useState<string[]>([]);
  const [otherField, setOtherField] = useState(false);
  const [affiliationData, setAffiliationData] = useState<{ affiliationName: string, affiliationId: string }>({ affiliationName: '', affiliationId: '' });
  const [otherAffiliationName, setOtherAffiliationName] = useState<string>('');
  const [selectedRadioValue, setSelectedRadioValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<number | null>(null);
  const [urlValue, setUrlValue] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState<string | null>(null);
  const [textValue, setTextValue] = useState<string | number | null>(null);
  const [inputCurrencyValue, setInputCurrencyValue] = useState<number | null>(null);
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([]);
  const [yesNoValue, setYesNoValue] = useState<string>('no');
  const [textAreaContent, setTextAreaContent] = useState<string>('');
  // Add local state for multiSelect values
  const [selectedMultiSelectValues, setSelectedMultiSelectValues] = useState<Set<string>>(new Set());

  // Add local state to track if user has interacted with MultiSelect
  const [multiSelectTouched, setMultiSelectTouched] = useState(false);

  // Add local state for selected select value
  const [selectedSelectValue, setSelectedSelectValue] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null }>({
    startDate: '',
    endDate: '',
  });
  const [numberRange, setNumberRange] = useState<{ startNumber: number | null, endNumber: number | null }>({
    startNumber: 0,
    endNumber: 0,
  });
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Localization
  const Global = useTranslations('Global');
  const PlanOverview = useTranslations('PlanOverview');
  const t = useTranslations('PlanOverviewQuestionPage');


  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = t('messages.success.questionSaved');
    toastState.add(successMessage, { type: 'success', timeout: 3000 });
  }

  const toggleSampleTextDrawer = () => {
    setSampleTextDrawerOpen(!isSampleTextDrawerOpen);
  }

  const toggleCommentsDrawer = () => {
    setCommentsDrawerOpen(!isCommentsDrawerOpen);
  }


  const convertToHTML = (htmlString: string | null | undefined) => {
    if (htmlString) {
      const sanitizedHTML = DOMPurify.sanitize(htmlString);
      return (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
      );
    }
    return null;
  };

  const handleUseAnswer = (text: string | null | undefined) => {
    if (text) {
      setTextAreaContent(text);

      // Close sample text drawer
      setSampleTextDrawerOpen(false);

      // Return focus to sample text button
      if (openSampleTextButtonRef.current) {
        openSampleTextButtonRef.current.focus();
      }

      // message user
      toastState.add('Sample text added', { type: 'success', timeout: 3000 });
    }
  }

  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Close comments drawer
    setCommentsDrawerOpen(false);

    // Return focus to sample text button
    if (openCommentsButtonRef.current) {
      openCommentsButtonRef.current.focus();
    }

    // message user
    toastState.add('Comment sent', { type: 'success', timeout: 3000 });
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

  // Get Plan using planId
  const { data: planData, loading: planQueryLoading, error: planQueryError, refetch } = usePlanQuery(
    {
      variables: { planId: Number(dmpId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Get sectionVersions from sectionId
  const { data: sectionVersions, loading: versionedSectionLoading, error: versionedSectionError, refetch: refetchVersionedSection } = useSectionVersionsQuery(
    {
      variables: { sectionId: Number(sectionId) }
    }
  )

  // Get loadAnswer to call later, after we set the versionedQuestionId
  const [loadAnswer, { data: answerData, loading: answerLoading, error: answerError }] =
    useAnswerByVersionedQuestionIdLazyQuery();

  // Check if question is an options type
  const isOptionsType = (questionType: string) => {
    return Boolean(questionType && OPTIONS_QUESTION_TYPES.includes(questionType));
  }

  const handleAffiliationChange = async (id: string, value: string) => {
    return setAffiliationData({ affiliationName: value, affiliationId: id })
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherAffiliationName(value);
  };

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setSelectedRadioValue(value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlValue(value);
  };


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextValue(value);
  };

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    setSelectedCheckboxValues(values);
  };

  const handleBooleanChange = (values: string) => {
    setYesNoValue(values);
  };

  // Handler for MultiSelect changes
  const handleMultiSelectChange = (values: Set<string>) => {
    setSelectedMultiSelectValues(values);
    setMultiSelectTouched(true);
  };

  // Handler for date range changes
  const handleDateChange = (
    key: string,
    value: string | DateValue | CalendarDate | null
  ) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler for number range changes
  const handleNumberChange = (
    key: string,
    value: string | number | null
  ) => {
    setNumberRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const prefillAnswer = (answer: any, type: string) => {
    switch (type) {
      case 'text':
        setTextValue(answer ?? '');
        break;
      case 'textArea':
        setTextAreaContent(answer ?? '');
        break;
      case 'radioButtons':
        setSelectedRadioValue(answer ?? '');
        break;
      case 'checkBoxes':
        setSelectedCheckboxValues(Array.isArray(answer) ? answer : []);
        break;
      case 'selectBox':
        if (questionType === 'selectBox' && (parsed && parsed.type === 'selectBox')) {
          setSelectedSelectValue(answer ?? '');
        }
        setSelectedMultiSelectValues(new Set(Array.isArray(answer) ? answer : []));

        break;
      case 'boolean':
        setYesNoValue(answer ?? 'no');
        break;
      case 'email':
        setEmailValue(answer ?? '');
        break;
      case 'url':
        setUrlValue(answer ?? '');
        break;
      case 'number':
        setInputValue(typeof answer === 'number' ? answer : null);
        break;
      case 'currency':
        setInputCurrencyValue(typeof answer === 'number' ? answer : null);
        break;
      case 'date':
      case 'dateRange':
        if (answer?.startDate || answer?.endDate) {
          setDateRange({
            startDate: answer?.startDate ?? null,
            endDate: answer?.endDate ?? null,
          });
        }
        break;
      case 'numberRange':
        if (answer?.startNumber || answer?.endNumber) {
          setNumberRange({
            startNumber: answer?.startNumber ?? 0,
            endNumber: answer?.endNumber ?? 0,
          });
        }
        break;
      case 'typeaheadSearch':
        if (answer) {
          setAffiliationData({
            affiliationId: answer.affiliationId ?? '',
            affiliationName: answer.affiliationName ?? ''
          });
          setOtherField(answer.isOther ?? false);
          setOtherAffiliationName(answer.affiliationName ?? '');
        }
        break;
      default:
        break;
    }
  };

  const getAnswerJson = (): Record<string, any> => {
    switch (questionType) {
      case 'textArea':
        return { answer: textAreaContent };

      case 'text':
        return { answer: textValue };

      case 'radioButtons':
        return { answer: selectedRadioValue };

      case 'checkBoxes':
        return { answer: selectedCheckboxValues };

      case 'selectBox':
        if (questionType === 'selectBox' && (parsed && parsed.type === 'selectBox')) {
          if (parsed?.attributes?.multiple === true) {
            return { answer: Array.from(selectedMultiSelectValues) }; // this is for multiSelect
          }
          return { answer: selectedSelectValue };
        }

      case 'boolean':
        return { answer: yesNoValue };

      case 'email':
        return { answer: emailValue };

      case 'url':
        return { answer: urlValue };

      case 'number':
        return { answer: inputValue };

      case 'currency':
        return { answer: inputCurrencyValue };

      case 'dateRange':
      case 'date': {
        return {
          answer: {
            startDate: dateRange.startDate?.toString() ?? null,
            endDate: dateRange.endDate?.toString() ?? null
          }
        };
      }

      case 'numberRange':
        return {
          answer: {
            startNumber: numberRange.startNumber,
            endNumber: numberRange.endNumber
          }
        };

      case 'typeaheadSearch':
        return {
          answer: {
            affiliationId: affiliationData.affiliationId,
            affiliationName: otherField ? otherAffiliationName : affiliationData.affiliationName,
            isOther: otherField,
          }
        };

      default:
        return { answer: textAreaContent };
    }
  };


  // Call Server Action publishPlanAction to run the publishPlanMutation
  const addAnswer = async () => {
    const jsonPayload = getAnswerJson();

    // Check is answer already exists. If so, we want to call an update mutation
    const isUpdate = Boolean(answerData?.answerByVersionedQuestionId);

    if (question) {
      try {
        const response = isUpdate
          ? await updateAnswerAction({
            answerId: Number(answerData?.answerByVersionedQuestionId?.id),
            json: JSON.stringify(jsonPayload),
          })
          : await addAnswerAction({
            planId: Number(dmpId),
            versionedSectionId: Number(versionedSectionId),
            versionedQuestionId: Number(versionedQuestionId),
            json: JSON.stringify(jsonPayload),
          });
        if (response.redirect) {
          router.push(response.redirect);
        }

        return {
          success: response.success,
          errors: response.errors,
          data: response.data
        }
      } catch (error) {
        logECS('error', 'addAnswer', {
          error,
          url: {
            path: routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId })
          }
        });
      }
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: null
    };
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await addAnswer();

    if (!result.success) {
      const errors = result.errors;
      setErrors(prev => [...prev, Global('messaging.somethingWentWrong')])
    } else {
      // On success

      if (
        result.data?.errors &&
        typeof result.data.errors === 'object' &&
        typeof result.data.errors.general === 'string') {
        // Handle errors as an object with general or field-level errors
        setErrors(prev => [...prev, Global('messaging.somethingWentWrong')])

      } else {
        showSuccessToast();
        router.push(routePath('projects.dmp.section', { projectId, dmpId, sectionId }))

      }

    }
  };

  interface VersionedQuestion {
    id: number;
    questionText: string;
    json: string;
    questionId: number;
  }

  interface Section {
    __typename: "Section";
    id: number;
  }

  interface VersionedSection {
    id: number;
    versionedQuestions: VersionedQuestion[];
    section: Section;
  }

  interface SectionVersionsData {
    sectionVersions: VersionedSection[] | null;
  }

  const findVersionedQuestionId = (sectionVersions: SectionVersionsQuery, questionId: number) => {
    if (!sectionVersions?.sectionVersions) return null;

    for (const sectionVersion of sectionVersions.sectionVersions) {
      if (!sectionVersion?.versionedQuestions) continue;

      const foundQuestion = sectionVersion.versionedQuestions.find(
        (question) => question?.questionId === questionId
      );
      if (foundQuestion?.id) {
        return foundQuestion.id;
      }
    }
    return null;
  };
  useEffect(() => {
    if (selectedQuestion?.question) {
      const q = selectedQuestion.question;

      try {
        const { parsed, error } = getParsedQuestionJSON(q, routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }), Global);
        if (!parsed?.type) {
          if (error) {
            logECS('error', 'Parsing error', {
              error: 'Invalid question type in parsed JSON',
              url: { path: routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }) }
            });

            setErrors(prev => [...prev, error])
          }
          return;
        }

        const questionType = parsed.type;

        setQuestionType(questionType);
        setParsed(parsed);
        setQuestion(q);
      } catch (error) {
        logECS('error', 'Parsing error', {
          error,
          url: { path: routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }) }
        });
        setErrors(prev => [...prev, 'Error parsing question data']);
      }
    }
  }, [selectedQuestion]);


  useEffect(() => {
    if (planData?.plan) {
      // Validate section belongs to plan - 404 if not
      const planSections = planData?.plan?.sections || [];
      const sectionBelongsToPlan = planSections && planSections.some(section => section.sectionId === Number(sectionId));

      if (!sectionBelongsToPlan) {
        notFound();
      }
      const planInfo = {
        funder: planData?.plan?.project?.fundings?.[0]?.affiliation?.displayName ?? '',
        funderName: planData?.plan?.project?.fundings?.[0]?.affiliation?.name ?? '',
        title: planData?.plan?.project?.title ?? ''
      }
      setPlan(planInfo);
    };
  }, [planData]);


  useEffect(() => {
    if (sectionVersions && sectionVersions?.sectionVersions) {
      setVersionedSectionId(sectionVersions?.sectionVersions?.[0]?.id);
      if (sectionVersions) {
        const versionedQuestionId = findVersionedQuestionId(sectionVersions, Number(questionId));
        setVersionedQuestionId(versionedQuestionId ?? null);
      }
    }
  }, [sectionVersions])

  // Run the query when versionedQuestionId becomes available
  useEffect(() => {
    if (versionedQuestionId) {
      loadAnswer({
        variables: {
          projectId: Number(projectId),
          planId: Number(dmpId),
          versionedQuestionId: Number(versionedQuestionId),
        }
      });
    }
  }, [versionedQuestionId, loadAnswer, projectId, dmpId]);

  //Wait for answerData and questionType, then prefill the state
  useEffect(() => {
    const json = answerData?.answerByVersionedQuestionId?.json;
    if (json && questionType) {
      try {
        const parsed = JSON.parse(json);
        if (parsed?.answer !== undefined) {
          prefillAnswer(parsed.answer, questionType);
        }
      } catch (err) {
        console.error('Could not parse saved answer JSON', err);
      }
    }
  }, [answerData, questionType]);


  const questionField = useRenderQuestionField({
    questionType,
    parsed,
    question,
    textFieldProps: {
      textValue: typeof textValue === 'string' ? textValue : '',
      handleTextChange,
    },
    textAreaProps: {
      content: textAreaContent ?? '',
      setContent: setTextAreaContent
    },
    radioProps: {
      selectedRadioValue,
      handleRadioChange
    },
    checkBoxProps: {
      selectedCheckboxValues,
      handleCheckboxGroupChange,
    },
    selectBoxProps: {
      selectedSelectValue,
      setSelectedSelectValue,
    },
    multiSelectBoxProps: {
      selectedMultiSelectValues,
      handleMultiSelectChange,
      multiSelectTouched,
    },
    dateProps: {
      dateRange,
      handleDateChange,
    },
    dateRangeProps: {
      dateRange,
      handleDateChange,
    },
    numberProps: {
      inputValue,
      setInputValue,
    },
    numberRangeProps: {
      numberRange,
      handleNumberChange,
    },
    currencyProps: {
      inputCurrencyValue,
      setInputCurrencyValue,
    },
    urlProps: {
      urlValue,
      handleUrlChange,
    },
    emailProps: {
      emailValue,
      handleEmailChange,
    },
    booleanProps: {
      yesNoValue,
      handleBooleanChange,
    },
    typeaheadSearchProps: {
      affiliationData,
      otherAffiliationName,
      otherField,
      setOtherField,
      handleAffiliationChange,
      handleOtherAffiliationChange,
    },
  });

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }


  return (
    <>
      <PageHeader
        title={plan?.title ?? ''}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={PlanOverview('navigation.navigation')}>
            <Breadcrumb><Link
              href="/en-US">{PlanOverview('navigation.home')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/en-US/projects">{PlanOverview('navigation.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/en-US/projects/${projectId}/`}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/en-US/projects/${projectId}/dmp/${dmpId}/`}>{plan?.title}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.questionDetails')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutWithPanel className={classNames('layout-mask', { 'drawer-open': isSampleTextDrawerOpen || isCommentsDrawerOpen })}>
        <ContentContainer>
          <div className="container"><span></span>
            <section aria-label={"Requirements"}>
              <h3 className={"h4"}>Requirements by {plan?.funder}</h3>

              {convertToHTML(question?.requirementText)}

            </section>
            <Form onSubmit={handleSubmit}>
              <Card data-testid='question-card'>

                <span>Question</span>
                <h2 id="question-title">
                  {question?.questionText}
                </h2>
                <div>
                  <div className={styles.buttonsRow}>
                    {/**Only include sample text button for textArea question types */}
                    {questionType === 'textArea' && (
                      <div className="">
                        <Button
                          ref={openSampleTextButtonRef}
                          className={`${styles.buttonSmall} tertiary`}
                          data-secondary
                          onPress={toggleSampleTextDrawer}
                        >
                          View 2 sample answers
                        </Button>
                      </div>
                    )}

                    <div className="">
                      <Button
                        ref={openCommentsButtonRef}
                        className={`${styles.buttonSmall}`}
                        onPress={toggleCommentsDrawer}
                      >
                        4 Comments
                      </Button>
                    </div>
                  </div>
                  {parsed && questionField}

                </div>
                <div className="lastSaved mt-5"
                  aria-live="polite"
                  role="status">
                  Last saved X minutes ago
                </div>
              </Card>

              <section aria-label={"Guidance"}>
                <h3 className={"h4"}>Guidance by {plan?.funder}</h3>

                {convertToHTML(question?.guidanceText)}


                <h3 className={"h4"}>Guidance by University of California</h3>
                <p>
                  This is the most detailed section of the data management plan.
                  Describe the categories of data being collected and how they tie
                  into the data associated with the methods used to collect that
                  data.
                </p>
                <p>
                  Expect this section to be the most detailed section, taking up a
                  large portion of your data management plan document.
                </p>
              </section>

              <div className={styles.actions}>
                <div className={styles.actionItem}>
                  <button
                    className="react-aria-Button react-aria-Button--primary"
                    aria-label="Return to section overview"
                  >
                    Back to Section
                  </button>
                </div>
                <div className={styles.actionItem}>
                  <button
                    className="react-aria-Button react-aria-Button--primary"
                    aria-label="Save answer"
                    type="submit"
                  >
                    Save
                  </button>
                  <p
                    className={styles.lastSaved}
                    aria-live="polite"
                    role="status"
                  >
                    Last saved: X mins ago
                  </p>

                </div>
              </div>
            </Form>


          </div>
        </ContentContainer>

        <SidebarPanel>
          <div
            className={styles.bestPracticesPanel}
            aria-labelledby="best-practices-title"
          >
            <h3 id="best-practices-title">Best practice by DMP Tool</h3>
            <p>Most relevant best practice guide</p>

            <div role="navigation" aria-label="Best practices navigation"
              className={styles.bestPracticesLinks}>
              <Link href="/best-practices/sharing">
                Data sharing
                <svg width="20" height="20" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/preservation">
                Data preservation
                <svg width="20" height="20" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/protection">
                Data protection
                <svg width="20" height="20" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="/best-practices/all">
                All topics
                <svg width="20" height="20" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                    clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </SidebarPanel>

        {/** Sample text drawer. Only include for question types = Text Area */}
        {questionType === 'textArea' && (
          <DrawerPanel
            isOpen={isSampleTextDrawerOpen}
            onClose={() => setSampleTextDrawerOpen(false)}
            returnFocusRef={openSampleTextButtonRef}
          >
            <h3>{question?.questionText}</h3>
            <h4 className={`${styles.deEmphasize} h5`}>{plan?.funderName} sample text</h4>
            <div className={styles.sampleText}>
              {convertToHTML(question?.sampleText)}
            </div>
            <div className="">
              <Button className={`${styles.buttonSmall}`} onPress={() => handleUseAnswer(question?.sampleText)}>Use answer</Button>
            </div>
          </DrawerPanel>
        )}


        {/**Comments drawer */}
        <DrawerPanel
          isOpen={isCommentsDrawerOpen}
          onClose={() => setCommentsDrawerOpen(false)}
          returnFocusRef={openCommentsButtonRef}
        >
          <h2>Comments</h2>
          <div className={styles.comment}>
            <h4>John Smith</h4>
            <p className={styles.deEmphasize}>2 days ago</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className={styles.comment}>
            <h4>John Smith</h4>
            <p className={styles.deEmphasize}>2 days ago</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className={styles.leaveComment}>
            <h2>Leave a comment</h2>
            <Form onSubmit={(e) => handleAddComment(e)}>
              <TextField>
                <Label>Frederick Cook (you)</Label>
                <TextArea />
              </TextField>
              <div>
                <Button type="submit" className={`${styles.buttonSmall}`} >Comment</Button>
                <p>Participants will be notified once submitted.</p>
              </div>
            </Form>
          </div>
        </DrawerPanel>
      </LayoutWithPanel >
    </>
  );
}

export default PlanOverviewQuestionPage;
