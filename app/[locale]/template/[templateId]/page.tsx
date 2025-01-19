// template/[templateId]/section/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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
  Question,
  Section,
  TemplateVersionType,
  TemplateVisibility,
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery,
} from '@/generated/graphql';

// Components
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEdit from "@/components/QuestionEdit";
import PageHeader from "@/components/PageHeader";
import AddQuestionButton from "@/components/AddQuestionButton";
import AddSectionButton from "@/components/AddSectionButton";

import { useFormatDate } from '@/hooks/useFormatDate';
import logECS from '@/utils/clientLogger';
import styles from './templateEditPage.module.scss';

interface QuestionsInterface {
  errors?: string[] | null;
  displayOrder?: number | null;
  guidanceText?: string | null;
  id?: number | null;
  questionText: string | null | undefined;
}

interface SectionInterface {
  id?: number | null;
  name: string;
  displayOrder?: number | null;
  questions?: QuestionsInterface[] | null;
}

interface OwnerInterface {
  displayName: string;
  id: number;
}
interface TemplateEditPageInterface {
  name: string;
  description?: string | null;
  errors?: string[] | null;
  latestPublishVersion?: string | null;
  latestPublishDate?: string | null;
  created?: string | null;
  sections?: SectionInterface[] | null;
  owner: OwnerInterface
}


const TemplateEditPage: React.FC = () => {
  let [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [template, setTemplate] = useState<TemplateEditPageInterface>({
    name: '',
    description: null,
    errors: null,
    latestPublishVersion: null,
    latestPublishDate: null,
    created: null,
    sections: [],
    owner: { displayName: '', id: 0 },
  });

  // Errors returned from request
  const [errors, setErrors] = useState<string[]>([]);
  const [pageErrors, setPageErrors] = useState<string[]>([]);
  const formatDate = useFormatDate();

  // localization keys
  const BreadCrumbs = useTranslations('Breadcrumbs');
  const EditTemplate = useTranslations('EditTemplates');
  const PublishTemplate = useTranslations('PublishTemplate');
  const Messaging = useTranslations('Messaging');

  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId
  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling up to page level error
  const pageErrorRef = useRef<HTMLDivElement | null>(null);

  // Initialize publish mutation
  const [createTemplateVersionMutation] = useCreateTemplateVersionMutation();
  const [archiveTemplateMutation] = useArchiveTemplateMutation();

  // Run template query to get all templates under the given templateId
  const { data, loading } = useTemplateQuery({
    variables: { templateId: templateId ? Number(templateId) : 0 },
    notifyOnNetworkStatusChange: true,
  });

  // Archive current template
  const handleArchiveTemplate = async () => {
    try {
      await archiveTemplateMutation({
        variables: {
          templateId: Number(templateId),
        },
      })
    } catch (err) {
      setPageErrors(prevErrors => [...prevErrors, EditTemplate('errors.archiveTemplateError')]);
      logECS('error', 'handleArchiveTemplate', {
        error: err,
        url: { path: '/template/[templateId]' }
      });
    };
  }

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveTemplate = async (versionType: TemplateVersionType, comment: string | undefined, visibility: TemplateVisibility) => {
    try {
      const response = await createTemplateVersionMutation({
        variables: {
          templateId: Number(templateId),
          comment: (comment && comment.length > 0) ? comment : null,
          versionType: versionType,
          visibility: visibility
        },
      })

      if (response) {
        setPublishModalOpen(false);
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        //close modal
        setPublishModalOpen(false);
      } else {
        setErrors(prevErrors => [...prevErrors, EditTemplate('errors.saveTemplateError')]);
        logECS('error', 'saveTemplate', {
          error: err,
          url: { path: '/template/[templateId]' }
        });
      };
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const visibility = formData.get('visibility')?.toString().toUpperCase() as TemplateVisibility;
    const changeLog = formData.get('change_log')?.toString(); // Extract the textarea value

    await saveTemplate(TemplateVersionType.Published, changeLog, visibility)
  };

  useEffect(() => {
    // When data from backend changes, set template data in state
    if (data && data.template) {
      setTemplate({
        name: data.template.name ?? '',
        description: data.template.description ?? null,
        errors: data.template.errors ?? null,
        latestPublishVersion: data.template.latestPublishVersion ?? null,
        latestPublishDate: formatDate(data.template.latestPublishDate) ?? null,
        created: data.template.created ?? null,
        sections: data.template.sections
          ?.filter((section): section is Section => section !== null) // Filter out null
          .map((section) => ({
            id: section.id,
            name: section.name ?? '',
            displayOrder: section.displayOrder,
            questions: section.questions
              ?.filter((question): question is Question => question !== null) //Filter out null
              ?.map((question) => ({
                errors: question.errors,
                displayOrder: question.displayOrder,
                guidanceText: question.guidanceText,
                id: question.id,
                questionText: question.questionText,
              })),
          })),
        owner: {
          displayName: data.template.owner?.displayName ?? '',
          id: data.template.owner?.id ?? 0,
        },
      });
    }
  }, [data]);

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  // If page-level errors that we need to scroll to
  useEffect(() => {
    if (pageErrors.length > 0 && pageErrorRef.current) {
      pageErrorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [pageErrors]);

  // Show loading message
  if (loading) {
    return <div>{Messaging('loading')}...</div>;
  }

  return (
    <div>

      <PageHeader
        title={template?.name ? template?.name : 'Template'}
        description={`by ${template?.name} - Version: ${template?.latestPublishVersion} - Published: ${template?.latestPublishDate}`}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{BreadCrumbs('home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{BreadCrumbs('templates')}</Link></Breadcrumb>
            <Breadcrumb>{template?.name}</Breadcrumb>
          </Breadcrumbs>
        }

        className="page-template-overview"
      />

      {pageErrors && pageErrors.length > 0 &&
        <div className="error" role="alert" aria-live="assertive" ref={pageErrorRef}>
          {pageErrors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>}
      <h2>{EditTemplate('title')}</h2>

      <div className="template-editor-container">
        <div className="main-content">

          {(template?.sections && template?.sections.length > 0) && (
            <div className="">
              {template.sections.map((section, index) => (
                <div key={section.id} role="list" aria-label="Questions list"
                  style={{ marginBottom: '40px' }}>

                  <SectionHeaderEdit
                    key={section.id}
                    sectionNumber={index + 1}
                    title={section.name}
                    editUrl={`/template/${templateId}/section/${section.id}`}
                    onMoveUp={() => null}
                    onMoveDown={() => null}
                  />

                  {(section?.questions && section?.questions.length > 0) && (
                    section.questions.map((question) => (
                      <QuestionEdit
                        key={question.id}
                        id={question.id ? question.id.toString() : ''}
                        text={question?.questionText ? question.questionText : ''}
                        link={`/template/${templateId}/q/${question.id}`}
                      />
                    ))
                  )}
                  <AddQuestionButton
                    href={`/template/${templateId}/q/new?section_id=${section.id}`}
                  />
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


      <Modal isDismissable
        isOpen={isPublishModalOpen}
        data-testid="modal"
      >
        <Dialog>
          <div ref={errorRef}>
            <Form onSubmit={e => handleSubmit(e)} data-testid="publishForm">

              {errors && errors.length > 0 &&
                <div className="error" role="alert" aria-live="assertive">
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              }
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
}

export default TemplateEditPage;

