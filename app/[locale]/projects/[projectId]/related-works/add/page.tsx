"use client";
import React from "react";
import { useTranslations } from "next-intl";

import { Breadcrumb, Breadcrumbs, Link } from "react-aria-components";

import { RelatedWorksIdentifierType } from "@/generated/graphql";

import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";

import { routePath } from "@/utils/index";
import { useParams } from "next/navigation";
import RelatedWorksAdd from "@/components/RelatedWorksAdd";

const AddRelatedWorkProjectPage = () => {
  const params = useParams();
  const projectId = parseInt(String(params.projectId));

  const Global = useTranslations("Global");
  const t = useTranslations("AddRelatedWorkProjectPage");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("projects.index")}>{Global("breadcrumbs.projects")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("projects.show", { projectId })}>{Global("breadcrumbs.projectOverview")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("projects.related-works.index", { projectId })}>
                {Global("breadcrumbs.relatedWorks")}
              </Link>
            </Breadcrumb>
            <Breadcrumb>{t("title")}</Breadcrumb>
          </Breadcrumbs>
        }
      />

      <LayoutContainer>
        <ContentContainer>
          <RelatedWorksAdd
            identifier={projectId}
            identifierType={RelatedWorksIdentifierType.ProjectId}
          />
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default AddRelatedWorkProjectPage;
