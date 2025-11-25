"use client";

import React, { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useParams } from "next/navigation";

// GraphQL
import {
  useGuidanceByGroupQuery
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import DashboardListItem from "@/components/DashboardListItem";
import { ContentContainer, LayoutContainer } from "@/components/Container";

import { routePath } from "@/utils/routes";
import styles from "./guidanceGroupIndex.module.scss";
import parentStyles from "../../guidance.module.scss";

// Types for guidance texts
interface GuidanceText {
  id: string;
  title: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  url: string;
}

interface GuidanceGroup {
  id: string;
  title: string;
  description: string;
}

const GuidanceGroupIndexPage: React.FC = () => {
  const params = useParams();
  const groupId = String(params.groupId);
  const formatter = useFormatter();

  const [guidanceTexts, setGuidanceTexts] = useState<GuidanceText[]>([]);
  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup | null>(null);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GROUP_EDIT_URL = routePath("admin.guidance.groups.edit", { groupId });
  const TEXT_CREATE_URL = routePath("admin.guidance.groups.texts.create", { groupId });

  // Fetch Guidance Texts by Group Id
  const { data: guidance } = useGuidanceByGroupQuery({
    variables: {
      guidanceGroupId: parseInt(groupId, 10)
    },
    fetchPolicy: "cache-and-network", // Show cached data first, then update with fresh data
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
    if (guidance && guidance.guidanceByGroup.length > 0) {

      const transformedGuidanceTexts = guidance.guidanceByGroup.map((g) => ({
        id: String(g.id),
        title: g.title || 'Untitled Guidance Text',
        lastUpdated: g.modified ? formatDate(g.modified) : "",
        lastUpdatedBy: `${g.user?.givenName} ${g.user?.surName}`, // Placeholder, replace with actual data if available
        url: routePath("admin.guidance.groups.texts.edit", { groupId, guidanceId: Number(g.id) }),
      }));
      setGuidanceTexts(transformedGuidanceTexts);
    };
  }, [guidance]);
  return (
    <>
      <PageHeader
        title={guidanceGroup?.title || t("pages.groupIndex.title")}
        description={guidanceGroup?.description || t("pages.groupIndex.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidanceGroups")}</Link>
            </Breadcrumb>
            <Breadcrumb>{guidanceGroup?.title || t("breadcrumbs.group")}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link
              href={GROUP_EDIT_URL}
              className={`react-aria-Button--link ${styles.editGroupButton}`}
            >
              {t("pages.groupIndex.editGroup")}
            </Link>
            <Link
              href={TEXT_CREATE_URL}
              className="button-link button--primary"
            >
              {t("pages.groupIndex.createText")}
            </Link>
          </>
        }
        className="page-guidance-group-index"
      />

      <LayoutContainer>
        <ContentContainer>
          <div
            className="guidance-texts-list"
            aria-label="Guidance texts list"
            role="list"
          >
            {guidanceTexts?.map((g) => (
              <DashboardListItem
                key={g.id}
                heading={g?.title || 'Untitled Guidance Text'}
                url={routePath("admin.guidance.groups.texts.edit", { groupId, guidanceId: Number(g.id) })}
              >
                <div className={parentStyles.guidanceContent}>
                  <div className={parentStyles.metadata}>
                    <span>
                      {Global("lastRevisedBy")}: {g.lastUpdatedBy}
                    </span>
                    <span className={parentStyles.separator}>
                      {Global("lastUpdated")}: {g.lastUpdated}
                    </span>
                  </div>
                </div>
              </DashboardListItem>
            ))}
          </div>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default GuidanceGroupIndexPage;
