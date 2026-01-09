"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { Breadcrumb, Breadcrumbs, Button, Form, Input, Label, Link, SearchField, Text } from "react-aria-components";
import {
  RelatedWorkConfidence,
  RelatedWorkSearchResult,
  RelatedWorkStatus,
  useFindWorkByIdentifierQuery,
  WorkType,
} from "@/generated/graphql";
//GraphQL
import { CollaboratorSearchResult } from "@/generated/graphql";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { OrcidIcon } from "@/components/Icons/orcid/";
import { FormInput } from "@/components/Form";
import { TypeAheadWithOther, useAffiliationSearch } from "@/components/Form/TypeAheadWithOther";
import Loading from "@/components/Loading";
// import ProjectRoles from '../ProjectRoles';
import ErrorMessages from "@/components/ErrorMessages";

// Hooks
// import { useCollaboratorSearch } from './hooks/useCollaboratorSearch';
// import { useProjectMemberForm } from './hooks/useProjectMemberForm';

// Utils
import { routePath } from "@/utils/index";
// import styles
//   from "@/app/[locale]/projects/[projectId]/research-outputs/ProjectsProjectResearchOutputs.module.scss";
import styles from "./AddRelatedWork.module.scss";
import { formatAuthorNameFirstLast, formatSubtitle } from "@/lib/relatedWorks";
import { doiToUrl, orcidToUrl, rorToUrl } from "@/lib/idToUrl";
import ExpandButton from "@/components/ExpandButton";
import ExpandableNameList from "@/components/ExpandableNameList";
import { useFormatDate } from "@/hooks/useFormatDate";

const MAX_AUTHOR_CHARS = 40;

export function extractDoi(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }
  const pattern = /10\.[\d.]+\/[^\s]+/i;
  const match = text.match(pattern);

  if (match) {
    return cleanString(match[0]);
  }

  return null;
}

export function cleanString(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  return text.toLowerCase().trim();
}

const AddRelatedWorkPage = () => {
  const params = useParams();
  const projectId = parseInt(String(params.projectId));
  const planId = parseInt(String(params.dmpid));

  // // Scroll to top when search is reset
  // const topRef = useRef<HTMLDivElement>(null);
  //
  // //For scrolling to error in modal window
  // const errorRef = useRef<HTMLDivElement | null>(null);
  //
  // // Translation keys
  const Global = useTranslations("Global");
  const t = useTranslations("AddRelatedWorkPage");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [doi, setDoi] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Query data
  const {
    data: results,
    // previousData,
    loading: isLoading,
    // refetch: relatedWorksRefetch,
  } = useFindWorkByIdentifierQuery({
    variables: {
      planId,
      doi,
    },
    fetchPolicy: "cache-and-network", // required so that results in different tabs update when status of a related work is updated
  });

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
              <Link href={routePath("projects.dmp.show", { projectId, dmpId: planId })}>
                {Global("breadcrumbs.planOverview")}
              </Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("projects.dmp.relatedWorks", { projectId, dmpId: planId })}>
                {Global("breadcrumbs.relatedWorks")}
              </Link>
            </Breadcrumb>
            <Breadcrumb>{t("title")}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-members-search"
      />

      {/*<ErrorMessages errors={[...errors, ...searchErrors]} ref={errorRef} />*/}

      <LayoutContainer>
        <ContentContainer>
          {/** Search */}
          <section
            id="search-section"
            role="search"
            className={styles.searchSection}
          >
            {/* ref={topRef}*/}
            <SearchField>
              <Label>{t("searchLabel")}</Label>
              <Input
                aria-describedby="search-help"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                onPress={() => {
                  const doi = extractDoi(searchTerm);
                  setDoi(doi);
                  setIsSearching(true);
                }}
              >
                {Global("buttons.lookup")}
              </Button>
              <Text
                slot="description"
                className="help-text"
                id="search-help"
              >
                {t.rich("searchDescription", {
                  code: (chunks) => <span style={{ backgroundColor: "rgb(236, 236, 236)" }}>{chunks}</span>,
                })}
              </Text>
            </SearchField>
          </section>

          <section aria-labelledby="results-section">
            {doi === null && isSearching && (
              <div className={styles.noResults}>
                <p>{t("invalidDoi")}</p>
              </div>
            )}

            {doi !== null &&
              results &&
              results.findWorkByIdentifier?.items?.length === 0 &&
              !isLoading &&
              isSearching && (
                <div className={styles.noResults}>
                  <p>{Global("messaging.noItemsFound")}</p>
                </div>
              )}

            {results &&
              results.findWorkByIdentifier?.items?.map((relatedWork, i) => {
                return (
                  <AddRelatedWorkPageListItem
                    relatedWork={relatedWork}
                    key={i}
                  />
                );
              })}
          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

interface AddRelatedWorkPageListItemProps {
  relatedWork: RelatedWorkSearchResult;
}


function AddRelatedWorkPageListItem  ({ relatedWork }: AddRelatedWorkPageListItemProps) {
  const Global = useTranslations("Global");
  const t = useTranslations("AddRelatedWorkPage");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  const { authorNames, containerTitle, publicationYear } = formatSubtitle(
    relatedWork.workVersion.authors,
    relatedWork.workVersion.publicationVenue,
    relatedWork.workVersion.publicationDate,
    MAX_AUTHOR_CHARS,
  );
  const dateReviewed = useFormatDate(relatedWork.modified);

  return (
    <div
      className={styles.relatedWorksItem}
      role="listitem"
      data-testid={relatedWork?.workVersion.work.doi}
    >
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <div className={styles.overviewTitle}>
            <div>
              <section>
                <h3>
                  <a
                    href={doiToUrl(relatedWork?.workVersion.work.doi as string)}
                    aria-label={`${t("title")}: ${relatedWork?.workVersion.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {relatedWork?.workVersion.title}
                  </a>
                </h3>
                <h4>
                  <span>{authorNames}</span>
                  <span>{containerTitle}</span>
                  <span data-testid="publicationYear">{publicationYear}</span>
                </h4>
              </section>
            </div>
          </div>

          <div className={styles.overviewHeaderActions}>
            <span
              data-testid="status"
              className={styles.confidence}
            >
              {t("fieldNames.status")}: {dataTypes(`status.${relatedWork.status}`)}
            </span>
          </div>
        </div>

        <div className={styles.overviewFooter}>
          <div className={styles.overviewMetadata}>
            {[RelatedWorkStatus.Accepted, RelatedWorkStatus.Rejected].includes(relatedWork.status) && (
              <span data-testid="dateReviewed">
                {t("fieldNames.dateReviewed")}: {dateReviewed}
              </span>
            )}
            <span data-testid="workType">
              {t("fieldNames.type")}: {dataTypes(`workType.${relatedWork?.workVersion.workType}`)}
            </span>
            <span>
              {t("fieldNames.source")}:{" "}
              {relatedWork?.workVersion.sourceUrl != null && (
                <a
                  href={relatedWork?.workVersion.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceUrl}
                >
                  {relatedWork?.workVersion.sourceName}
                </a>
              )}
              {relatedWork?.workVersion.sourceUrl == null && <>{relatedWork?.workVersion.sourceName}</>}
            </span>
          </div>

          <div className={styles.overviewFooterActions}>
            {[RelatedWorkStatus.Rejected, RelatedWorkStatus.Pending, null].includes(relatedWork.status) && (
              <Button
                onPress={async () => {
                  // setFadeOut(true);
                  // await updateRelatedWorkStatus(relatedWork.id, RelatedWorkStatus.Accepted);
                }}
                className={[relatedWork.status === RelatedWorkStatus.Pending ? "primary" : "secondary", "small"].join(
                  " ",
                )}
              >
                {t("buttons.accept")}
              </Button>
            )}
            {[RelatedWorkStatus.Pending, RelatedWorkStatus.Accepted].includes(relatedWork.status) && (
              <Button
                onPress={async () => {
                  // setFadeOut(true);
                  // await updateRelatedWorkStatus(relatedWork.id, RelatedWorkStatus.Rejected);
                }}
                className={[relatedWork.status === RelatedWorkStatus.Pending ? "primary" : "secondary", "small"].join(
                  " ",
                )}
              >
                {t("buttons.reject")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRelatedWorkPage;
