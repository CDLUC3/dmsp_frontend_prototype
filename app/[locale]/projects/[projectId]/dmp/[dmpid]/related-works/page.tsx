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

const RelatedWorksPage = () => {
  const t = useTranslations("RelatedWorksPage");

  // Get planId (dmpId) from route /projects/:projectId/dmp/:dmpId
  const params = useParams();
  const planId = parseInt(String(params.dmpid));

  return (
    <>
      <PageHeader
        title={t("header.title")}
        description={t("header.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href="/">Home</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/projects">Projects</Link>
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Button
              onPress={() => { }}
              className="primary"
            >
              {t("buttons.addRelatedWorkManually")}
            </Button>
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
