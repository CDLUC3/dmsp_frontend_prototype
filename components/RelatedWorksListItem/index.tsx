import React, { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "react-aria-components";
import { Author, RelatedWork, Status, Work } from "@/app/types";
import styles from "./RelatedWorksListItem.module.scss";
import DOMPurify from "dompurify";
import ExpandButton from "@/components/ExpandButton";
import { doiToUrl, orcidToUrl, rorToUrl } from "@/lib/idToUrl";
import ExpandableNameList from "@/components/ExpandableNameList";
import { scoreToConfidence } from "@/lib/relatedWorks";

const MAX_ITEMS = 10;
const MAX_AUTHOR_CHARS = 40;
const FADEOUT_TIMEOUT = 550;

interface RelatedWorksListItemProps {
  item: RelatedWork;
  highlightMatches: boolean;
  acceptWork: (doi: string) => void;
  discardWork: (doi: string) => void;
}

function RelatedWorksListItem({ item, highlightMatches, acceptWork, discardWork }: RelatedWorksListItemProps) {
  const t = useTranslations("RelatedWorksListItem");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  const work = item.work;
  const [fadeOut, setFadeOut] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${work.title.toLowerCase().replace(/\s+/g, "-")}-content`;
  const headingId = `${work.title.toLowerCase().replace(/\s+/g, "-")}-heading`;
  const { authorNames, containerTitle, publicationYear } = formatSubtitle(work, MAX_AUTHOR_CHARS);

  // Format dates
  const dateFound = useFormatDate(item.dateFound);
  const dateReviewed = useFormatDate(item.dateReviewed);

  return (
    <div
      className={[styles.relatedWorksItem, fadeOut ? styles.fadeOut : undefined].join(" ")}
      role="listitem"
      data-testid={item.work.doi}
    >
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <div className={styles.overviewTitle}>
            <div>
              <section>
                <h3 id={headingId}>
                  {work.doi ? (
                    <a
                      href={doiToUrl(work.doi)}
                      aria-label={`${t("header.title")}: ${work.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {work.title}
                    </a>
                  ) : (
                    work.title
                  )}
                </h3>
                <h4>
                  <span>{authorNames}</span>
                  <span>{containerTitle}</span>
                  <span data-testid="publicationYear">{publicationYear}</span>
                </h4>
              </section>
            </div>
          </div>

          <div className={styles.overviewActions}>
            <span
              data-testid="confidence"
              className={styles.confidence}
            >
              {t("fieldNames.confidence")}: {dataTypes(`confidence.${scoreToConfidence(item.score)}`)}
            </span>

            <ExpandButton
              aria-controls={expandedContentId}
              collapseLabel={t("buttons.collapse")}
              expandLabel={item.status === Status.Pending ? t("buttons.review") : t("buttons.expand")}
              aria-label={`${expanded ? t("buttons.collapse") : t("buttons.review")} details for ${work.title}`}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </div>
        </div>

        <div className={styles.overviewFooter}>
          {item.status === Status.Pending && (
            <span data-testid="dateFound">
              {t("fieldNames.dateFound")}: {dateFound}
            </span>
          )}
          {[Status.Related, Status.Discarded].includes(item.status) && (
            <span data-testid="dateReviewed">
              {t("fieldNames.dateReviewed")}: {dateReviewed}
            </span>
          )}
          {work.type !== null && (
            <span data-testid="workType">
              {t("fieldNames.type")}: {dataTypes(`workType.${work.type}`)}
            </span>
          )}
          <span>
            {t("fieldNames.source")}:{" "}
            <a
              href={work.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceUrl}
            >
              {work.source.name}
            </a>
          </span>
        </div>
      </div>

      {expanded &&
        (() => {
          const doiUrl = (
            <a
              href={doiToUrl(work.doi)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {work.doi}
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
                    {item.match.doi && <mark>{doiUrl}</mark>}
                    {!item.match.doi && <>{doiUrl}</>}
                  </span>
                </div>

                {item.match.title !== null && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.title")}</h5>
                    <span
                      dangerouslySetInnerHTML={{ __html: sanitiseHighlight(item.match.title) }}
                      className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}
                    />
                  </div>
                )}
                {item.match.title === null && (
                  <div className={styles.detailsItem}>
                    <h5>Title</h5>
                    <span className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}>
                      {item.work.title}
                    </span>
                  </div>
                )}

                {item.match.abstract.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.abstract")}</h5>
                    {item.match.abstract.map((abs, i) => (
                      <span
                        className={highlightMatches ? styles.showContentHighlights : styles.hideContentHighlights}
                        key={i}
                        dangerouslySetInnerHTML={{ __html: sanitiseHighlight(abs) }}
                      />
                    ))}
                  </div>
                )}

                {work.awardIds.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.awardIds")}</h5>
                    <ExpandableNameList
                      items={work.awardIds}
                      matches={item.match.awardIds}
                      maxItems={MAX_ITEMS}
                      renderItem={(awardId, isMatch) => {
                        return (
                          <span className={isMatch && highlightMatches ? styles.match : undefined}>{awardId}</span>
                        );
                      }}
                    />
                  </div>
                )}

                {work.authors.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.authors")}</h5>
                    <ExpandableNameList
                      items={work.authors}
                      matches={item.match.authors}
                      maxItems={MAX_ITEMS}
                      renderItem={(author, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {author.orcid === null && (
                              <span className={highlightMatch ? styles.match : undefined}>
                                {formatAuthorNameFirstLast(author)}
                              </span>
                            )}
                            {author.orcid !== null && (
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

                {work.institutions.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.institutions")}</h5>
                    <ExpandableNameList
                      items={work.institutions}
                      matches={item.match.institutions}
                      maxItems={MAX_ITEMS}
                      renderItem={(institution, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {institution.ror === null && (
                              <span className={highlightMatch ? styles.match : undefined}>{institution.name}</span>
                            )}
                            {institution.ror !== null && (
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

                {work.funders.length > 0 && (
                  <div className={styles.detailsItem}>
                    <h5>{t("fieldNames.funders")}</h5>

                    <ExpandableNameList
                      items={work.funders}
                      matches={item.match.funders}
                      maxItems={MAX_ITEMS}
                      renderItem={(funder, isMatch) => {
                        const highlightMatch = isMatch && highlightMatches;
                        return (
                          <>
                            {funder.ror === null && (
                              <span className={highlightMatch ? styles.match : undefined}>{funder.name}</span>
                            )}
                            {funder.ror !== null && (
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

              <div className={styles.reviewActions}>
                <div>
                  {[Status.Pending, Status.Related].includes(item.status) && (
                    <Button
                      onPress={() => {
                        setFadeOut(true);
                        setTimeout(() => {
                          discardWork(work.doi);
                        }, FADEOUT_TIMEOUT);
                      }}
                      className={item.status === Status.Pending ? "primary" : "secondary"}
                    >
                      {t("buttons.discard")}
                    </Button>
                  )}

                  {[Status.Discarded, Status.Pending].includes(item.status) && (
                    <Button
                      onPress={() => {
                        setFadeOut(true);
                        setTimeout(() => {
                          acceptWork(work.doi);
                        }, FADEOUT_TIMEOUT);
                      }}
                      className={item.status === Status.Pending ? "primary" : "secondary"}
                    >
                      {t("buttons.accept")}
                    </Button>
                  )}
                </div>
              </div>

              <span className={styles.actionInstructions}>{t(`instructions.actions.${item.status}`)}</span>
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

const useFormatDate = (date: Date | null) => {
  const formatter = useFormatter();
  if (date == null) {
    return "";
  }

  const formattedDate = formatter.dateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Replace slashes with hyphens
  return formattedDate.replace(/\//g, "-");
};

const formatAuthorNameAbrev = (author: Author): string | null => {
  const parts = [];

  if (author.firstInitial && author.surname) {
    // Combine initials
    const initials = [];
    if (author.firstInitial) {
      initials.push(author.firstInitial);
    }
    if (author.middleInitial) {
      initials.push(author.middleInitial);
    }
    parts.push(initials.join("")); // Join initials
    parts.push(author.surname); // Add surname
  } else if (author.full) {
    // Fallback to full name
    parts.push(author.full);
  }

  return parts.length > 0 ? parts.join(" ").trim() : null;
};

const formatAuthorNameFirstLast = (author: Author): string | null => {
  const parts = [];

  if (author.givenName && author.surname) {
    parts.push(author.givenName);
    parts.push(author.surname);
  } else if (author.full) {
    // Fallback to full name
    parts.push(author.full);
  }

  return parts.length > 0 ? parts.join(" ").trim() : null;
};

const formatSubtitle = (
  work: Work,
  maxAuthorChars: number,
): { authorNames: string; containerTitle: string; publicationYear: string } => {
  // Build author names
  const names = work.authors.map(formatAuthorNameAbrev).filter((n): n is string => !!n);

  // Choose what names to display based on the total character length
  const authorNames = [];
  let totalChars = 0;
  for (const name of names) {
    authorNames.push(name);
    totalChars += name.length;
    if (totalChars >= maxAuthorChars) break;
  }
  if (names.length > authorNames.length) {
    authorNames.push("et al");
  }

  // Build container title
  let containerTitle = "";
  if (work.containerTitle) {
    containerTitle = ` ${work.containerTitle}${work.publicationDate ? ", " : "."}`;
  }

  // Build publication year
  const publicationYear = work.publicationDate ? `${work.publicationDate.getFullYear()}.` : "";

  return { authorNames: authorNames.join(", ") + ".", containerTitle, publicationYear };
};

export default RelatedWorksListItem;
