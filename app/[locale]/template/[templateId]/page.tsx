'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ApolloError } from "@apollo/client";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  FieldError,
  Form,
  Heading,
  Label,
  Link,
  Modal,
  Radio,
  RadioGroup,
  Text,
  TextArea,
  TextField,
} from 'react-aria-components';

import {
  Section,
  TemplateVersionType,
  TemplateVisibility,
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery,
} from '@/generated/graphql';

// Components
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEditCard from "@/components/QuestionEditCard";
import PageHeaderWithTitleChange from "@/components/PageHeaderWithTitleChange";
import AddQuestionButton from "@/components/AddQuestionButton";
import AddSectionButton from "@/components/AddSectionButton";
import ErrorMessages from '@/components/ErrorMessages';

import { useFormatDate } from '@/hooks/useFormatDate';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/routes';
import { updateTemplateAction } from './actions';
import styles from './templateEditPage.module.scss';
interface TemplateInfoInterface {
  templateId: number | null;
  name: string;
  visibility: TemplateVisibility;
}
const TemplateEditPage: React.FC = () => {
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const toastState = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [pageErrors, setPageErrors] = useState<string[]>([]);
  const [templateInfo, setTemplateInfoState] = useState<TemplateInfoInterface>({
    templateId: null,
    name: '',
    visibility: TemplateVisibility.Private,
  });
  const [newTitle, setNewTitle] = useState('');
  const formatDate = useFormatDate();

  // localization keys
  const BreadCrumbs = useTranslations('Breadcrumbs');
  const EditTemplate = useTranslations('EditTemplates');
  const PublishTemplate = useTranslations('PublishTemplate');
  const Messaging = useTranslations('Messaging');
  const Global = useTranslations('Global');

  // Get templateId param
  const params = useParams();
  const router = useRouter();
  //const { templateId } = params; // From route /template/:templateId
  const templateId = String(params.templateId);

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling up to page level error
  const pageErrorRef = useRef<HTMLDivElement | null>(null);

  // Initialize publish mutation
  const [createTemplateVersionMutation] = useCreateTemplateVersionMutation();
  const [archiveTemplateMutation] = useArchiveTemplateMutation();

  // Run template query to get all templates under the given templateId
  const { data, loading, error: templateQueryErrors, refetch } = useTemplateQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true
    }
  );

  const sortSections = (sections: Section[]) => {
    // Create a new array with the spread operator before sorting
    return [...sections].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  };

  const showSuccessToast = () => {
    const successMessage = Messaging('successfullyUpdated');
    toastState.add(successMessage, { type: 'success' });
  };

  const handleArchiveTemplate = async () => {
    try {
      await archiveTemplateMutation({
        variables: {
          templateId: Number(templateId),
        },
      });
    } catch (err) {
      setPageErrors(prevErrors => [...prevErrors, EditTemplate('errors.archiveTemplateError')]);
      logECS('error', 'handleArchiveTemplate', {
        error: err,
        url: { path: '/template/[templateId]' }
      });
    }
  };

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveTemplate = async (versionType: TemplateVersionType, comment: string | undefined, visibility: TemplateVisibility) => {
    try {
      const response = await createTemplateVersionMutation({
        variables: {
          templateId: Number(templateId),
          comment: (comment && comment.length > 0) ? comment : null,
          versionType,
          visibility
        },
      });

      if (response) {
        const responseErrors = response.data?.createTemplateVersion?.errors;
        // If there is a general error, set it in the pageErrors state
        if (responseErrors?.general) {
          setPageErrors([responseErrors.general]);
        } else {
          setPublishModalOpen(false);
          showSuccessToast();
        }
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        //close modal
        setPublishModalOpen(false);
      } else {
        setErrorMessages(prevErrors => [...prevErrors, EditTemplate('errors.saveTemplateError')]);
        logECS('error', 'saveTemplate', {
          error: err,
          url: { path: '/template/[templateId]' }
        });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as TemplateVisibility;
    const changeLog = formData.get('change_log')?.toString();

    await saveTemplate(TemplateVersionType.Published, changeLog, visibility);
  };

  // Call Server Action updateTemplateAction
  const updateTemplate = async (templateInfo: TemplateInfoInterface) => {
    if (templateInfo.templateId === null) {
      // Handle the case where templateId is null (e.g., log an error or return early)
      logECS('error', 'updateTemplate', {
        error: 'templateId is null',
        url: {
          path: routePath('template.show', { templateId: 'unknown' }),
        },
      });
      return {
        success: false,
        errors: [Global('messaging.somethingWentWrong')],
        data: null,
      };
    }
    try {
      const response = await updateTemplateAction({
        templateId: templateInfo.templateId,
        name: newTitle,
        visibility: templateInfo.visibility,
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
      logECS('error', 'updateTemplate', {
        error,
        url: {
          path: routePath('template.show', { templateId })
        }
      });
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: null
    };
  }

  const handleTitleChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await updateTemplate(templateInfo);

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        setErrorMessages(errors.length > 0 ? errors : [Global('messaging.somethingWentWrong')])
      }
    } else {
      if (
        result.data?.errors &&
        typeof result.data.errors === 'object' &&
        typeof result.data.errors.general === 'string') {
        // Handle errors as an object with general or field-level errors
        setErrorMessages(prev => [...prev, result.data?.errors?.general || Global('messaging.somethingWentWrong')]);
      }
      //Need to refetch plan data to refresh the info that was changed
      await refetch();
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value)
  };

  useEffect(() => {
    if (pageErrors.length > 0 && pageErrorRef.current) {
      pageErrorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [pageErrors]);

  // Need to set this info to update template title
  useEffect(() => {
    if (data?.template) {
      setTemplateInfoState({
        templateId: Number(data.template.id),
        name: data.template.name || '',
        visibility: data.template.visibility || null,
      });
    }
  }, [data]);

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (templateQueryErrors) {
    return <div>{EditTemplate('errors.getTemplatesError')}</div>;
  }

  const template = data?.template;

  if (!template) {
    return <div>{EditTemplate('errors.noTemplateFound')}</div>;
  }

  const sortedSections = template.sections
    ? sortSections(template.sections.filter((section): section is Section => section !== null))
    : [];

  return (
    <div>
      <PageHeaderWithTitleChange
        title={newTitle || template.name}
        description={`by ${template.owner?.displayName} - Version: ${template.latestPublishVersion} - Published: ${formatDate(template.latestPublishDate)}`}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{BreadCrumbs('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{BreadCrumbs('templates')}</Link></Breadcrumb>
            <Breadcrumb>{template.name}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
        handleTitleChange={handleTitleChange}
        handleInputChange={handleInputChange}
        newTitle={newTitle}
      />



      {pageErrors.length > 0 && (
        <div className="error" role="alert" aria-live="assertive" ref={pageErrorRef}>
          {pageErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <h2>{EditTemplate('title')}</h2>

      <div className="template-editor-container">
        <div className="main-content">
          {sortedSections.length > 0 && (
            <div>
              {sortedSections.map((section, index) => (
                <div key={section.id} role="list" aria-label="Questions list" style={{ marginBottom: '40px' }}>
                  <SectionHeaderEdit
                    key={section.id}
                    sectionNumber={index + 1}
                    title={section.name}
                    editUrl={`/template/${templateId}/section/${section.id}`}
                    onMoveUp={() => null}
                    onMoveDown={() => null}
                  />
                  {section.questions?.map((question) => (
                    <QuestionEditCard
                      key={question.id}
                      id={question.id ? question.id.toString() : ''}
                      text={question.questionText || ''}
                      link={`/template/${templateId}/q/${question.id}`}
                    />
                  ))}
                  <AddQuestionButton href={`/template/${templateId}/q/new?section_id=${section.id}`} />
                </div>
              ))}
            </div>
          )}
          <AddSectionButton href={`/template/${templateId}/section/new`} />
        </div>
        <aside className="sidebar">
          <div className="sidebar-inner">
            <h2>{EditTemplate('titleStatus')}</h2>
            <div className="sidebar-section">

              <Button data-secondary className="my-3 secondary"
                onPress={() => saveTemplate(TemplateVersionType.Draft, '', TemplateVisibility.Private)}>
                {EditTemplate('button.saveAsDraft')}
              </Button>

              <Button data-tertiary className="my-3"
                onPress={() => console.log('Preview')}>{EditTemplate('button.previewTemplate')}</Button>

            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-section-title">{EditTemplate('button.publishTemplate')}</h5>
              <div className="status">
                <p>
                  {EditTemplate('draft')} <Link href='#' onPress={() => setPublishModalOpen(true)}>{EditTemplate('links.edit')}</Link>
                </p>
              </div>
            </div>

            <div className="sidebar-section">
              <h5 className="sidebar-section-title">{EditTemplate('heading.visibilitySettings')}</h5>
              <div className="status">
                <p>
                  {EditTemplate('notPublished')}{' '}<Link href='#' onPress={() => setPublishModalOpen(true)}>{EditTemplate('links.edit')}</Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <h5 className="sidebar-section-title">{EditTemplate('heading.feedbackAndCollaboration')}</h5>
              <div className="description">
                <p>
                  {EditTemplate('allowAccess')}
                </p>
                <p>
                  <Link className="learn-more"
                    href={`/template/${templateId}/access`}>
                    {EditTemplate('links.manageAccess')}
                  </Link>
                </p>
              </div>
            </div>


            <div className="sidebar-section">
              <Button
                className="my-3"
                onPress={() => setPublishModalOpen(true)}
              >
                {EditTemplate('button.publishTemplate')}
              </Button>
              <h5 className="sidebar-section-title">{EditTemplate('heading.history')}</h5>
              <p>
                <Link className="learn-more"
                  href={`/template/${templateId}/history`}>
                  {EditTemplate('links.templateHistory')}
                </Link>
              </p>
            </div>


          </div>
        </aside>
      </div>
      <div className="template-archive-container">
        <div className="main-content">
          <h2>
            {EditTemplate('heading.archiveTemplate')}
          </h2>
          <p>
            {EditTemplate('description.archiveTemplate')}
          </p>
          <Form>
            <Button
              className="my-3"
              data-tertiary
              data-testid="archive-template"
              onPress={handleArchiveTemplate}>{EditTemplate('button.archiveTemplate')}
            </Button>
          </Form>
        </div>
      </div>


      <Modal
        isDismissable
        onOpenChange={setPublishModalOpen}
        isOpen={isPublishModalOpen}
        data-testid="modal"
      >
        <Dialog>
          <div>
            <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

              <ErrorMessages errors={errorMessages} ref={errorRef} />
              <Heading slot="title">{PublishTemplate('heading.publish')}</Heading>

              <RadioGroup name="visibility">
                <Label>{PublishTemplate('heading.visibilitySettings')}</Label>
                <Text slot="description" className="help">
                  {PublishTemplate('descPublishedTemplate')}
                </Text>
                <Radio value="public" className={`${styles.radioBtn} react-aria-Radio`}>
                  <div>
                    <span>{PublishTemplate('radioBtn.public')}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate('radioBtn.publicHelpText')}.</p>
                  </div>
                </Radio>
                <Radio value="private" className={`${styles.radioBtn} react-aria-Radio`}>
                  <div>
                    <span>{PublishTemplate('radioBtn.organizationOnly')}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate('radioBtn.orgOnlyHelpText')}</p>
                  </div>
                </Radio>
              </RadioGroup>

              <p>
                <strong>
                  {PublishTemplate('heading.publishingThisTemplate')}
                </strong>
              </p>

              <ul>
                <li>
                  {PublishTemplate('bullet.publishingTemplate')}
                </li>
                <li>
                  {PublishTemplate('bullet.publishingTemplate2')}
                </li>
                <li>
                  {PublishTemplate('bullet.publishingTemplate3')}
                </li>
              </ul>
              <div className="">

                <TextField
                  name="change_log"
                  isRequired
                >
                  <Label>{PublishTemplate('heading.changeLog')}</Label>
                  <Text slot="description" className="help">
                    {PublishTemplate('descChangeLog')}
                  </Text>
                  <TextArea
                    data-testid="changeLog"
                    style={{ height: '100px' }}
                  />
                  <FieldError />
                </TextField>

              </div>


              <div className="modal-actions">
                <div className="">
                  <Button data-secondary onPress={() => setPublishModalOpen(false)}>{PublishTemplate('button.close')}</Button>
                </div>
                <div className="">
                  <Button type="submit">{PublishTemplate('button.saveAndPublish')}</Button>
                </div>
              </div>

            </Form>
          </div>
        </Dialog>
      </Modal>


    </div >
  );
};

export default TemplateEditPage;
