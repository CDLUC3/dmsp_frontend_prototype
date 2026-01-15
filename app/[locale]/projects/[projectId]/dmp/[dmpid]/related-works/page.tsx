"use client";

import React from "react";

import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Breadcrumb, Breadcrumbs, Button, Link, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useTranslations } from "next-intl";
import styles from "./RelatedWorks.module.scss";
import { RelatedWorksList } from "@/components/RelatedWorksList";
import { RelatedWorkStatus } from "@/generated/graphql";
import { useParams } from "next/navigation";
import { routePath } from '@/utils/routes';

const RelatedWorksPage = () => {
  const Global = useTranslations("Global");
  const t = useTranslations("RelatedWorksPage");

  // Get planId (dmpId) from route /projects/:projectId/dmp/:dmpId
  const params = useParams();
  const projectId = parseInt(String(params.projectId));
  const planId = parseInt(String(params.dmpid));

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.show', { projectId, dmpId: planId })}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link
              href={routePath("projects.dmp.relatedWorks.add", { projectId, dmpId: planId })}
              className="button-link button--primary"
            >
              {t("buttons.addRelatedWorkManually")}
            </Link>
          </>
        }
      />
      <LayoutContainer>
        <ContentContainer className={`layout-content-container-full ${styles.tabWrapper}`}>
          <Tabs>
            <TabList aria-label="View related works">
              <Tab id="pending">
                <h2 className="h3 m-0">{t("tabs.pending")}</h2>
              </Tab>
              <Tab id="related">
                <h2 className="h3 m-0">{t("tabs.accepted")}</h2>
              </Tab>
              <Tab id="discarded">
                <h2 className="h3 m-0">{t("tabs.rejected")}</h2>
              </Tab>
            </TabList>
            <TabPanel id="pending">
              <RelatedWorksList
                planId={planId}
                status={RelatedWorkStatus.Pending}
              />
            </TabPanel>
            <TabPanel id="related">
              <RelatedWorksList
                planId={planId}
                status={RelatedWorkStatus.Accepted}
              />
            </TabPanel>
            <TabPanel id="discarded">
              <RelatedWorksList
                planId={planId}
                status={RelatedWorkStatus.Rejected}
              />
            </TabPanel>
          </Tabs>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default RelatedWorksPage;
