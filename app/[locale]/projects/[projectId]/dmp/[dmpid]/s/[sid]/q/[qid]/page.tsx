'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import classNames from 'classnames';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Form,
  Label,
  Link,
  OverlayArrow,
  Popover,
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
import { DmpIcon } from "@/components/Icons";
import { useRenderQuestionField } from '@/components/hooks/useRenderQuestionField';

// Context
import { useToast } from '@/context/ToastContext';

// Utils
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
import { QuestionTypeMap } from '@/utils/questionTypeHandlers';

import {
  Question,
} from '@/app/types';

import {
  addAnswerAction,
  updateAnswerAction
} from './actions';



type AnyParsedQuestion = QuestionTypeMap[keyof QuestionTypeMap];

interface MutationErrorsInterface {
  acronyms: string | null;
  aliases: string | null;
  contactEmail: string | null;
  displayName: string | null;
  feedbackEmails: string | null;
  feedbackMessage: string | null;
  funderRefId: string | null;
  general: string | null;
  homepage: string | null;
  json: string | null;
  logoName: string | null;
  logoURI: string | null;
  name: string | null;
  planId: string | null;
  provenance: string | null;
  searchName: string | null;
  ssoEntityId: string | null;
  subHeaderLinks: string | null;
  types: string | null;
  uri: string | null;
  versionedQuestionId: string | null;
  versionedSectionId: string | null;
}
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
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Question, plan and versionedSection states
  const [question, setQuestion] = useState<Question>();
  const [plan, setPlan] = useState<PlanData>();
  const [questionType, setQuestionType] = useState<string>('');
  const [versionedSectionId, setVersionedSectionId] = useState<number | null>();
  const [versionedQuestionId, setVersionedQuestionId] = useState<number | null>();
  const [parsed, setParsed] = useState<AnyParsedQuestion>();
  const [errors, setErrors] = useState<string[]>([]);

  // Drawer states
  const [isSideBarPanelOpen, setIsSideBarPanelOpen] = useState<boolean>(true);
  const [isSampleTextDrawerOpen, setSampleTextDrawerOpen] = useState<boolean>(false);
  const [isCommentsDrawerOpen, setCommentsDrawerOpen] = useState<boolean>(false);
  const openSampleTextButtonRef = useRef<HTMLButtonElement | null>(null);
  const openCommentsButtonRef = useRef<HTMLButtonElement | null>(null);


  // Question field states
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

  // State variables for tracking auto-save info
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Localization
  const Global = useTranslations('Global');
  const PlanOverview = useTranslations('PlanOverview');
  const t = useTranslations('PlanOverviewQuestionPage');


  /*GraphQL queries */

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
  const { data: planData, loading: planQueryLoading, error: planQueryError } = usePlanQuery(
    {
      variables: { planId: Number(dmpId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Get sectionVersions from sectionId
  const { data: sectionVersions, loading: versionedSectionLoading, error: versionedSectionError } = useSectionVersionsQuery(
    {
      variables: { sectionId: Number(sectionId) }
    }
  )

  // Get loadAnswer to call later, after we set the versionedQuestionId
  const [loadAnswer, { data: answerData, loading: answerLoading, error: answerError }] =
    useAnswerByVersionedQuestionIdLazyQuery();


  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = t('messages.success.questionSaved');
    toastState.add(successMessage, { type: 'success', timeout: 3000 });
  }

  /*Handling Drawer Panels*/
  // Toggle the sample text drawer open and closed
  const toggleSampleTextDrawer = () => {
    const newDrawerState = !isSampleTextDrawerOpen;

    setSampleTextDrawerOpen(newDrawerState);
    setIsSideBarPanelOpen(!newDrawerState); // Opposite of drawer state 
  }

  // Toggle the comments drawer open and closed
  const toggleCommentsDrawer = () => {
    const newDrawerState = !isSampleTextDrawerOpen;

    setCommentsDrawerOpen(newDrawerState);
    setIsSideBarPanelOpen(!newDrawerState); // Opposite of drawer state
  }

  // Just close the current drawer and no need to check mask/backdrop
  const closeCurrentDrawer = () => {
    setIsSideBarPanelOpen(true);
    setSampleTextDrawerOpen(false);
    setCommentsDrawerOpen(false);
  }

  // Close all drawer panels. One scenario is when the user clicks on the masked content.
  const closeDrawers = (e?: React.MouseEvent<HTMLDivElement, MouseEvent> | React.MouseEvent<Element, MouseEvent>) => {
    setIsSideBarPanelOpen(true);

    // Only close if clicking on the mask/backdrop, not the drawer content
    if (e && e.target === e.currentTarget) {
      if (isCommentsDrawerOpen || isSampleTextDrawerOpen) {
        setSampleTextDrawerOpen(false);
        setCommentsDrawerOpen(false);
      }
    }
  }

  // When the user clicks on the 'use answer' button from the Sample text drawer panel
  const handleUseAnswer = (text: string | null | undefined) => {
    if (text) {
      // Set the new value for the textArea
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

  // When the user adds a comment in the Comments drawer panel
  const handleAddComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /*TODO: when the backend has been updated, we will be able to update this function*/
    // Close comments drawer
    closeCurrentDrawer();

    // Return focus to sample text button
    if (openCommentsButtonRef.current) {
      openCommentsButtonRef.current.focus();
    }

    // message user
    toastState.add('Comment sent', { type: 'success', timeout: 3000 });
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


  // Handling changes to different question types

  const handleAffiliationChange = async (id: string, value: string) => {
    const result = setAffiliationData({ affiliationName: value, affiliationId: id });
    setHasUnsavedChanges(true);
    return result;
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherAffiliationName(value);
    setHasUnsavedChanges(true);
  };

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setSelectedRadioValue(value);
    setHasUnsavedChanges(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlValue(value);
    setHasUnsavedChanges(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);
    setHasUnsavedChanges(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextValue(value);
    setHasUnsavedChanges(true);
  };

  const handleTextAreaChange = () => {
    setHasUnsavedChanges(true);
  };

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    setSelectedCheckboxValues(values);
    setHasUnsavedChanges(true);
  };

  const handleBooleanChange = (values: string) => {
    setYesNoValue(values);
    setHasUnsavedChanges(true);
  };

  // Handler for MultiSelect changes
  const handleMultiSelectChange = (values: Set<string>) => {
    setSelectedMultiSelectValues(values);
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const handleBackToSection = () => {
    router.push(routePath('projects.dmp.section', { projectId, dmpId, sectionId }))
  }

  // Prefill the current question with existing answer
  /*eslint-disable @typescript-eslint/no-explicit-any*/
  const prefillAnswer = (answer: any, type: string) => {
    switch (type) {
      case 'text':
        setTextValue(answer);
        break;
      case 'textArea':
        setTextAreaContent(answer);
        break;
      case 'radioButtons':
        setSelectedRadioValue(answer);
        break;
      case 'checkBoxes':
        setSelectedCheckboxValues(answer);
        break;
      case 'selectBox':
        if (questionType === 'selectBox' && (parsed && parsed.type === 'selectBox')) {
          setSelectedSelectValue(answer);
        }
        setSelectedMultiSelectValues(answer);

        break;
      case 'boolean':
        setYesNoValue(answer);
        break;
      case 'email':
        setEmailValue(answer);
        break;
      case 'url':
        setUrlValue(answer);
        break;
      case 'number':
        setInputValue(answer);
        break;
      case 'currency':
        setInputCurrencyValue(answer);
        break;
      case 'date':
      case 'dateRange':
        if (answer?.startDate || answer?.endDate) {
          setDateRange({
            startDate: answer?.startDate,
            endDate: answer?.endDate,
          });
        }
        break;
      case 'numberRange':
        if (answer?.startNumber || answer?.endNumber) {
          setNumberRange({
            startNumber: answer?.startNumber,
            endNumber: answer?.endNumber,
          });
        }
        break;
      case 'typeaheadSearch':
        if (answer) {
          setAffiliationData({
            affiliationId: answer.affiliationId,
            affiliationName: answer.affiliationName
          });
          setOtherField(answer.isOther);
          setOtherAffiliationName(answer.affiliationName);
        }
        break;
      default:
        break;
    }
  };

  // Get the answer for the question
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

  // GraphQL mutation returns errors
  const hasFieldLevelErrors = (mutationErrors: MutationErrorsInterface): boolean => {
    return Object.values(mutationErrors).some(
      value => value !== null && value !== undefined
    );
  };

  // Extract the errors from the graphql mutation result
  const getExtractedErrorValues = (mutationErrors: MutationErrorsInterface): string[] => {
    return Object.values(mutationErrors).filter(
      (value) => value !== null && value !== undefined
    );
  };

  // Call Server Action updateAnswerAction or addAnswerAction to save answer
  const addAnswer = async (isAutoSave = false) => {

    if(isAutoSave) {
      setIsAutoSaving(true);
    }

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
      } finally {
        if(isAutoSave) {
          setIsAutoSaving(false);
          setHasUnsavedChanges(false);
        } 
      }
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: null
    };
  }

  // Handle submit of question detail form
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const result = await addAnswer();

    if (!result.success) {
      const errors = result.errors;
      if (errors) {
        setErrors(errors)
      }
    } else {
      // On success
      if (result.data?.errors && hasFieldLevelErrors(result.data.errors as unknown as MutationErrorsInterface)) {
        const mutationErrors = result.data.errors as unknown as MutationErrorsInterface;
        const extractedErrors = getExtractedErrorValues(mutationErrors);
        // Handle errors as an object with general or field-level errors
        setErrors(extractedErrors)

      } else {
        // Show user a success message and redirect back to the Section page
        showSuccessToast();
        router.push(routePath('projects.dmp.section', { projectId, dmpId, sectionId }))

      }
    }
  };

  // Get the versionedQuestionId for the given question. We will need this to get any existings answers for this question
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

  // Get parsed JSON from question, and set parsed, question and questionType in state
  useEffect(() => {
    if (selectedQuestion?.question) {
      const q = selectedQuestion.question;
      const cleanedQuestion = {
        ...q,
        required: q.required ?? undefined // convert null to undefined
      };

      try {
        const { parsed, error } = getParsedQuestionJSON(cleanedQuestion, routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }), Global);
        if (!parsed?.type) {
          if (error) {
            logECS('error', 'Parsing error', {
              error: 'Invalid question type in parsed JSON',
              url: { path: routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }) }
            });

            setErrors([error])
          }
          return;
        }

        const questionType = parsed.type;

        // Set data in state
        setQuestionType(questionType);
        setParsed(parsed);
        setQuestion(cleanedQuestion);
      } catch (error) {
        logECS('error', 'Parsing error', {
          error,
          url: { path: routePath('projects.dmp.question.detail', { projectId, dmpId, sectionId, questionId }) }
        });
        setErrors(['Error parsing question data']);
      }
    }
  }, [selectedQuestion]);


  // Set plan data in state
  useEffect(() => {
    if (planData?.plan) {
      // Validate section belongs to plan - 404 if not
      const planSections = planData?.plan?.sections || [];
      const sectionBelongsToPlan = planSections && planSections.some(section => section.sectionId === Number(sectionId));

      if (!sectionBelongsToPlan) {
        router.push('/not-found')
      }
      const planInfo = {
        funder: planData?.plan?.project?.fundings?.[0]?.affiliation?.displayName ?? '',
        funderName: planData?.plan?.project?.fundings?.[0]?.affiliation?.name ?? '',
        title: planData?.plan?.project?.title ?? ''
      }
      setPlan(planInfo);
    };
  }, [planData]);

  // Get versionedQuestionId and save in state
  useEffect(() => {
    if (sectionVersions && sectionVersions?.sectionVersions) {
      setVersionedSectionId(sectionVersions?.sectionVersions?.[0]?.id);
      if (sectionVersions) {
        const versionedQuestionId = findVersionedQuestionId(sectionVersions, Number(questionId));
        setVersionedQuestionId(versionedQuestionId ?? null);
      }
    }
  }, [sectionVersions])

  // Run the query when versionedQuestionId becomes available to lazy load the answer for the question
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
      const parsed = JSON.parse(json);
      if (parsed?.answer !== undefined) {
        prefillAnswer(parsed.answer, questionType);
      }
    }
  }, [answerData, questionType]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (!versionedQuestionId || !versionedSectionId || !question) return;

    autoSaveTimeoutRef.current = setTimeout(async () => {
      const { success } = await addAnswer(true);
      if (success) {
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [inputValue, versionedQuestionId, versionedSectionId, question, hasUnsavedChanges]);


  // Render the question using the useRenderQuestionField helper
  const questionField = useRenderQuestionField({
    questionType,
    parsed,
    textFieldProps: {
      textValue: typeof textValue === 'string' ? textValue : '',
      handleTextChange,
    },
    textAreaProps: {
      content: textAreaContent,
      setContent: setTextAreaContent,
      handleTextAreaChange
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

  // Auto-save on window blur and before unload
  useEffect(() => {
    const handleWindowBlur = () => {
      if (hasUnsavedChanges && !isAutoSaving) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        addAnswer(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        // Cannot save at this point, so we show a toast message warning
        toastState.add('You have unsaved changes. Are you sure you want to leave?', { type: 'info', timeout: 3000 });
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isAutoSaving]);

  // Helper function to format the last saved time
  const getLastSavedText = () => {
    if (isAutoSaving) {
      return 'Saving...';
    }

    if (!lastSavedAt) {
      return hasUnsavedChanges ? 'Unsaved changes' : '';
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSavedAt.getTime()) / (1000 * 60));

    if (diffInMinutes === 0) {
      return 'Saved just now';
    } else if (diffInMinutes === 1) {
      return 'Saved 1 minute ago';
    } else {
      return `Saved ${diffInMinutes} minutes ago`;
    }
  };

  if (loading || planQueryLoading || versionedSectionLoading || answerLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (selectedQuestionQueryError || planQueryError || versionedSectionError || answerError) {
    return <div>{Global('messaging.somethingWentWrong')}</div>
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

      <LayoutWithPanel
        onClick={e => closeDrawers(e)}
        className={classNames('layout-mask', { 'drawer-open': isSampleTextDrawerOpen || isCommentsDrawerOpen })}
      >
        <ContentContainer>
          <div className="container">
            {/**Requirements by funder */}
            <section aria-label={PlanOverview('page.requirementsBy', { funder: plan?.funder ?? '' })}>
              <h3 className={"h4"}>{PlanOverview('page.requirementsBy', { funder: plan?.funder ?? '' })}</h3>
              {convertToHTML(question?.requirementText)}
            </section>

            {/**Requirements by organization */}
            <section aria-label={"Requirements"}>
              <h3 className={"h4"}>Requirements by University of California</h3>
              <p>
                The university requires data and metadata to be cleared by the ethics
                committee before being submitted to funder.
              </p>
            </section>

            <p className={styles.guidanceLinkWrapper}>
              <DmpIcon icon="down_arrow" />
              <Link href="#guidance" className={`${styles.guidanceLink} react-aria-Link`}>{PlanOverview('page.jumpToGuidance')}</Link>
            </p>
            <Form onSubmit={handleSubmit}>
              <Card data-testid='question-card'>
                <span>Question</span>
                <h2 id="question-title" className="h3">
                  {question?.questionText}
                </h2>
                {question?.required && (
                  <div className={styles.requiredWrapper}>
                    <div><strong>{PlanOverview('page.requiredByFunder')}</strong></div>
                    <DialogTrigger>
                      <Button className={`${styles.popOverButton} react-aria-Button`} aria-label="Required by funder"><div className={styles.infoIcon}><DmpIcon icon="info" /></div></Button>
                      <Popover>
                        <OverlayArrow>
                          <svg width={12} height={12} viewBox="0 0 12 12">
                            <path d="M0 0 L6 6 L12 0" />
                          </svg>
                        </OverlayArrow>
                        <Dialog>
                          <div className="flex-col">
                            {PlanOverview('page.requiredByFunderInfo')}
                          </div>
                        </Dialog>
                      </Popover>
                    </DialogTrigger>
                  </div>
                )}
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
                          {PlanOverview('page.viewSampleAnswer')}
                        </Button>
                      </div>
                    )}

                    <div className="">
                      <Button
                        ref={openCommentsButtonRef}
                        className={`${styles.buttonSmall} ${styles.buttonWithComments}`}
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
                  {getLastSavedText()}
                </div>
              </Card>

              <section aria-label={"Guidance"} id="guidance">
                <h3 className={"h4"}>{PlanOverview('page.guidanceBy', { funder: plan?.funder ?? '' })}</h3>

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
              <div className={styles.modalAction}>
                <div>
                  <Button
                    type="submit"
                    data-secondary
                    className="primary"
                    aria-label={PlanOverview('labels.saveAnswer')}
                  >
                    {Global('buttons.save')}
                  </Button>
                </div>
                <div>
                  <Button
                    className="secondary"
                    aria-label={PlanOverview('labels.returnToSection')}
                    onPress={() => handleBackToSection()}
                  >
                    {PlanOverview('buttons.backToSection')}
                  </Button>
                </div>

              </div>
            </Form>
          </div>
        </ContentContainer >

        <SidebarPanel isOpen={isSideBarPanelOpen}>
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
        {
          questionType === 'textArea' && (
            <DrawerPanel
              isOpen={isSampleTextDrawerOpen}
              onClose={closeCurrentDrawer}
              returnFocusRef={openSampleTextButtonRef}
              className={styles.drawerPanelWrapper}
            >
              <h3>{question?.questionText}</h3>
              <h4 className={`${styles.deEmphasize} h5`}>{PlanOverview('page.funderSampleText', { funder: plan?.funderName ?? '' })}</h4>
              <div className={styles.sampleText}>
                {convertToHTML(question?.sampleText)}
              </div>
              <div className="">
                <Button className={`${styles.buttonSmall}`} onPress={() => handleUseAnswer(question?.sampleText)}>{PlanOverview('buttons.useAnswer')}</Button>
              </div>
            </DrawerPanel>
          )
        }


        {/**Comments drawer */}
        <DrawerPanel
          isOpen={isCommentsDrawerOpen}
          onClose={closeCurrentDrawer}
          returnFocusRef={openCommentsButtonRef}
          className={styles.drawerPanelWrapper}
        >
          <h2>{PlanOverview('headings.comments')}</h2>
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
            <h2>{PlanOverview('headings.leaveAComment')}</h2>
            <Form onSubmit={(e) => handleAddComment(e)}>
              <TextField>
                <Label>Frederick Cook (you)</Label>
                <TextArea />
              </TextField>
              <div>
                <Button type="submit" className={`${styles.buttonSmall}`}>{PlanOverview('buttons.comment')}</Button>
                <p>{PlanOverview('page.participantsWillBeNotified')}</p>
              </div>
            </Form>
          </div>
        </DrawerPanel>
      </LayoutWithPanel >
    </>
  );
}

export default PlanOverviewQuestionPage;
