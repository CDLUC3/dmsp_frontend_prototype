"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useFormatter, useTranslations } from "next-intl";

// GraphQL
import {
  useMeQuery,
  useGuidanceGroupsQuery
} from '@/generated/graphql';


// Components
import PageHeader from "@/components/PageHeader";
import DashboardListItem from "@/components/DashboardListItem";
import { ContentContainer, LayoutContainer } from "@/components/Container";

import { routePath } from "@/utils/routes";
import styles from "./guidance.module.scss";

// Types for guidance groups
interface GuidanceGroup {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  latestPublishedVersion?: string;
  latestPublishedDate?: string;
  status: string;
  textCount: number;
  url: string;
}

const GuidancePage: React.FC = () => {
  const formatter = useFormatter();

  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>([]);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GUIDANCE_CREATE_URL = routePath("admin.guidance.groups.create");

  // Run me query to get user's name
  const { data: me } = useMeQuery();

  const { data: guidanceGroupsData } = useGuidanceGroupsQuery({
    variables: {
      affiliationId: me?.me?.affiliation?.uri || null
    },
    fetchPolicy: "network-only",
    skip: !me?.me?.affiliation?.uri // Prevent running until the me data exists
  });

  const formatDate = (date: string | number) => {
    const parsedDate = typeof date === "number" ? new Date(date) : new Date(date.replace(/-/g, "/")); // Replace dashes with slashes for compatibility

    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date"; // Handle invalid input gracefully
    }

    return formatter.dateTime(parsedDate, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    // Set fake data on component mount
    //setGuidanceGroup(fakeGuidanceGroup);
    if (guidanceGroupsData && guidanceGroupsData.guidanceGroups.length > 0) {

      console.log("guidanceGroupsData:", guidanceGroupsData);
      const transformedGuidanceGroups = guidanceGroupsData.guidanceGroups.map((g) => ({
        id: String(g.id),
        title: g.name || 'Untitled Guidance Group',
        lastUpdated: g.modified ? formatDate(g.modified) : "",
        lastUpdatedBy: `${g.user?.givenName} ${g.user?.surName}`,
        latestPublishedVersion: `v${g.latestPublishedVersion}` || '',
        latestPublishedDate: g.latestPublishedDate ? formatDate(g.latestPublishedDate) : '',
        status: g.isDirty ? Global("notPublished") : Global("published"),
        description: g.description || '',
        textCount: g?.guidance?.length || 0,
        url: routePath("admin.guidance.groups.index", { groupId: String(g.id) }),
      }));
      setGuidanceGroups(transformedGuidanceGroups);
    };
  }, [guidanceGroupsData]);

  return (
    <>
      <PageHeader
        title={t("pages.index.title")}
        description={t("pages.index.description")}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidance")}</Link>
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link
              href={GUIDANCE_CREATE_URL}
              className="button-link button--primary"
            >
              {t("pages.index.createGroup")}
            </Link>
          </>
        }
        className="page-template-list"
      />

      <LayoutContainer>
        <ContentContainer>
          <div
            className="guidance-list"
            aria-label="Guidance groups list"
            role="list"
          >
            {guidanceGroups?.map((group) => (
              <DashboardListItem
                key={group.id}
                heading={group.title}
                url={routePath("admin.guidance.groups.index", { groupId: Number(group.id) })}
              >
                <div className={styles.guidanceContent}>
                  <p className={styles.description}>{group.description}</p>
                  <div className={styles.metadata}>
                    <span>
                      {Global("lastRevisedBy")}: {group.lastUpdatedBy}
                    </span>
                    <span className={styles.separator}>
                      {Global('lastUpdated')}: {group.lastUpdated}
                    </span>
                    <span className={styles.separator}>
                      {t("status.status")}: {group.status}
                    </span>
                    {group.status === "Published" && group.latestPublishedVersion && (
                      <span className={styles.separator}>
                        {t("status.publishedVersion")}: {group.latestPublishedVersion}
                      </span>
                    )}
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
};

export default GuidancePage;
