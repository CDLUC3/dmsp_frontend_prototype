// template/[templateId]/section/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
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
  TemplateVersionType,
  TemplateVisibility,
  useCreateTemplateVersionMutation,
  useTemplateQuery
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
  questionText: string;
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
  // Initialize publish mutation
  const [createTemplateVersionMutation] = useCreateTemplateVersionMutation();

  // Run template query to get all templates under the given templateId
  const { data, loading, error: templateQueryErrors, refetch } = useTemplateQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true
    }
  );

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
      console.log("***RESPONSE", response);
      if (response) {
        setPublishModalOpen(false);
      }
    } catch (err) {
      setErrors(prevErrors => [...prevErrors, 'Error when saving template']);
      logECS('error', 'saveTemplate', {
        error: err,
        url: { path: '/template/[templateId]' }
      });
    };
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const visibility = formData.get('visibility') as TemplateVisibility; // Extract the selected radio button value
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
        /*eslint-disable @typescript-eslint/no-explicit-any*/
        sections: data.template.sections?.map((section: any) => ({
          id: section.id ?? null,
          name: section.name ?? '',
          displayOrder: section.displayOrder ?? null,
          /*eslint-disable @typescript-eslint/no-explicit-any*/
          questions: section.questions?.map((question: any) => ({
            errors: question.errors ?? null,
            displayOrder: question.displayOrder ?? null,
            guidanceText: question.guidanceText ?? null,
            id: question.id ?? null,
            questionText: question.questionText ?? null,
          })) ?? null,
        })) ?? null,
        owner: {
          displayName: data.template.owner?.displayName ?? '',
          id: data.template.owner?.id ?? 0,
        },
      });
    }
  }, [data]);

  // Need to refetch on errors to re-render page
  useEffect(() => {
    if (templateQueryErrors) {
      refetch();
    }
  }, [templateQueryErrors]);

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);


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
            <Button className="my-3" data-tertiary
              onPress={() => console.log('Archive')}>{EditTemplate('button.archiveTemplate')}</Button>
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
                <Radio value="PRIVATE" className={`${styles.radioBtn} react-aria-Radio`}>
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

