'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Form,
  Link,
  OverlayArrow,
  Popover,
  Tooltip,
  TooltipTrigger
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
  useMeQuery,
  usePlanQuery,
  usePublishedQuestionQuery,
  useAnswerByVersionedQuestionIdQuery,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { Card, } from "@/components/Card/card";
import ErrorMessages from '@/components/ErrorMessages';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';
import { DmpIcon } from "@/components/Icons";
import { useRenderQuestionField } from '@/components/hooks/useRenderQuestionField';
import ExpandableContentSection from '@/components/ExpandableContentSection';
import CommentsDrawer from './CommentsDrawer';

// Context
import { useToast } from '@/context/ToastContext';

// Utils
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
import { stripHtmlTags } from '@/utils/general';
import { QuestionTypeMap } from '@dmptool/types';

import {
  Question,
  MergedComment
} from '@/app/types';

// server action mutations
import {
  addAnswerAction,
  updateAnswerAction,
} from './actions';

//hooks
import { useComments } from './hooks/useComments';

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
  dateValue: string | DateValue | CalendarDate | null;
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
  openFeedbackRounds: boolean;
  feedbackId?: number | null;
  orgId: string;
  collaborators: number[];
  planOwners: number[] | null;
}


const PlanOverviewQuestionPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dmpId = params.dmpid as string;
  const projectId = params.projectId as string;
  const versionedSectionId = params.sid as string;
  const versionedQuestionId = params.qid as string;
  const locale = params.locale as string;
  const toastState = useToast(); // Access the toast state from context
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Ref for scrolling to bottom of comments
  const commentsEndRef = useRef<HTMLDivElement | null>(null);


  // VersionedQuestion, plan and versionedSection states
  const [question, setQuestion] = useState<Question>();
  const [plan, setPlan] = useState<PlanData>();
  const [questionType, setQuestionType] = useState<string>('');
  const [parsed, setParsed] = useState<AnyParsedQuestion>();
  const [answerId, setAnswerId] = useState<number | null>(null);

  const [errors, setErrors] = useState<string[]>([]);

  // Drawer states
  const [isSideBarPanelOpen, setIsSideBarPanelOpen] = useState<boolean>(true);
  const [isSampleTextDrawerOpen, setSampleTextDrawerOpen] = useState<boolean>(false);
  const [isCommentsDrawerOpen, setCommentsDrawerOpen] = useState<boolean>(false);
  const openSampleTextButtonRef = useRef<HTMLButtonElement | null>(null);
  const openCommentsButtonRef = useRef<HTMLButtonElement | null>(null);

  const routeParams = { projectId, dmpId, versionedSectionId, versionedQuestionId };

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
    dateValue: null,
    dateRange: { startDate: '', endDate: '' },
    numberRange: { startNumber: 0, endNumber: 0 },
  });

  // Form state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Localization
  const Global = useTranslations('Global');
  const PlanOverview = useTranslations('PlanOverview');
  const t = useTranslations('PlanOverviewQuestionPage');


  /*GraphQL queries */

  // Run selected question query
  const {
    data: selectedQuestion,
    loading: versionedQuestionLoading,
    error: versionedQuestionError
  } = usePublishedQuestionQuery(
    {
      variables: {
        versionedQuestionId: Number(versionedQuestionId)
      }
    }
  );

  // Run me query to get user's name
  const { data: me } = useMeQuery();

  // Get Plan using planId
  const { data: planData, loading: planQueryLoading, error: planQueryError } = usePlanQuery(
    {
      variables: { planId: Number(dmpId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Get answer data
  const { data: answerData, loading: answerLoading, error: answerError } = useAnswerByVersionedQuestionIdQuery(
    {
      variables: {
        projectId: Number(projectId),
        planId: Number(dmpId),
        versionedQuestionId: Number(versionedQuestionId)
      },
      notifyOnNetworkStatusChange: true
    }
  );

  // Comments state and handlers hook
  const {
    // State
    mergedComments,
    editingCommentId,
    editingCommentText,
    canAddComments,
    errors: commentErrors,

    // Setters
    setEditingCommentText,
    setCommentsFromData,
    updateCanAddComments,

    // Handlers
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    handleUpdateComment,
    handleCancelEdit
  } = useComments({
    dmpId,
    planFeedbackId: plan?.feedbackId,
    me,
    planOrgId: plan?.orgId,
    openFeedbackRounds: plan?.openFeedbackRounds,
    planOwners: plan?.planOwners,
    collaborators: plan?.collaborators
  });

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
      toastState.add(t('messages.sampleTextAdded'), { type: 'success', timeout: 3000 });
    }
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

  const updateCommentHandler = async (comment: MergedComment) => {
    handleUpdateComment(comment);
    // Keep drawer open so the user can see that they comment changed
    setCommentsDrawerOpen(true);
  }


  const addCommentHandler = async (e: React.FormEvent<HTMLFormElement>, newComment: string) => {
    e.preventDefault();
    handleAddComment(e, answerId!, newComment);
  }

  // Handling changes to different question types
  const handleAffiliationChange = async (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      affiliationData: {
        affiliationName: value,
        affiliationId: id
      }
    }));
    setHasUnsavedChanges(true);
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      otherAffiliationName: value
    }));
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

  // Handler for date change
  const handleDateChange = (
    value: string | DateValue | CalendarDate | null
  ) => {
    setFormData(prev => ({
      ...prev,
      dateValue: value
    }));
    setHasUnsavedChanges(true);
  };

  // Handler for date range changes
  const handleDateRangeChange = (
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
    router.push(routePath('projects.dmp.versionedSection', { projectId, dmpId, versionedSectionId }))
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
        setFormData(prev => ({
          ...prev,
          selectedSelectValue: answer
        }));
        break;
      case 'multiselectBox':
        setFormData(prev => ({
          ...prev,
          selectedMultiSelectValues: new Set(answer)
        }));
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
        setFormData(prev => ({
          ...prev,
          dateValue: answer
        }));
        break;
      case 'dateRange':
        if (answer?.start || answer?.end) {
          setFormData(prev => ({
            ...prev,
            dateRange: {
              startDate: answer?.start,
              endDate: answer?.end
            }
          }));
        }
        break;
      case 'numberRange':
        if (answer?.start || answer?.end) {
          setFormData(prev => ({
            ...prev,
            numberRange: {
              startNumber: answer?.start,
              endNumber: answer?.end
            }
          }));
        }
        break;
      case 'affiliationSearch':
        if (answer) {
          setFormData(prev => ({
            ...prev,
            affiliationData: {
              affiliationId: answer.affiliationId,
              affiliationName: answer.affiliationName
            },
            otherField: answer.isOther,
            otherAffiliationName: ''
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
        return {
          type: 'textArea',
          answer: formData.textAreaContent
        };

      case 'text':
        return {
          type: 'text',
          answer: formData.textValue
        };

      case 'radioButtons':
        return {
          type: 'radioButtons',
          answer: formData.selectedRadioValue
        };

      case 'checkBoxes':
        return {
          type: 'checkBoxes',
          answer: formData.selectedCheckboxValues
        };

      case 'selectBox':
        return {
          type: 'selectBox',
          answer: formData.selectedSelectValue
        };

      case 'multiselectBox':
        return {
          type: 'multiselectBox',
          answer: Array.from(formData.selectedMultiSelectValues)
        };

      case 'boolean':
        return {
          type: 'boolean',
          answer: formData.yesNoValue
        };

      case 'email':
        return {
          type: 'email',
          answer: formData.emailValue
        };

      case 'url':
        return {
          type: 'url',
          answer: formData.urlValue
        };

      case 'number':
        return {
          type: 'number',
          answer: formData.numberValue
        };

      case 'currency':
        return {
          type: 'currency',
          answer: formData.inputCurrencyValue
        };

      case 'date':
        return {
          type: 'date',
          answer: formData.dateValue?.toString()
        };

      case 'dateRange':
        return {
          type: 'dateRange',
          answer: {
            start: formData.dateRange.startDate?.toString() ?? null,
            end: formData.dateRange.endDate?.toString() ?? null
          }
        };

      case 'numberRange':
        return {
          type: 'numberRange',
          answer: {
            start: formData.numberRange.startNumber,
            end: formData.numberRange.endNumber
          }
        };

      case 'affiliationSearch':
        return {
          type: 'affiliationSearch',
          answer: {
            affiliationId: formData.affiliationData.affiliationId,
            affiliationName: formData.otherField ? formData.otherAffiliationName : formData.affiliationData.affiliationName,
          }
        };

      default:
        return {
          type: questionType,
          answer: formData.textAreaContent
        };
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
  const addAnswer = async () => {
    const jsonPayload = getAnswerJson();
    // Check is answer already exists. If so, we want to call an update mutation rather than add
    const isUpdate = Boolean(answerData?.answerByVersionedQuestionId);

    if (selectedQuestion) {
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
            path: routePath('projects.dmp.versionedQuestion.detail', { projectId, dmpId, versionedSectionId, versionedQuestionId })
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

  // Handle submit of question detail form
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors([]); // Clear previous errors

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

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
        setHasUnsavedChanges(false);
        // Show user a success message and redirect back to the Section page
        showSuccessToast();
        router.push(routePath('projects.dmp.versionedSection', { projectId, dmpId, versionedSectionId }))

      }
    }
  };

  // Get parsed JSON from question, and set parsed, question and questionType in state
  useEffect(() => {
    if (selectedQuestion) {
      const q = selectedQuestion.publishedQuestion;
      const cleanedQuestion = {
        ...q,
        required: q?.required ?? undefined // convert null to undefined
      };

      try {
        const { parsed, error } = getParsedQuestionJSON(cleanedQuestion, routePath('projects.dmp.versionedQuestion.detail', routeParams), Global);
        if (!parsed?.type) {
          if (error) {
            logECS('error', 'Parsing error', {
              error: 'Invalid question type in parsed JSON',
              url: { path: routePath('projects.dmp.versionedQuestion.detail', routeParams) }
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
          url: { path: routePath('projects.dmp.versionedQuestion.detail', { projectId, dmpId, versionedSectionId, versionedQuestionId }) }
        });
        setErrors(['Error parsing question data']);
      }
    }
  }, [selectedQuestion]);


  // Set plan data in state
  useEffect(() => {
    if (planData?.plan) {
      // Validate section belongs to plan - 404 if not
      const planSections = planData?.plan?.versionedSections || [];
      const sectionBelongsToPlan = planSections && planSections.some(section => section.versionedSectionId === Number(versionedSectionId));

      // Make sure to redirect to 404 if section does not belong to plan
      if (!sectionBelongsToPlan) {
        router.push('/not-found')
      }

      const planOwners = [
        // Include the original plan creator if it exists
        ...(planData?.plan?.createdById ? [planData.plan.createdById] : []),
        // Include collaborators with role="OWN"
        ...(planData?.plan?.project?.collaborators
          ?.filter(c => c?.accessLevel === "OWN")
          ?.map(c => c?.user?.id)
          ?.filter((id): id is number => id != null) ?? [])
      ];

      // Remove duplicates from planOwners in case the creator is also listed as a collaborator with OWN role
      const uniquePlanOwners = [...new Set(planOwners)];

      const planInfo = {
        funder: planData?.plan?.project?.fundings?.[0]?.affiliation?.displayName ?? '',
        funderName: planData?.plan?.project?.fundings?.[0]?.affiliation?.name ?? '',
        title: planData?.plan?.project?.title ?? '',
        openFeedbackRounds: planData?.plan?.feedback?.some(f => f.completed == null) ?? false, // If any of the feedback rounds have not yet been completed
        feedbackId: planData?.plan?.feedback?.find(item => item.completed === null)?.id, //Get first feedback id where it has not yet been completed
        orgId: planData?.plan?.versionedTemplate?.owner?.uri ?? '', //affiliation id for plan
        collaborators: planData?.plan?.project?.collaborators
          ?.map(c => c?.user?.id)
          .filter((id): id is number => id != null) ?? [], //filter out any null or undefined for projectCollaborators
        planOwners: uniquePlanOwners ?? null, //plan owner
      }

      setPlan(planInfo);
    };
  }, [planData]);


  useEffect(() => {
    //Wait for answerData and questionType, then prefill the question with existing answer
    const json = answerData?.answerByVersionedQuestionId?.json;
    if (json && questionType) {
      const parsed = JSON.parse(json);
      if (parsed?.answer !== undefined) {
        prefillAnswer(parsed.answer, questionType);
      }
    }

    // Combine both answerComments and feedbackComments into one, and save in state after ordering
    const answerComments = answerData?.answerByVersionedQuestionId?.comments;
    const feedbackComments = answerData?.answerByVersionedQuestionId?.feedbackComments;

    // Set comments from both answer and feedback comments into mergedComments state
    setCommentsFromData(answerComments, feedbackComments);

    setAnswerId(answerData?.answerByVersionedQuestionId?.id ?? null);

  }, [answerData, questionType]);

  // Warn user of unsaved changes if they try to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome/Firefox to show the confirm dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    // Set whether current user can add comments based on their role and plan data
    updateCanAddComments();
  }, [me, planData, plan])

  // Set errors from commentErrors state
  useEffect(() => {
    setErrors((prevErrors) => [...prevErrors, ...commentErrors]);
  }, [commentErrors])

  // Render the question using the useRenderQuestionField helper
  const questionField = useRenderQuestionField({
    questionType,
    parsed,
    textFieldProps: {
      textValue: typeof formData.textValue === 'string' ? formData.textValue : '',
      handleTextChange,
    },
    textAreaProps: {
      content:
        !formData.textAreaContent &&
          question?.useSampleTextAsDefault &&
          !!question?.sampleText
          ? question.sampleText
          : formData.textAreaContent,
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
      dateValue: formData.dateValue,
      handleDateChange,
    },
    dateRangeProps: {
      dateRange: formData.dateRange,
      handleDateRangeChange,
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

  if (versionedQuestionLoading || planQueryLoading || answerLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (versionedQuestionError || planQueryError || answerError) {
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
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.show', { projectId, dmpId })}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.versionedSection', { projectId, dmpId, versionedSectionId })}>{Global('breadcrumbs.sectionOverview')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.questionDetails')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutWithPanel>
        <ContentContainer>
          <div className="container">
            {/**Requirements by funder */}
            {question?.requirementText && (
              <section aria-label={PlanOverview('page.requirementsBy', { funder: plan?.funder ?? '' })}>
                <h3 className={"h4"}>{PlanOverview('page.requirementsBy', { funder: plan?.funder ?? '' })}</h3>
                {convertToHTML(question?.requirementText)}
              </section>
            )}

            {/**Requirements by organization */}
            <section aria-label={"Requirements"}>
              {/**TODO: need to get this data from backend */}
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
                  {stripHtmlTags(question?.questionText)}
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
                    {/**Only include sample text button for textArea question types and if sampleText is not empty */}
                    {(questionType === 'textArea' && question?.sampleText) && (
                      <Button
                        ref={openSampleTextButtonRef}
                        className="tertiary small"
                        data-secondary
                        onPress={toggleSampleTextDrawer}
                      >
                        {PlanOverview('page.viewSampleAnswer')}
                      </Button>
                    )}

                    {/**Only show active comment button if an answer exists, otherwise show a disabled button with message */}
                    {answerId ? (
                      <Button
                        ref={openCommentsButtonRef}
                        className={styles.buttonSmall}
                        onPress={toggleCommentsDrawer}
                      >
                        {t('buttons.commentWithNumber', { number: mergedComments.length })}
                      </Button>
                    ) : (
                      <TooltipTrigger delay={0}>
                        <Button
                          ref={openCommentsButtonRef}
                          className={styles.buttonSmallDisabled}
                        >
                          {t('buttons.commentWithNumber', { number: mergedComments.length })}
                        </Button>
                        <Tooltip
                          placement="bottom"
                          className={`${styles.tooltip} py-2 px-2`}
                        >
                          {PlanOverview('page.commentTooltip')}
                        </Tooltip>
                      </TooltipTrigger>
                    )}

                  </div>
                  {parsed && questionField}

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

          <div className={styles.headerWithLogo}>
            <h2 className="h4">{Global('bestPractice')}</h2>
            <Image
              className={styles.Logo}
              src="/images/DMP-logo.svg"
              width="140"
              height="16"
              alt="DMP Tool"
            />
          </div>


          <ExpandableContentSection
            id="data-description"
            heading={Global('dataDescription')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}
          >
            <p>
              Give a summary of the data you will collect or create, noting the content, coverage and data type, e.g., tabular data, survey data, experimental measurements, models, software, audiovisual data, physical samples, etc.
            </p>
            <p>
              Consider how your data could complement and integrate with existing data, or whether there are any existing data or methods that you could reuse.
            </p>
            <p>
              Indicate which data are of long-term value and should be shared and/or preserved.

            </p>
            <p>
              If purchasing or reusing existing data, explain how issues such as copyright and IPR have been addressed. You should aim to minimize any restrictions on the reuse (and subsequent sharing) of third-party data.

            </p>

          </ExpandableContentSection>

          <ExpandableContentSection
            id="data-format"
            heading={Global('dataFormat')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}

          >
            <p>
              Clearly note what format(s) your data will be in, e.g., plain text (.txt), comma-separated values (.csv), geo-referenced TIFF (.tif, .tfw).
            </p>

          </ExpandableContentSection>

          <ExpandableContentSection
            id="data-volume"
            heading={Global('dataVolume')}
            expandLabel={Global('links.expand')}
            summaryCharLimit={200}
          >
            <p>
              Note what volume of data you will create in MB/GB/TB. Indicate the proportions of raw data, processed data, and other secondary outputs (e.g., reports).
            </p>
            <p>
              Consider the implications of data volumes in terms of storage, access, and preservation. Do you need to include additional costs?
            </p>
            <p>
              Consider whether the scale of the data will pose challenges when sharing or transferring data between sites; if so, how will you address these challenges?
            </p>
          </ExpandableContentSection>
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
                <Button className="small" onPress={() => handleUseAnswer(question?.sampleText)}>{PlanOverview('buttons.useAnswer')}</Button>
              </div>
            </DrawerPanel>
          )
        }


        {/**Comments drawer */}
        <CommentsDrawer
          isCommentsDrawerOpen={isCommentsDrawerOpen}
          closeCurrentDrawer={closeCurrentDrawer}
          openCommentsButtonRef={openCommentsButtonRef}
          mergedComments={mergedComments}
          editingCommentId={editingCommentId}
          editingCommentText={editingCommentText}
          setEditingCommentText={setEditingCommentText}
          handleUpdateComment={updateCommentHandler}
          handleAddComment={addCommentHandler}
          handleCancelEdit={handleCancelEdit}
          handleEditComment={handleEditComment}
          handleDeleteComment={handleDeleteComment}
          me={me}
          planOwners={plan?.planOwners}
          locale={locale}
          commentsEndRef={commentsEndRef}
          canAddComments={canAddComments}
        />


      </LayoutWithPanel >
    </>
  );
}

export default PlanOverviewQuestionPage;