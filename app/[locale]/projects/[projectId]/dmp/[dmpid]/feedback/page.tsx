'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Link
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel,
} from "@/components/Container";
import ExpandableContentSection from '@/components/ExpandableContentSection';
import { FormTextArea } from '@/components/Form';
import { routePath } from '@/utils/routes';
import styles from './ProjectsProjectPlanFeedback.module.scss';

const ProjectsProjectPlanFeedback = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const dmpId = params.dmpid as string;
  
  // State management
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState('');
  
  // Refs for accessibility
  const successMessageRef = React.useRef<HTMLSpanElement>(null);
  
  // Translations
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectPlanFeedback');
  
  const handleRequestFeedback = async () => {
    // Handle feedback request submission
    console.log('Requesting feedback from University of California support team');
    console.log('Feedback message:', feedbackMessage);
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Simulate API call delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Add actual API endpoint call here
      // await submitFeedbackRequest({
      //   projectId,
      //   dmpId,
      //   message: feedbackMessage
      // });
      
      // Set submitted state to trigger UI changes
      setIsSubmitted(true);
      
      // Focus on success message for accessibility
      setTimeout(() => {
        successMessageRef.current?.focus();
      }, 100);
      
    } catch (error) {
      console.error('Failed to submit feedback request:', error);
      // Handle error state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.show', { projectId, dmpId })}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-feedback"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <p>
            {t('description')}
          </p>

          {/* TODO: Pull message box content from database */}
          <div className={styles.messageBox}>
            <p><strong>Hello John,</strong></p>
            <p>Your plan <strong>&quot;Coastal Ocean Processes of North Greenland&quot;</strong> will be submitted to University of California Research Data Management and Library Research Support for feedback. Please allow three business days for someone to respond to your request.</p>
            <p>The University of California Research Data Management Office can provide feedback on Data Management and Stewardship submissions of test plans or for classes but will not be reviewed. If you have any questions after submitting your plan, please submit a request to Research Data Management.</p>
            <p>If you have included an University of California service (e.g., high-performance computing, regulated research storage) in your plan, please contact the Research Technology Office by submitting a request to Research Computing Services to ensure those services are available and any costs can be communicated.</p>
            <p>It is recommended that you contact any third-party data repositories outside of University of California to become familiar with their requirements for depositing datasets or potential costs.</p>
            <p>For additional information, visit University of California Research Data Management for more details on project support.</p>
            <p><strong>Thank you,</strong><br />
            University of California Research Data Management Office<br />
            University of California Library Open Science and Scholarly Communication<br />
            University of California</p>
                  </div>

          <div className={styles.feedbackForm}>
            {!isSubmitted && (
              <FormTextArea
                name="feedback-message"
                label={t('form.label')}
                placeholder={t('form.placeholder')}
                value={feedbackMessage}
                onChange={setFeedbackMessage}
                richText={false}
                className={styles.messageTextarea}
                disabled={isSubmitting}
              />
            )}
            <div className={styles.submitSection}>
              <Button
                onPress={handleRequestFeedback}
                className="react-aria-Button react-aria-Button--primary"
                isDisabled={isSubmitted || isSubmitting}
                aria-describedby={isSubmitted ? "feedback-success" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.loadingSpinner} aria-hidden="true"></span>
                    <span className="sr-only">Submitting feedback request...</span>
                    Submitting...
                  </>
                ) : (
                  t('form.submitButton')
                )}
              </Button>
              {isSubmitted && (
                <span 
                  ref={successMessageRef}
                  id="feedback-success"
                  className={styles.successMessage}
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  {t('form.successMessage')}
                </span>
              )}
            </div>
          </div>

          <section className={styles.teamFeedbackSection}>
            <h2>{t('teamFeedback.title')}</h2>
            <p>{t('teamFeedback.description')}</p>
            <Link 
              href={routePath('projects.collaboration', { projectId })}
                      className="react-aria-Button react-aria-Button--secondary"
            >
              {t('teamFeedback.updateAccessButton')}
            </Link>
          </section>
        </ContentContainer>

        <SidebarPanel>
          {/* TODO: Pull sidebar content from database */}
          <div className={styles.sidebarContent}>
            <ExpandableContentSection
              id="university-support-feedback"
              heading={t('sidebar.universitySupport.title')}
              expandLabel={Global('links.expand')}
              summaryCharLimit={150}
            >
              <p>{t('sidebar.universitySupport.description')}</p>
              
              <p><strong>{t('sidebar.universitySupport.expertsCanTitle')}</strong></p>
              <ul>
                <li>{t('sidebar.universitySupport.expertsCan.0')}</li>
                <li>{t('sidebar.universitySupport.expertsCan.1')}</li>
                <li>{t('sidebar.universitySupport.expertsCan.2')}</li>
              </ul>
              
              <p>{t('sidebar.universitySupport.requestInfo')}</p>
            </ExpandableContentSection>

            <ExpandableContentSection
              id="team-members-feedback"
              heading={t('sidebar.teamMembers.title')}
              expandLabel={Global('links.expand')}
              summaryCharLimit={150}
            >
              <p>{t('sidebar.teamMembers.description')}</p>
              
              <p><strong>{t('sidebar.teamMembers.usefulWhenTitle')}</strong></p>
              <ul>
                <li>{t('sidebar.teamMembers.usefulWhen.0')}</li>
                <li>{t('sidebar.teamMembers.usefulWhen.1')}</li>
                <li>{t('sidebar.teamMembers.usefulWhen.2')}</li>
              </ul>
              
              <p>{t('sidebar.teamMembers.encourageInfo')}</p>
            </ExpandableContentSection>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanFeedback;
