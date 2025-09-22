"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

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
  status: "Published" | "Draft" | "Archived";
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
  const [guidanceTexts, setGuidanceTexts] = useState<GuidanceText[]>([]);
  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup | null>(null);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GROUP_EDIT_URL = routePath("admin.guidance.groups.edit", { groupId });
  const TEXT_CREATE_URL = routePath("admin.guidance.groups.texts.create", { groupId });

  // Fake guidance group data
  const fakeGuidanceGroup: GuidanceGroup = {
    id: groupId,
    title: "School of Health Sciences",
    description: "Comprehensive guidance for health sciences research and clinical practice",
  };

  // Fake guidance texts data
  const fakeGuidanceTexts: GuidanceText[] = [
    {
      id: "1",
      title: "Research Ethics Guidelines",
      lastUpdated: "2024-01-15",
      lastUpdatedBy: "Dr. Sarah Johnson",
      status: "Published",
      url: routePath("admin.guidance.groups.texts.edit", { groupId, textId: "1" }),
    },
    {
      id: "2",
      title: "Data Collection Standards",
      lastUpdated: "2024-01-12",
      lastUpdatedBy: "Dr. Michael Chen",
      status: "Published",
      url: routePath("admin.guidance.groups.texts.edit", { groupId, textId: "2" }),
    },
    {
      id: "3",
      title: "Publication Guidelines",
      lastUpdated: "2024-01-10",
      lastUpdatedBy: "Dr. Emily Rodriguez",
      status: "Draft",
      url: routePath("admin.guidance.groups.texts.edit", { groupId, textId: "3" }),
    },
  ];

  useEffect(() => {
    // Set fake data on component mount
    setGuidanceGroup(fakeGuidanceGroup);
    setGuidanceTexts(fakeGuidanceTexts);
  }, [groupId]);

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
            {guidanceTexts.map((text) => (
              <DashboardListItem
                key={text.id}
                heading={text.title}
                url={text.url}
              >
                <div className={parentStyles.guidanceContent}>
                  <div className={parentStyles.metadata}>
                    <span>
                      {Global("lastRevisedBy")}: {text.lastUpdatedBy}
                    </span>
                    <span className={parentStyles.separator}>
                      {Global("lastUpdated")}: {text.lastUpdated}
                    </span>
                    <span className={parentStyles.separator}>
                      {t("status.status")}: {text.status}
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
