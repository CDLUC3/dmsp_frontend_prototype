import styles from "./RelatedWorksAdd.module.scss";

import React, {useRef, useState} from "react";
import { useTranslations } from "next-intl";

import { Button, Input, Label, SearchField, Text } from "react-aria-components";

import {
  FindWorkByIdentifierDocument,
  RelatedWorkSearchResult,
  RelatedWorksIdentifierType,
  RelatedWorkStatus,
} from "@/generated/graphql";

import { formatSubtitle } from "@/lib/relatedWorks";
import { doiToUrl, extractDoi } from "@/lib/identifierUtils";
import { useFormatDate } from "@/hooks/useFormatDate";
import { upsertRelatedWorkAction } from "@/app/actions/upsertRelatedWorkAction";
import { useLazyQuery } from "@apollo/client/react";
import { ProjectPlanSelect } from "@/components/RelatedWorksSelect";
import ErrorMessages from "@/components/ErrorMessages";

const MAX_AUTHOR_CHARS = 40;

interface RelatedWorksAddProps {
  identifier: number;
  identifierType: RelatedWorksIdentifierType;
}

export const RelatedWorksAdd = ({ identifierType, identifier }: RelatedWorksAddProps) => {
  const Global = useTranslations("Global");
  const t = useTranslations("RelatedWorksAdd");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [doi, setDoi] = useState<string | null>(null);
  const [lookupClicked, setLookupClicked] = useState<boolean>(false);
  const [planId, setPlanId] = useState<number | null>(
    identifierType === RelatedWorksIdentifierType.PlanId ? identifier : null,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  // Query data
  const [findWorkByIdentifier, {
    data: searchResults,
    loading: isLoadingSearch,
    refetch: refetchSearch,
  }] = useLazyQuery(FindWorkByIdentifierDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  const displayDOISearch =
    identifierType === RelatedWorksIdentifierType.PlanId ||
    (identifierType === RelatedWorksIdentifierType.ProjectId && planId != null);

  return (
    <>
      <section
        id="search-section"
        role="search"
        className={styles.searchSection}
      >
        {identifierType === RelatedWorksIdentifierType.ProjectId && (
          <SearchField
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "1rem" }}
          >
            <Label
              htmlFor="doi-search"
              style={{ display: "inline-block" }}
            >
              {t("planSelectLabel")}
            </Label>
            <ProjectPlanSelect
              projectId={identifier}
              selectedKey={planId}
              setSelectedKey={setPlanId}
            />
            <Text
              slot="description"
              className="help-text"
              id="plan-select-search-help"
            >
              {t.rich("planSelectDescription", {
                code: (chunks) => <span style={{ backgroundColor: "rgb(236, 236, 236)" }}>{chunks}</span>,
              })}
            </Text>
          </SearchField>
        )}
        {displayDOISearch && (
          <SearchField>
            <Label htmlFor="doi-search">{t("searchLabel")}</Label>
            <Input
              id="doi-search"
              aria-describedby="doi-search-help"
              placeholder="10.1000/182"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              aria-label={Global("buttons.lookup")}
              onPress={async () => {
                const extractedDoi = extractDoi(searchTerm);
                setDoi(extractedDoi);
                setLookupClicked(true);

                if(!extractedDoi) {
                  return;
                }

                const response = await findWorkByIdentifier({
                  variables: { planId, doi: extractedDoi }
                });

                type GraphQLErrorItem = {
                  message: string;
                  extensions?: {
                    details?: string;
                  };
                };
                type GraphQLErrors = {
                  errors: GraphQLErrorItem[];
                };

                const errors = (response?.error as unknown as GraphQLErrors)?.errors?.map((e: GraphQLErrorItem) => e?.extensions?.details ?? e.message) ?? [];
                setErrors(errors);
              }}
            >
              {Global("buttons.lookup")}
            </Button>
            <Text
              slot="description"
              className="help-text"
              id="doi-search-help"
            >
              {t.rich("searchDescription", {
                code: (chunks) => <span style={{ backgroundColor: "rgb(236, 236, 236)" }}>{chunks}</span>,
              })}
            </Text>
          </SearchField>
        )}
      </section>

      <section>
        {doi === null && lookupClicked && (
          <div>
            <p>{t("invalidDoi")}</p>
          </div>
        )}

        {doi !== null &&
          searchResults &&
          searchResults.findWorkByIdentifier?.items?.length === 0 &&
          !isLoadingSearch &&
          lookupClicked && (
            <div>
              <p>{Global("messaging.noItemsFound")}</p>
            </div>
          )}

        {displayDOISearch &&
          searchResults &&
          searchResults.findWorkByIdentifier?.items
            ?.filter((rw): rw is RelatedWorkSearchResult => rw !== null && rw !== undefined)
            .map((rw, i) => {
              return (
                <AddRelatedWorkPageListItem
                  identifierType={identifierType}
                  relatedWork={rw}
                  refetchSearch={refetchSearch}
                  planId={planId}
                  key={i}
                />
              );
            })}

        <ErrorMessages errors={errors} ref={errorRef} />
      </section>
    </>
  );
};

interface AddRelatedWorkPageListItemProps {
  identifierType: RelatedWorksIdentifierType;
  relatedWork: RelatedWorkSearchResult;
  refetchSearch: () => Promise<unknown>;
  planId: number | null;
}

function AddRelatedWorkPageListItem({
  identifierType,
  relatedWork,
  refetchSearch,
  planId,
}: AddRelatedWorkPageListItemProps) {
  const t = useTranslations("RelatedWorksAdd");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  const { authorNames, containerTitle, publicationYear } = formatSubtitle(
    relatedWork.workVersion.authors,
    relatedWork.workVersion.publicationVenue,
    relatedWork.workVersion.publicationDate,
    MAX_AUTHOR_CHARS,
  );
  const dateReviewed = useFormatDate()(relatedWork.modified);

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
              className={styles.status}
            >
              {t("fieldNames.status")}: {dataTypes(`status.${relatedWork.status}`)}
            </span>
          </div>
        </div>

        <div className={styles.overviewFooter}>
          <div className={styles.overviewMetadata}>
            {relatedWork.planTitle != null && identifierType === RelatedWorksIdentifierType.ProjectId && (
              <span data-testid="planTitle">
                {t("fieldNames.planTitle")}: {relatedWork.planTitle}
              </span>
            )}

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
            {[RelatedWorkStatus.Rejected, RelatedWorkStatus.Pending, null].includes(relatedWork.status) &&
              planId != null && (
                <Button
                  onPress={async () => {
                    await upsertRelatedWorkAction({
                      planId,
                      doi: relatedWork.workVersion.work.doi,
                      hash: relatedWork.workVersion.hash,
                      status: RelatedWorkStatus.Accepted,
                    });
                    await refetchSearch();
                  }}
                  className={[relatedWork.status === RelatedWorkStatus.Pending ? "primary" : "secondary", "small"].join(
                    " ",
                  )}
                >
                  {t("buttons.accept")}
                </Button>
              )}
            {[RelatedWorkStatus.Pending, RelatedWorkStatus.Accepted].includes(relatedWork.status) && planId != null && (
              <Button
                onPress={async () => {
                  await upsertRelatedWorkAction({
                    planId,
                    doi: relatedWork.workVersion.work.doi,
                    hash: relatedWork.workVersion.hash,
                    status: RelatedWorkStatus.Rejected,
                  });
                  await refetchSearch();
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

export default RelatedWorksAdd;
