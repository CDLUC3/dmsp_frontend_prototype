'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Dialog,
  DialogTrigger,
  Form,
  Link,
  Modal,
  ModalOverlay,
} from "react-aria-components";

// GraphQL
import {
  AddQuestionCustomizationDocument,
  UpdateQuestionCustomizationDocument,
  RemoveQuestionCustomizationDocument,
  QuestionCustomizationByVersionedQuestionDocument,
  PublishedQuestionDocument,
  QuestionCustomizationErrors,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from '@/components/Container';
import FormTextArea from '@/components/Form/FormTextArea';
import ErrorMessages from '@/components/ErrorMessages';
import Loading from '@/components/Loading';
import { SanitizeHTML } from '@/utils/sanitize';
import { DmpIcon } from "@/components/Icons";
import QuestionView from '@/components/QuestionView';
import { Question } from '@/app/types';
// Utils
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { scrollToTop } from '@/utils/general';
import { routePath } from '@/utils/routes';
import { extractErrors } from '@/utils/errorHandler';
import { stripHtmlTags } from '@/utils/general';
import styles from './questionCustomEdit.module.scss';

const QuestionCustomizePage: React.FC = () => {
  const toastState = useToast();
  const params = useParams();
  const router = useRouter();

  const templateCustomizationId = String(params.templateCustomizationId);
  const versionedQuestionId = String(params.versionedQuestionId);

  const hasInitialized = useRef(false);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questionCustomizationId, setQuestionCustomizationId] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [baseQuestion, setBaseQuestion] = useState<Question | undefined>(undefined);


  // Customizable fields
  const [customQuestionData, setCustomQuestionData] = useState({
    guidanceText: '',
    sampleText: '',
  });

  // Read-only base question data
  const [baseQuestionData, setBaseQuestionData] = useState({
    questionText: '',
    requirementText: '',
    guidanceText: '',
    sampleText: '',
  });

  // Localization
  const Global = useTranslations('Global');
  const QuestionCustomize = useTranslations('QuestionCustomize');
  const QuestionEdit = useTranslations('QuestionEdit');
  const PlanOverview = useTranslations('PlanOverview');

  // URLs
  const TEMPLATE_URL = routePath('template.customize', { templateCustomizationId });
  const UPDATE_QUESTION_URL = routePath('template.customize.question', { templateCustomizationId, versionedQuestionId });

  // Mutations
  const [addQuestionCustomization] = useMutation(AddQuestionCustomizationDocument);
  const [updateQuestionCustomization] = useMutation(UpdateQuestionCustomizationDocument);
  const [removeQuestionCustomization] = useMutation(RemoveQuestionCustomizationDocument);

  // Queries
  const { data: publishedQuestion, loading: publishedQuestionLoading } = useQuery(PublishedQuestionDocument, {
    variables: { versionedQuestionId: Number(versionedQuestionId) },
  });

  const { data: questionCustomization, loading: questionCustomizationLoading } = useQuery(
    QuestionCustomizationByVersionedQuestionDocument,
    {
      variables: {
        templateCustomizationId: Number(templateCustomizationId),
        versionedQuestionId: Number(versionedQuestionId),
      },
    }
  );

  console.log("***QuestionCustomization data: ", questionCustomization);

  const updateCustomQuestionContent = (key: string, value: string | boolean) => {
    setCustomQuestionData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (): Promise<[Record<string, string | null | undefined>, boolean]> => {
    try {
      const response = await updateQuestionCustomization({
        variables: {
          input: {
            questionCustomizationId: Number(questionCustomizationId),
            guidanceText: customQuestionData.guidanceText,
            sampleText: customQuestionData.sampleText,
          },
        },
      });

      const responseErrors = response.data?.updateQuestionCustomization?.errors;
      if (responseErrors && Object.values(responseErrors).some(err => err && err !== 'QuestionCustomizationErrors')) {
        return [responseErrors, false];
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateQuestionCustomization', {
        error,
        url: { path: UPDATE_QUESTION_URL },
      });
      setErrorMessages(prev => [...prev, QuestionCustomize('messages.error.errorUpdatingCustomization')]);
      return [{}, false];
    }
  };

  const handleDeleteQuestionCustomization = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setErrorMessages([]);

    try {
      const response = await removeQuestionCustomization({
        variables: { questionCustomizationId: Number(questionCustomizationId) },
      });

      const responseErrors = response.data?.removeQuestionCustomization?.errors;
      if (responseErrors && Object.keys(responseErrors).length > 0) {
        const errs = extractErrors<QuestionCustomizationErrors>(responseErrors, ['general', 'guidanceText', 'sampleText']);
        if (errs.length > 0) {
          setErrorMessages(errs);
          return;
        }
      }

      toastState.add(QuestionCustomize('messages.success.successfullyDeletedCustomization'), { type: 'success' });
      setIsRedirecting(true);
      router.push(TEMPLATE_URL);
    } catch (error) {
      logECS('error', 'deleteQuestionCustomization', {
        error,
        url: { path: UPDATE_QUESTION_URL },
      });
      setErrorMessages([QuestionCustomize('messages.error.errorDeletingCustomization')]);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessages([]);

    const [errors, success] = await handleSave();

    if (!success) {
      setErrorMessages([errors?.general ?? QuestionCustomize('messages.error.errorUpdatingCustomization')]);
      setIsSubmitting(false);
    } else {
      setHasUnsavedChanges(false);
      toastState.add(QuestionCustomize('messages.success.successfullyUpdatedCustomization'), { type: 'success' });
      setIsRedirecting(true);
      router.push(TEMPLATE_URL);
    }
  };

  // Load base question data from published question query
  useEffect(() => {
    if (publishedQuestion?.publishedQuestion) {
      const q = publishedQuestion.publishedQuestion;
      setBaseQuestionData({
        questionText: stripHtmlTags(q.questionText ?? ''),
        requirementText: q.requirementText ?? '',
        guidanceText: q.guidanceText ?? '',
        sampleText: q.sampleText ?? '',
      });
    }
  }, [publishedQuestion]);

  // Initialize or load existing customization
  useEffect(() => {
    const initializeCustomization = async () => {
      if (hasInitialized.current || questionCustomizationLoading) return;
      hasInitialized.current = true;

      if (!questionCustomization?.questionCustomizationByVersionedQuestion) {
        // No existing customization — create one
        const response = await addQuestionCustomization({
          variables: {
            input: {
              templateCustomizationId: Number(templateCustomizationId),
              versionedQuestionId: Number(versionedQuestionId),
            },
          },
        });
        setQuestionCustomizationId(response.data?.addQuestionCustomization?.id ?? null);
      } else {
        const existing = questionCustomization.questionCustomizationByVersionedQuestion;
        setQuestionCustomizationId(existing.id ?? null);
        setCustomQuestionData({
          guidanceText: existing.guidanceText ?? '',
          sampleText: existing.sampleText ?? '',
        });
      }
    };

    initializeCustomization();
  }, [questionCustomizationLoading, questionCustomization]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Scroll errors into view
  useEffect(() => {
    if (errorMessages.length > 0) scrollToTop(errorRef);
  }, [errorMessages]);

  useEffect(() => {
    if (publishedQuestion?.publishedQuestion) {
      const q = publishedQuestion.publishedQuestion;
      // Map to the Question type QuestionView expects
      setBaseQuestion({
        questionText: q.questionText ?? '',
        requirementText: q.requirementText ?? null,
        guidanceText: q.guidanceText ?? null,
        sampleText: q.sampleText ?? null,
        useSampleTextAsDefault: q.useSampleTextAsDefault ?? false,
        required: q.required ?? false,
        json: q.json ?? '',
      });
    }
  }, [publishedQuestion]);


  if (publishedQuestionLoading) return <Loading />;
  if (isRedirecting) return <Loading />;

  return (
    <>
      <PageHeader
        title={QuestionCustomize('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.customizations')}>{Global('breadcrumbs.templateCustomizations')}</Link></Breadcrumb>
            <Breadcrumb><Link href={TEMPLATE_URL}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{QuestionCustomize('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container" ref={topRef}>
            <div className="main-content">
              <ErrorMessages errors={errorMessages} ref={errorRef} />

              <Form onSubmit={handleFormSubmit}>
                {baseQuestionData.requirementText && (
                  <div className="field-display">
                    <h2>{QuestionCustomize('labels.requirements')}</h2>
                    <SanitizeHTML html={baseQuestionData.requirementText} />
                  </div>
                )}

                {baseQuestionData.guidanceText && (
                  <div className="field-display">
                    <h2>{QuestionCustomize('labels.guidance')}</h2>
                    <SanitizeHTML html={baseQuestionData.guidanceText} />
                  </div>
                )}

                {baseQuestionData.sampleText && (
                  <div className="field-display">
                    <h2>{QuestionCustomize('labels.sampleText')}</h2>
                    <SanitizeHTML html={baseQuestionData.sampleText} />
                  </div>
                )}

                {baseQuestion && (
                  <div className={styles.baseQuestionPreview}>
                    <div className={styles.baseQuestionView} inert>
                      <QuestionView
                        isPreview={true}
                        question={baseQuestion}
                        path={routePath('template.customize', { templateCustomizationId })}
                        cardOnly={true}
                      />
                    </div>
                  </div>
                )}



                {/* Editable customization fields */}
                <div className={styles.additionalGuidance}>
                  <FormTextArea
                    name="guidanceText"
                    isRequired={false}
                    richText={true}
                    label={QuestionCustomize('labels.additionalGuidanceText')}
                    helpMessage={QuestionCustomize('helpText.additionalGuidanceText')}
                    value={customQuestionData.guidanceText}
                    onChange={(value) => updateCustomQuestionContent('guidanceText', value)}
                  />
                </div>

                <div className={styles.additionalSampleText}>
                  <FormTextArea
                    name="sampleText"
                    isRequired={false}
                    richText={true}
                    label={QuestionCustomize('labels.additionalSampleText')}
                    helpMessage={QuestionCustomize('helpText.additionalSampleText')}
                    value={customQuestionData.sampleText}
                    onChange={(value) => updateCustomQuestionContent('sampleText', value)}
                  />

                  {/* <Checkbox
                    isSelected={customQuestionData.useSampleTextAsDefault}
                    onChange={(checked) => updateCustomQuestionContent('useSampleTextAsDefault', checked)}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    {QuestionCustomize('labels.useSampleTextAsDefault')}
                  </Checkbox> */}
                </div>

                <Button type="submit" aria-disabled={isSubmitting}>
                  {isSubmitting ? Global('buttons.saving') : Global('buttons.saveAndUpdate')}
                </Button>
              </Form>

              {/* Delete customization */}
              <div className={styles.deleteQuestionCustomizationContainer}>
                <h3>{QuestionCustomize('buttons.deleteCustomization')}</h3>
                <p className={styles.dangerZoneDescription}><DmpIcon icon="warning" />{QuestionCustomize.rich("descriptions.deleteCustomization", {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}</p>
                <DialogTrigger isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                  <Button className="danger" isDisabled={isDeleting}>
                    {isDeleting
                      ? `${QuestionCustomize('buttons.deletingCustomization')}...`
                      : QuestionCustomize('buttons.deleteCustomization')}
                  </Button>
                  <ModalOverlay>
                    <Modal>
                      <Dialog>
                        {({ close }) => (
                          <>
                            <h3>{QuestionCustomize('heading.deleteCustomization')}</h3>
                            <p className={styles.dangerZoneDescription}>{QuestionCustomize.rich("descriptions.deleteCustomization", {
                              strong: (chunks) => <strong>{chunks}</strong>
                            })}</p>
                            <div className={styles.deleteConfirmButtons}>
                              <Button className="secondary" autoFocus onPress={close}>
                                {Global('buttons.cancel')}
                              </Button>
                              <Button className="danger" onPress={() => { handleDeleteQuestionCustomization(); close(); }}>
                                {Global('buttons.delete')}
                              </Button>
                            </div>
                          </>
                        )}
                      </Dialog>
                    </Modal>
                  </ModalOverlay>
                </DialogTrigger>
              </div>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default QuestionCustomizePage;