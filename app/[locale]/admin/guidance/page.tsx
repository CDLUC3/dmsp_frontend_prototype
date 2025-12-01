"use client";

import React, { useMemo } from "react";
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useTranslations } from "next-intl";

// GraphQL
import {
  useMeQuery,
  useTagsQuery,
  useGuidanceGroupsQuery
} from '@/generated/graphql';


// Components
import PageHeader from "@/components/PageHeader";
import DashboardListItem from "@/components/DashboardListItem";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import Loading from "@/components/Loading";

// Hooks
import { useFormatDate } from "@/hooks/useFormatDate";
import { routePath } from "@/utils/routes";
import styles from "./guidance.module.scss";

const GuidancePage: React.FC = () => {
  const formatDate = useFormatDate();

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GUIDANCE_CREATE_URL = routePath("admin.guidance.groups.create");

  // Run me query to get user's name
  const { data: me, loading: meLoading } = useMeQuery();

  // Query for all tags
  const { data: tagsData, loading: tagsLoading } = useTagsQuery();

  const { data: guidanceGroupsData, loading: guidanceGroupsLoading } = useGuidanceGroupsQuery({
    variables: {
      affiliationId: me?.me?.affiliation?.uri || null
    },
    fetchPolicy: "network-only",
    skip: !me?.me?.affiliation?.uri // Prevent running until the me data exists
  });

  // Only show loading if we're actually fetching data (not skipped)
  const isLoading = meLoading || tagsLoading || (guidanceGroupsLoading && !!me?.me?.affiliation?.uri);

  const guidanceGroups = useMemo(() => {
    if (!guidanceGroupsData?.guidanceGroups.length || !tagsData?.tags.length) {
      return [];
    }

    return guidanceGroupsData.guidanceGroups.map((g) => ({
      id: String(g.id),
      title: g.name || 'Untitled Guidance Group',
      lastUpdated: g.modified ? formatDate(g.modified) : "",
      lastUpdatedBy: `${g.user?.givenName} ${g.user?.surName}`,
      latestPublishedVersion: `${g.latestPublishedVersion}` || '',
      latestPublishedDate: g.latestPublishedDate ? formatDate(g.latestPublishedDate) : '',
      status: g.isDirty ? Global("draft") : Global("published"),
      description: g.description || '',
      textCount: `${g?.guidance?.length || 0} / ${tagsData?.tags.length || 0} Tags with Guidance`,
      url: routePath("admin.guidance.groups.index", { groupId: String(g.id) }),
    }));
  }, [guidanceGroupsData, tagsData, Global, formatDate]);

  const title = t("pages.index.title");
  const description = t("pages.index.description");
  return (
    <>
      <PageHeader
        title={title}
        description={description}
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
          {isLoading ? (
            <Loading message="Loading..." />
          ) : (
            <ul
              className={styles.guidanceList}
              aria-label="Guidance groups list"
            >
              {guidanceGroups?.map((group) => (
                <DashboardListItem
                  key={group.id}
                  heading={group.title}
                  url={routePath("admin.guidance.groups.index", { groupId: Number(group.id) })}
                  isFullyClickable={true}
                >
                  <div className={styles.guidanceContent}>
                    <p className={styles.description}>{group.description}</p>
                    <div className={styles.metadata}>
                      <span>
                        {group.textCount}
                      </span>
                      <span className={styles.separator}>
                        {Global('lastUpdated')}: {group.lastUpdated}
                      </span>
                      <span className={styles.separator}>
                        {t("status.status")}: {group.status}
                      </span>
                    </div>
                  </div>
                </DashboardListItem>
              ))}
            </ul>
          )}
        </ContentContainer>
      </LayoutContainer >
    </>
  );
};

export default GuidancePage;
