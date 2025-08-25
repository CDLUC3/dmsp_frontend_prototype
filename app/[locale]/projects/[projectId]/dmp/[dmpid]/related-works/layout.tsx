"use client";

import React from "react";

import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Breadcrumb, Breadcrumbs, Button, Link, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useTranslations } from "next-intl";
import styles from "./RelatedWorks.module.scss";

const RelatedWorksLayout = ({
  pending,
  related,
  discarded,
}: {
  pending: React.ReactNode;
  related: React.ReactNode;
  discarded: React.ReactNode;
}) => {
  const t = useTranslations("RelatedWorks");

  return (
    <>
      <PageHeader
        title="Related Works"
        description="Match related works to your research project."
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
              onPress={() => {}}
              className="primary"
              aria-label="Add a related work"
            >
              {t("buttons.addRelatedWorkManually")}
            </Button>
          </>
        }
        className="page-project-related-works"
      />
      <LayoutContainer>
        <ContentContainer className={`layout-content-container-full ${styles.tabWrapper}`}>
          <Tabs>
            <TabList aria-label="View related works">
              <Tab id="pending">{t("tabs.pending")}</Tab>
              <Tab id="related">{t("tabs.related")}</Tab>
              <Tab id="discarded">{t("tabs.discarded")}</Tab>
            </TabList>
            <TabPanel id="pending">{pending}</TabPanel>
            <TabPanel id="related">{related}</TabPanel>
            <TabPanel id="discarded">{discarded}</TabPanel>
          </Tabs>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default RelatedWorksLayout;
