"use client";

import React from "react";

import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Breadcrumb, Breadcrumbs, Button, Link, Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useTranslations } from "next-intl";
import styles from "./RelatedWorks.module.scss";
import { RelatedWorksSortBy, Status } from "@/app/types";
import { RelatedWorksList } from "@/components/RelatedWorksList";
import { RelatedWorksProvider } from "@/providers/relatedWorksProvider";
import { RelatedWorksListProvider } from "@/providers/relatedWorksListProvider";

const RelatedWorksPage = () => {
  const t = useTranslations("RelatedWorksPage");

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
              onPress={() => {}}
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
                <h2>{t("tabs.pending")}</h2>
              </Tab>
              <Tab id="related">
                <h2>{t("tabs.related")}</h2>
              </Tab>
              <Tab id="discarded">{t("tabs.discarded")}</Tab>
            </TabList>
            <RelatedWorksProvider>
              <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
                <TabPanel id="pending">
                  <RelatedWorksList status={Status.Pending} />
                </TabPanel>
              </RelatedWorksListProvider>
              <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.PublishedNew}>
                <TabPanel id="related">
                  <RelatedWorksList status={Status.Related} />
                </TabPanel>
              </RelatedWorksListProvider>
              <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ReviewedNew}>
                <TabPanel id="discarded">
                  <RelatedWorksList status={Status.Discarded} />
                </TabPanel>
              </RelatedWorksListProvider>
            </RelatedWorksProvider>
          </Tabs>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default RelatedWorksPage;
