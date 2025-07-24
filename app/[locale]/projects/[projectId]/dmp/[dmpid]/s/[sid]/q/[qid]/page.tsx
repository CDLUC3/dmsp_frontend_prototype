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

interface FormDataInterface {
  otherField: boolean;
  affiliationData: { affiliationName: string; affiliationId: string };
  otherAffiliationName: string;
  selectedRadioValue: string;
  numberValue: number | null;
  urlValue: string | null;
  emailValue: string | null;
  textValue: string | number | null;
  inputCurrencyValue: number | null;
  selectedCheckboxValues: string[];
  yesNoValue: string;
  textAreaContent: string;
  selectedMultiSelectValues: Set<string>;
  selectedSelectValue: string | undefined;
  dateRange: { startDate: string | DateValue | CalendarDate | null; endDate: string | DateValue | CalendarDate | null };
  numberRange: { startNumber: number | null; endNumber: number | null };
}

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
  const [formData, setFormData] = useState<FormDataInterface>({
    otherField: false,
    affiliationData: { affiliationName: '', affiliationId: '' },
    otherAffiliationName: '',
    selectedRadioValue: '',
    numberValue: null,
    urlValue: null,
    emailValue: null,
    textValue: null,
    inputCurrencyValue: null,
    selectedCheckboxValues: [],
    yesNoValue: 'no',
    textAreaContent: '',
    selectedMultiSelectValues: new Set<string>(),
    selectedSelectValue: undefined,
    dateRange: { startDate: '', endDate: '' },
    numberRange: { startNumber: 0, endNumber: 0 },
  });

  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State variables for tracking auto-save info
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  function buildSetContent<T extends keyof FormDataInterface>(
    key: T,
    setFormData: React.Dispatch<React.SetStateAction<typeof formData>>
  ) {
    return (value: FormDataInterface[T]) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };
  }

  // When the user clicks on the 'use answer' button from the Sample text drawer panel
  const handleUseAnswer = (text: string | null | undefined) => {
    if (text) {
      // Set the new value for the textArea
      setFormData(prev => ({
        ...prev,
        textAreaContent: text
      }));

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
    const result = setFormData(prev => ({
      ...prev,
      affiliationData: {
        affiliationName: value,
        affiliationId: id
      }
    }));
    setHasUnsavedChanges(true);
    return result;
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      otherAffiliationName: value
    }));
    setHasUnsavedChanges(true);
  };

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRadioValue: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      urlValue: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      emailValue: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      textValue: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleTextAreaChange = () => {
    setHasUnsavedChanges(true);
  };

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedCheckboxValues: values
    }));
    setHasUnsavedChanges(true);
  };

  const handleBooleanChange = (values: string) => {
    setFormData(prev => ({
      ...prev,
      yesNoValue: values
    }));
    setHasUnsavedChanges(true);
  };


  // Handler for Select changes
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSelectValue: value
    }));
    setHasUnsavedChanges(true);
    };


  // Handler for MultiSelect changes
  const handleMultiSelectChange = (values: Set<string>) => {
    setFormData(prev => ({
      ...prev,
      selectedMultiSelectValues: values
    }));
    setHasUnsavedChanges(true);
  };

  // Handler for date range changes
  const handleDateChange = (
    key: string,
    value: string | DateValue | CalendarDate | null
  ) => {
    setFormData(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handler for currency changes
  const handleCurrencyChange = (value: number | null) => {
    setFormData(prev => ({
      ...prev,
      inputCurrencyValue: value
    }));
    setHasUnsavedChanges(true);
  };
  

  // Handler for number changes
  const handleNumberChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      numberValue: value
    }));
    setHasUnsavedChanges(true);
  };

  // Handler for number range changes
  const handleNumberRangeChange = (
    key: string,
    value: string | number | null
  ) => {
    setFormData(prev => ({
      ...prev,
      numberRange: {
        ...prev.numberRange,
        [key]: value === '' ? null : Number(value) // Convert empty string to null  
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleBackToSection = () => {
    router.push(routePath('projects.dmp.section', { projectId, dmpId, sectionId }))
  }

  function hasAttributes(obj: AnyParsedQuestion | undefined): obj is AnyParsedQuestion & { attributes: { multiple?: boolean } } {
    if(obj){
      return obj && typeof obj === 'object' && 'attributes' in obj;
    }
    return false;
  }

  // Prefill the current question with existing answer
  /*eslint-disable @typescript-eslint/no-explicit-any*/
  const prefillAnswer = (answer: any, type: string) => {
    switch (type) {
      case 'text':
        setFormData(prev => ({
          ...prev,
          textValue: answer
        }));
        break;
      case 'textArea':
        setFormData(prev => ({
          ...prev,
          textAreaContent: answer
        }));
        break;
      case 'radioButtons':
        setFormData(prev => ({
          ...prev,
          selectedRadioValue: answer
        }));
        break;
      case 'checkBoxes':
        setFormData(prev => ({
          ...prev,
          selectedCheckboxValues: answer
        }));
        break;
      case 'selectBox':
        if (questionType === 'selectBox' && (parsed && parsed.type === 'selectBox')) {
          setFormData(prev => ({
            ...prev,
            selectedSelectValue: answer
          }));
        }
        if (hasAttributes(parsed) && parsed.attributes.multiple === true) {
          setFormData(prev => ({
          ...prev,
          selectedMultiSelectValues: answer
        }));
      }

        break;
      case 'boolean':
        setFormData(prev => ({
          ...prev,
          yesNoValue: answer
        }));
        break;
      case 'email':
        setFormData(prev => ({
          ...prev,
          emailValue: answer
        }));
        break;
      case 'url':
        setFormData(prev => ({
          ...prev,
          urlValue: answer
        }));
        break;
      case 'number':
        setFormData(prev => ({
          ...prev,
          numberValue: answer
        }));
        break;
      case 'currency':
        setFormData(prev => ({
          ...prev,
          inputCurrencyValue: answer
        }));
        break;
      case 'date':
      case 'dateRange':
        if (answer?.startDate || answer?.endDate) {
          setFormData(prev => ({
            ...prev,
            dateRange: {
              startDate: answer?.startDate,
              endDate: answer?.endDate
            }
          }));
        }
        break;
      case 'numberRange':
        if (answer?.startNumber || answer?.endNumber) {
          setFormData(prev => ({
            ...prev,
            numberRange: {
              startNumber: answer?.startNumber,
              endNumber: answer?.endNumber
            }
          }));
        }
        break;
      case 'typeaheadSearch':
        if (answer) {
          setFormData(prev => ({
            ...prev,
            affiliationData: {
              affiliationId: answer.affiliationId,
              affiliationName: answer.affiliationName
            },
            otherField: answer.isOther,
            otherAffiliationName: answer.affiliationName
          }));
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
        return { answer: formData.textAreaContent };

      case 'text':
        return { answer: formData.textValue };

      case 'radioButtons':
        return { answer: formData.selectedRadioValue };

      case 'checkBoxes':
        return { answer: formData.selectedCheckboxValues };

      case 'selectBox':
        if (questionType === 'selectBox' && (parsed && parsed.type === 'selectBox')) {
          if (parsed?.attributes?.multiple === true) {
            return { answer: Array.from(formData.selectedMultiSelectValues) }; // this is for multiSelect
          }
          return { answer: formData.selectedSelectValue };
        }

      case 'boolean':
        return { answer: formData.yesNoValue };

      case 'email':
        return { answer: formData.emailValue };

      case 'url':
        return { answer: formData.urlValue };

      case 'number':
        return { answer: formData.numberValue };

      case 'currency':
        return { answer: formData.inputCurrencyValue };

      case 'dateRange':
      case 'date': {
        return {
          answer: {
            startDate: formData.dateRange.startDate?.toString() ?? null,
            endDate: formData.dateRange.endDate?.toString() ?? null
          }
        };
      }

      case 'numberRange':
        return {
          answer: {
            startNumber: formData.numberRange.startNumber,
            endNumber: formData.numberRange.endNumber
          }
        };

      case 'typeaheadSearch':
        return {
          answer: {
            affiliationId: formData.affiliationData.affiliationId,
            affiliationName: formData.otherField ? formData.otherAffiliationName : formData.affiliationData.affiliationName,
            isOther: formData.otherField,
          }
        };

      default:
        return { answer: formData.textAreaContent };
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
    // Check is answer already exists. If so, we want to call an update mutation rather than add
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

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        setIsSubmitting(false);
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


  // Helper function to format the last saved messaging
  const getLastSavedText = () => {

    if (isAutoSaving) {
      return `${Global('buttons.saving')}...`;
    }

    if (!lastSavedAt) {
      return hasUnsavedChanges ? t('messages.unsavedChanges') : '';
    }

    const diffInMinutes = Math.floor(Math.abs(currentTime.getTime() - lastSavedAt.getTime()) / (1000 * 60));

    if (diffInMinutes === 0) {
      return t('messages.savedJustNow');
    } else if (diffInMinutes === 1) {
      return t('messages.lastSavedOneMinuteAgo');
    } else {
      return t('messages.lastSaves', { minutes: diffInMinutes });
    }
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

      // Make sure to redirect to 404 if section does not belong to plan
      // if (!sectionBelongsToPlan) {
      //   router.push('/not-found')
      // }

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

  //Wait for answerData and questionType, then prefill the question with existing answer
  useEffect(() => {
    const json = answerData?.answerByVersionedQuestionId?.json;
    if (json && questionType) {
      const parsed = JSON.parse(json);
      if (parsed?.answer !== undefined) {
        prefillAnswer(parsed.answer, questionType);
      }
    }
  }, [answerData, questionType]);


  // Auto-save logic
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (!versionedQuestionId || !versionedSectionId || !question) return;

    // Set a timeout to auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const { success } = await addAnswer(true);
      if (success) {
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [formData, versionedQuestionId, versionedSectionId, question, hasUnsavedChanges]);



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
        e.returnValue = ''; // This is required for some browsers to show the confirmation dialog
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

  // Set up an interval to update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60 * 1000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Render the question using the useRenderQuestionField helper
  const questionField = useRenderQuestionField({
    questionType,
    parsed,
    textFieldProps: {
      textValue: typeof formData.textValue === 'string' ? formData.textValue : '',
      handleTextChange,
    },
    textAreaProps: {
      content: formData.textAreaContent,
      setContent: buildSetContent('textAreaContent', setFormData),
      handleTextAreaChange
    },
    radioProps: {
      selectedRadioValue: formData.selectedRadioValue,
      handleRadioChange
    },
    checkBoxProps: {
      selectedCheckboxValues: formData.selectedCheckboxValues,
      handleCheckboxGroupChange,
    },
    selectBoxProps: {
      selectedSelectValue: formData.selectedSelectValue,
      setSelectedSelectValue: buildSetContent('selectedSelectValue', setFormData),
      handleSelectChange
    },
    multiSelectBoxProps: {
      selectedMultiSelectValues: formData.selectedMultiSelectValues,
      handleMultiSelectChange,
    },
    dateProps: {
      dateRange: formData.dateRange,
      handleDateChange,
    },
    dateRangeProps: {
      dateRange: formData.dateRange,
      handleDateChange,
    },
    numberProps: {
      numberValue: formData.numberValue,
      handleNumberChange
    },
    numberRangeProps: {
      numberRange: formData.numberRange,
      handleNumberRangeChange,
    },
    currencyProps: {
      inputCurrencyValue: formData.inputCurrencyValue,
      handleCurrencyChange
    },
    urlProps: {
      urlValue: formData.urlValue,
      handleUrlChange,
    },
    emailProps: {
      emailValue: formData.emailValue,
      handleEmailChange,
    },
    booleanProps: {
      yesNoValue: formData.yesNoValue,
      handleBooleanChange,
    },
    typeaheadSearchProps: {
      affiliationData: formData.affiliationData,
      otherAffiliationName: formData.otherAffiliationName,
      otherField: formData.otherField,
      setOtherField: buildSetContent('otherField', setFormData),
      handleAffiliationChange,
      handleOtherAffiliationChange,
    },
  });

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
                    aria-disabled={isSubmitting}
                  >
                    {isSubmitting ? Global('buttons.saving') : Global('buttons.save')}
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
