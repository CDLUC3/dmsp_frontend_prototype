'use client';

import React, {useState} from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  Link,
  Modal,
  Radio,
  RadioGroup
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import styles from './PlanOverviewPage.module.scss';
import {useTranslations} from "next-intl";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";


const PlanOverviewPage: React.FC = () => {
  const t = useTranslations('PlanOverview');
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishingModalOpen, setPublishingModalOpen] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(true);

  const handleOpenPublishModal = () => {
    setIsMarkedComplete(true);
    setPublishModalOpen(false);
    setPublishingModalOpen(true);
  };

  const plan = {
    id: "plan_123",
    template_name: "NSF Polar Programs",
    title: "NSF Polar Programs",
    funder_id: "nsf_1",
    funder_name: "National Science Foundation",
    template_id: "temp_456",
    published_status: "Draft",
    visibility: "Not Published",
    members: [
      {
        fullname: "Frederick Ice",
        role: "PI",
        email: "fred.ice@example.com"
      },
      {
        fullname: "Jennifer Frost",
        role: "Contributor",
        email: "jfrost@example.com"
      }
    ],

    adjust_funder_url: "/en-US/projects/proj_2425/dmp/xxx/funder",
    adjust_members_url: "/en-US/projects/proj_2425/dmp/xxx/members",
    adjust_researchoutputs_url: "/en-US/projects/proj_2425/dmp/xxx/research-outputs",
    download_url: "/en-US/projects/proj_2425/dmp/xxx/download",
    feedback_url: "/en-US/projects/proj_2425/dmp/xxx/feedback",


    research_output_count: 3,
    sections: [
      {
        section_title: "Roles and Responsibilities",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2544",
        id: "sect_1",
        progress: 1
      },
      {
        section_title: "Types of Data",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2545",
        id: "sect_2",
        progress: 1
      },
      {
        section_title: "Data and Metadata formats",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2546",
        id: "sect_3",
        progress: 2
      },
      {
        section_title: "Policies for Access and Sharing",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2547",
        id: "sect_4",
        progress: 1
      },
      {
        section_title: "Policies for reuse and re-distribution",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2548",
        id: "sect_5",
        progress: 0
      },
      {
        section_title: "Plans for archiving and preservation",
        link: "/en-US/projects/proj_2425/dmp/xxx/s/2549",
        id: "sect_6",
        progress: 0
      }
    ],
    doi: "10.12345/example.123",
    last_updated: "2024-04-01",
    created_date: "2023-07-18"
  };


  const handleMarkAsIncomplete = async () => {
      setIsMarkedComplete(false);
  };

  return (
    <>
      <PageHeader
        title={plan.title}
        description={t('page.pageDescription')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs aria-label={t('navigation.navigation')}>
            <Breadcrumb><Link
              href="/">{t('navigation.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{t('navigation.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects/proj_2425/">Project name</Link></Breadcrumb>
            <Breadcrumb>{plan.title}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <div className={"container"}>
            <div className={styles.planOverview}>
              <section className={styles.planOverviewItem}
                aria-labelledby="funder-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="funder-title"
                    className={styles.planOverviewItemTitle}>
                    {t('funder.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {plan.funder_name}
                  </p>
                </div>
                <Link href={plan.adjust_funder_url}
                  aria-label={t('funder.edit')}>
                  {t('funder.edit')}
                </Link>
              </section>

              <section className={styles.planOverviewItem}
                aria-labelledby="members-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="members-title"
                    className={styles.planOverviewItemTitle}>
                    {t('members.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {plan.members.map((member, index) => (
                      <span key={index}>
                        {t('members.info', {
                          name: member.fullname,
                          role: member.role
                        })}
                        {index < plan.members.length - 1 ? '; ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
                <Link href={plan.adjust_members_url}
                  aria-label={t('members.edit')}>
                  {t('members.edit')}
                </Link>
              </section>

              <section className={styles.planOverviewItem}
                aria-labelledby="outputs-title">
                <div className={styles.planOverviewItemContent}>
                  <h2 id="outputs-title"
                    className={styles.planOverviewItemTitle}>
                    {t('outputs.title')}
                  </h2>
                  <p className={styles.planOverviewItemHeading}>
                    {t('outputs.count', { count: plan.research_output_count })}
                  </p>
                </div>
                <Link href={plan.adjust_researchoutputs_url}
                  aria-label={t('outputs.edit')}>
                  {t('outputs.edit')}
                </Link>
              </section>
            </div>


            {plan.sections.map((section) => (
              <section
                key={section.id}
                className={styles.planSectionsList}
                aria-labelledby={`section-title-${section.id}`}
              >
                <div className={styles.planSectionsHeader}>
                  <div className={styles.planSectionsTitle}>
                    <h3 id={`section-title-${section.id}`}>
                      {section.section_title}
                    </h3>
                    <p
                      aria-label={`${section.progress} out of 3 questions answered for ${section.section_title}`}>
                      <span
                        className={styles.progressIndicator}>
                        <svg
                          className={styles.progressIcon}
                          width="18"
                          height="18"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 -960 960 960"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z" />
                        </svg>
                        {t('sections.progress', {
                          current: section.progress,
                          total: 3
                        })} {t('sections.questionsAnswered')}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={section.link}
                    aria-label={t('sections.updateSection', {
                      title: section.section_title
                    })}
                    className={"react-aria-Button react-aria-Button--secondary"}
                  >
                    {t('sections.update')}
                  </Link>
                </div>
              </section>
            ))}


          </div>
        </ContentContainer>

        <SidebarPanel>
          <div className={styles.statusPanel}>
            <div className={styles.statusPanelHeader}>
              <h2>{t('status.title')}</h2>
            </div>
            <div className={styles.statusPanelContent}>
              <div className="mb-5">
                <h3>{t('status.lastUpdated')}</h3>
                <p>{plan.last_updated}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.publishedStatus')}</h3>
                <p>{plan.published_status}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.doi')}</h3>
                <p>{plan.doi || t('status.notPublished')}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.visibilitySettings')}</h3>
                <p>{plan.visibility}</p>
              </div>
              <div className="mb-5">
                <h3>{t('status.download.title')}</h3>
                <p>
                  <Link
                    href={plan.download_url}>{t('status.download.downloadPDF')}</Link>
                </p>
                <p>
                  {t('status.download.draftInfo')} <Link
                    href="#">{t('status.download.learnMore')}</Link>
                </p>
                <Button data-secondary onPress={() => setPublishModalOpen(true)}
                        className="react-aria-Button react-aria-Button--primary">
                  {t('status.download.markComplete')}
                </Button>
              </div>
              <div className="mb-5">
                <h3>{t('status.feedback.title')}</h3>
                <p>{t('status.feedback.description')}</p>
                <p>
                  <Link
                    href={plan.feedback_url}>{t('status.feedback.manageAccess')}</Link>
                </p>
                <button
                  className="react-aria-Button react-aria-Button--secondary">
                  {t('status.feedback.requestFeedback')}
                </button>
              </div>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>


      <Modal isDismissable isOpen={isPublishModalOpen}>
        <Dialog>
          <div>
            {isMarkedComplete ? (
              <>
                <section className={"mb-8"}>
                  <h2>{t('publishModal.markComplete.title')}</h2>
                  <p>
                    {t('publishModal.markComplete.description')}
                  </p>
                  <Button
                    data-tertiary
                    className={"tertiary"}
                    onPress={handleMarkAsIncomplete}
                  >
                    {t('publishModal.markComplete.markIncompleteButton')}
                  </Button>
                </section>
                <section>
                  <h5 className={"mb-1"}>
                    {t('publishModal.markComplete.step1Title')}
                  </h5>
                  <p className={"mt-2 mb-0"}>{t('publishModal.markComplete.step1Description')}</p>
                  <p className={"mt-2 mb-0"}>
                    <Link className={"text-sm"}
                          href={plan.download_url}>{t('status.download.downloadPDF')}</Link>
                  </p>

                  <h5 className={"mb-1"}>{t('publishModal.markComplete.step2Title')}</h5>
                  <p className={"mt-2 mb-0"}>
                    {t('publishModal.markComplete.step2Description')}
                  </p>
                </section>
                <div className="modal-actions">
                  <div className="">
                    <Button data-secondary className={"secondary"} onPress={() => setPublishModalOpen(false)}>
                      {t('publishModal.markComplete.closeButton')}
                    </Button>
                  </div>
                  <div className="">
                    <Button data-primary className={"primary"} onPress={handleOpenPublishModal}>
                      {t('publishModal.markComplete.publishButton')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <section>
                <h2>{t('publishModal.markIncomplete.title')}</h2>
                <p>{t('publishModal.markIncomplete.description')}</p>
                <div className="modal-actions">
                  <Button
                    data-secondary
                    className={"secondary"}
                    onPress={() => setPublishModalOpen(false)}
                  >
                    {t('publishModal.markIncomplete.closeButton')}
                  </Button>
                  <Button
                    data-primary
                    className={"primary"}
                    onPress={() => {
                      setIsMarkedComplete(true);
                      setPublishModalOpen(false);
                    }}
                  >
                    {t('publishModal.markIncomplete.markCompleteButton')}
                  </Button>
                </div>
              </section>
            )}
          </div>
        </Dialog>
      </Modal>

      <Modal isDismissable isOpen={isPublishingModalOpen}>
        <Dialog>
          <div>
            <h2>{t('publishModal.publish.title')}</h2>

            <p>
              {t('publishModal.publish.description1')}
            </p>
            <p>
              {t('publishModal.publish.description2')}
            </p>

            <h3 className="mt-6">{t('publishModal.publish.visibilityTitle')}</h3>
            <p>{t('publishModal.publish.visibilityDescription')}</p>

            <RadioGroup name="visibility" className="my-4">
              <Radio value="public" className={`${styles.radioBtn} react-aria-Radio`}>
                <div>
                  <span className="">{t('publishModal.publish.visibilityOptions.public.label')}</span>
                  <p className="text-sm">
                    {t('publishModal.publish.visibilityOptions.public.description')}
                  </p>
                </div>
              </Radio>

              <Radio value="organization" className={`${styles.radioBtn} react-aria-Radio`}>
                <div>
                  <span className="">{t('publishModal.publish.visibilityOptions.organization.label')}</span>
                  <p className=" text-sm">
                    {t('publishModal.publish.visibilityOptions.organization.description')}
                  </p>
                </div>
              </Radio>

              <Radio value="private" className={`${styles.radioBtn} react-aria-Radio`}>
                <div>
                  <span className="">{t('publishModal.publish.visibilityOptions.private.label')}</span>
                  <p className="text-sm">
                    {t('publishModal.publish.visibilityOptions.private.description')}
                  </p>
                </div>
              </Radio>
            </RadioGroup>

            <div className="modal-actions mt-6">
              <Button
                data-secondary
                className="secondary"
                onPress={() => setPublishingModalOpen(false)}
              >
                {t('publishModal.publish.closeButton')}
              </Button>
              <Button
                data-primary
                className="primary"
                type="button"
                onPress={handleOpenPublishModal}
              >
                {t('publishModal.publish.publishButton')}
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>


    </>
  );
}

export default PlanOverviewPage;
