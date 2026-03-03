import React, { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "react-aria-components";
import styles from "./RelatedWorksListItem.module.scss";
import DOMPurify from "dompurify";
import ExpandButton from "@/components/ExpandButton";
import { doiToUrl, orcidToUrl, rorToUrl } from "@/lib/identifierUtils";
import ExpandableNameList from "@/components/ExpandableNameList";
import { RelatedWorkSearchResult, RelatedWorkStatus } from "@/generated/graphql";
import { formatAuthorNameFirstLast, formatSubtitle } from "@/lib/relatedWorks";

const MAX_ITEMS = 10;
const MAX_AUTHOR_CHARS = 40;

interface RelatedWorksListItemProps {
  relatedWork: RelatedWorkSearchResult;
  highlightMatches: boolean;
  updateRelatedWorkStatus: (relatedWorkId: number, status: RelatedWorkStatus) => Promise<void>;
}

function RelatedWorksListItem({ relatedWork, highlightMatches, updateRelatedWorkStatus }: RelatedWorksListItemProps) {
  const t = useTranslations("RelatedWorksListItem");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  const [fadeOut, setFadeOut] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${relatedWork.workVersion?.title?.toLowerCase().replace(/\s+/g, "-")}-content`;
  const headingId = `${relatedWork.workVersion?.title?.toLowerCase().replace(/\s+/g, "-")}-heading`;
  const { authorNames, containerTitle, publicationYear } = formatSubtitle(
    relatedWork.workVersion.authors,
    relatedWork.workVersion.publicationVenue,
    relatedWork.workVersion.publicationDate,
    MAX_AUTHOR_CHARS,
  );

  // Format dates
  const dateFound = useFormatDate(relatedWork.created);
  const dateReviewed = useFormatDate(relatedWork.modified);

  return (
    <div
      className={[styles.relatedWorksItem, fadeOut ? styles.fadeOut : undefined].join(" ")}
      role="listitem"
      data-testid={relatedWork.workVersion.work.doi}
    >
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <div className={styles.overviewTitle}>
            <div>
              <section>
                <h3 id={headingId}>
                  <a
                    href={doiToUrl(relatedWork.workVersion.work.doi)}
                    aria-label={`${t("title")}: ${relatedWork.workVersion?.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {relatedWork.workVersion?.title}
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
            {relatedWork.confidence != null && (
              <span
                data-testid="confidence"
                className={styles.confidence}
              >
                {t("fieldNames.confidence")}: {dataTypes(`confidence.${relatedWork.confidence}`)}
              </span>
            )}

            <ExpandButton
              aria-controls={expandedContentId}
              collapseLabel={t("buttons.collapse")}
              expandLabel={t("buttons.expand")}
              aria-label={`${expanded ? t("buttons.collapse") : t("buttons.expand")} details for ${relatedWork.workVersion.title}`}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </div>
        </div>

        <div className={styles.overviewFooter}>
          <div className={styles.overviewMetadata}>
            {relatedWork.status === RelatedWorkStatus.Pending && (
              <span data-testid="dateFound">
                {t("fieldNames.dateFound")}: {dateFound}
              </span>
            )}
            {[RelatedWorkStatus.Accepted, RelatedWorkStatus.Rejected].includes(relatedWork.status) && (
              <span data-testid="dateReviewed">
                {t("fieldNames.dateReviewed")}: {dateReviewed}
              </span>
            )}
            <span data-testid="workType">
              {t("fieldNames.type")}: {dataTypes(`workType.${relatedWork.workVersion.workType}`)}
            </span>
            <span>
              {t("fieldNames.source")}:{" "}
              {relatedWork.workVersion?.sourceUrl != null && (
                <a
                  href={relatedWork.workVersion.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceUrl}
                >
                  {relatedWork.workVersion.sourceName}
                </a>
              )}
              {relatedWork.workVersion?.sourceUrl == null && <>{relatedWork.workVersion.sourceName}</>}
            </span>
          </div>

          <div className={styles.overviewFooterActions}>
            {[RelatedWorkStatus.Rejected, RelatedWorkStatus.Pending].includes(relatedWork.status) && (
              <Button
                onPress={async () => {
                  setFadeOut(true);
                  await updateRelatedWorkStatus(relatedWork.id as number, RelatedWorkStatus.Accepted);
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
                  setFadeOut(true);
                  await updateRelatedWorkStatus(relatedWork.id as number, RelatedWorkStatus.Rejected);
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

      {expanded &&
        (() => {
          const doiUrl = (
            <a
              href={doiToUrl(relatedWork.workVersion.work.doi)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {relatedWork.workVersion.work.doi}
            </a>
          );

          return (
            <div
              role="details"
              className={styles.details}
            >
              <span className={styles.reviewInstructions}>{t("instructions.review")}</span>
              <div className={styles.detailsList}>
                <div className={styles.detailsItem}>
                  <h5>{t("fieldNames.doi")}</h5>
                  <span className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}>
                    {relatedWork.doiMatch?.found && <mark>{doiUrl}</mark>}
                    {!relatedWork.doiMatch?.found && <>{doiUrl}</>}
                  </span>
                </div>

                {relatedWork.contentMatch?.titleHighlight != null && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.title")}</h5>
                    <span
                      dangerouslySetInnerHTML={{ __html: sanitiseHighlight(relatedWork.contentMatch.titleHighlight) }}
                      className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}
                    />
                  </div>
                )}
                {relatedWork.contentMatch?.titleHighlight == null && (
                  <div className={styles.detailsItem}>
                    <h5>Title</h5>
                    <span className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}>
                      {relatedWork.workVersion?.title}
                    </span>
                  </div>
                )}

                {relatedWork.contentMatch?.abstractHighlights != null &&
                  relatedWork.contentMatch?.abstractHighlights.length > 0 && (
                    <div className={styles.detailsItem}>
                      <h5>{t("fieldNames.abstract")}</h5>
                      {relatedWork.contentMatch.abstractHighlights.map((abs, i) => (
                        <span
                          className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}
                          key={i}
                          dangerouslySetInnerHTML={{ __html: sanitiseHighlight(abs) }}
                        />
                      ))}
                    </div>
                  )}

                {relatedWork.workVersion.awards.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.awardIds")}</h5>
                    <ExpandableNameList
                      items={relatedWork.workVersion.awards}
                      matches={relatedWork.awardMatches}
                      maxItems={MAX_ITEMS}
                      renderItem={(award, isMatch) => {
                        return (
                          <span className={isMatch && highlightMatches ? styles.match : undefined}>
                            {award.awardId}
                          </span>
                        );
                      }}
                    />
                  </div>
                )}

                {relatedWork.workVersion.authors.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.authors")}</h5>
                    <ExpandableNameList
                      items={relatedWork.workVersion.authors}
                      matches={relatedWork.authorMatches}
                      maxItems={MAX_ITEMS}
                      renderItem={(author, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {author.orcid == null && (
                              <span className={highlightMatch ? styles.match : undefined}>
                                {formatAuthorNameFirstLast(author)}
                              </span>
                            )}
                            {author.orcid != null && (
                              <a
                                href={orcidToUrl(author.orcid)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={highlightMatch ? styles.match : undefined}
                              >
                                {formatAuthorNameFirstLast(author)}
                              </a>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                )}

                {relatedWork.workVersion.institutions.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.institutions")}</h5>
                    <ExpandableNameList
                      items={relatedWork.workVersion.institutions}
                      matches={relatedWork.institutionMatches}
                      maxItems={MAX_ITEMS}
                      renderItem={(institution, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {institution.ror == null && (
                              <span className={highlightMatch ? styles.match : undefined}>{institution.name}</span>
                            )}
                            {institution.ror != null && (
                              <a
                                href={rorToUrl(institution.ror)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={highlightMatch ? styles.match : undefined}
                              >
                                {institution.name}
                              </a>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                )}

                {relatedWork.workVersion.funders.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.funders")}</h5>

                    <ExpandableNameList
                      items={relatedWork.workVersion.funders}
                      matches={relatedWork.funderMatches}
                      maxItems={MAX_ITEMS}
                      renderItem={(funder, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {funder.ror == null && (
                              <span className={highlightMatch ? styles.match : undefined}>{funder.name}</span>
                            )}
                            {funder.ror != null && (
                              <a
                                href={rorToUrl(funder.ror)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={highlightMatch ? styles.match : undefined}
                              >
                                {funder.name}
                              </a>
                            )}
                          </>
                        );
                      }}
                    />
                  </div>
                )}
              </div>

              <span className={styles.actionInstructions}>{t(`instructions.actions.${relatedWork.status}`)}</span>
            </div>
          );
        })()}
    </div>
  );
}

const sanitiseHighlight = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["mark"],
    ALLOWED_ATTR: [],
  });
};

const useFormatDate = (date: Date | string | null | undefined) => {
  const formatter = useFormatter();
  if (date == null || date === "") {
    return "";
  }

  if (typeof date === "string") {
    date = new Date(date);
  }

  const formattedDate = formatter.dateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Replace slashes with hyphens
  return formattedDate.replace(/\//g, "-");
};

export default RelatedWorksListItem;
