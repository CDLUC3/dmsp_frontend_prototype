"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";
import { useTranslations } from "next-intl";

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
  status: "Published" | "Draft" | "Archived";
  textCount: number;
  url: string;
}

const GuidancePage: React.FC = () => {
  const [guidanceGroups, setGuidanceGroups] = useState<GuidanceGroup[]>([]);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GUIDANCE_CREATE_URL = routePath("admin.guidance.groups.create");

  // Fake guidance groups data
  const fakeGuidanceGroups: GuidanceGroup[] = [
    {
      id: "1",
      title: "School of Health Sciences",
      description: "Comprehensive guidance for health sciences research and clinical practice",
      lastUpdated: "2024-01-15",
      lastUpdatedBy: "Dr. Sarah Johnson",
      status: "Published",
      textCount: 14,
      url: routePath("admin.guidance.groups.index", { groupId: "1" }),
    },
    {
      id: "2",
      title: "Faculty of Engineering",
      description: "Technical guidelines and best practices for engineering research",
      lastUpdated: "2024-01-10",
      lastUpdatedBy: "Prof. Michael Chen",
      status: "Published",
      textCount: 8,
      url: routePath("admin.guidance.groups.index", { groupId: "2" }),
    },
    {
      id: "3",
      title: "Department of Computer Science",
      description: "Software development and data science research guidelines",
      lastUpdated: "2024-01-08",
      lastUpdatedBy: "Dr. Emily Rodriguez",
      status: "Draft",
      textCount: 12,
      url: routePath("admin.guidance.groups.index", { groupId: "3" }),
    },
    {
      id: "4",
      title: "School of Business",
      description: "Business research methodologies and ethical guidelines",
      lastUpdated: "2024-01-05",
      lastUpdatedBy: "Dr. James Wilson",
      status: "Published",
      textCount: 6,
      url: routePath("admin.guidance.groups.index", { groupId: "4" }),
    },
    {
      id: "5",
      title: "Faculty of Arts and Humanities",
      description: "Research standards for humanities and social sciences",
      lastUpdated: "2024-01-03",
      lastUpdatedBy: "Prof. Lisa Anderson",
      status: "Published",
      textCount: 9,
      url: routePath("admin.guidance.groups.index", { groupId: "5" }),
    },
    {
      id: "6",
      title: "Department of Physics",
      description: "Laboratory safety and experimental design guidelines",
      lastUpdated: "2024-01-01",
      lastUpdatedBy: "Dr. Robert Kim",
      status: "Published",
      textCount: 5,
      url: routePath("admin.guidance.groups.index", { groupId: "6" }),
    },
  ];

  useEffect(() => {
    // Set fake data on component mount
    setGuidanceGroups(fakeGuidanceGroups);
  }, []);

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
            {guidanceGroups.map((group) => (
              <DashboardListItem
                key={group.id}
                heading={group.title}
                url={group.url}
              >
                <div className={styles.guidanceContent}>
                  <p className={styles.description}>{group.description}</p>
                  <div className={styles.metadata}>
                    <span>
                      {Global("lastRevisedBy")}: {group.lastUpdatedBy}
                    </span>
                    <span className={styles.separator}>
                      {Global("lastUpdated")}: {group.lastUpdated}
                    </span>
                    <span className={styles.separator}>
                      {t("status.status")}: {group.status}
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

export default GuidancePage;
