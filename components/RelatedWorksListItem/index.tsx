import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "react-aria-components";
import { Author, RelatedWork, Work } from "@/app/types";
import { format } from "date-fns";
import styles from "./RelatedWorksListItem.module.scss";
import DOMPurify from "dompurify";

interface RelatedWorksListItemProps {
  item: RelatedWork;
  whatMatched: string | null;
}

function RelatedWorksListItem({ item, whatMatched }: RelatedWorksListItemProps) {
  const work = item.work;
  const [expanded, setExpanded] = useState<boolean>(false);
  const t = useTranslations("RelatedWorks");
  const toggleExpand = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${work.title.toLowerCase().replace(/\s+/g, "-")}-content`;
  const headingId = `${work.title.toLowerCase().replace(/\s+/g, "-")}-heading`;

  const maxItems = 10;
  const maxAuthorChars = 40;
  const { authorNames, containerTitle, publicationYear } = formatSubtitle(work, maxAuthorChars);

  return (
    <div
      className={styles.relatedWorksItem}
      role="listitem"
    >
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <div className={styles.overviewTitle}>
            <div>
              <section aria-labelledby="project-title">
                <h3 id={headingId}>
                  {work.doi ? (
                    <a
                      href={doiToUrl(work.doi)}
                      aria-label={`${t("links.title")} ${work.title}`}
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
                  <span>{publicationYear}</span>
                </h4>
              </section>
            </div>
          </div>

          <div className={styles.overviewActions}>
            <span
              id="confidence"
              className={styles.confidence}
            >
              Confidence: {formatConfidence(work.score)}
            </span>
            <Button
              aria-expanded={expanded}
              aria-controls={expandedContentId}
              aria-label={`${expanded ? t("buttons.reviewCollapse") : t("buttons.review")} details for ${work.title}`}
              onPress={toggleExpand}
              className={styles.expandButton}
            >
              <span>{expanded ? t("buttons.reviewCollapse") : t("buttons.review")}</span>
              <span className="sr-only">{t("buttons.reviewCollapse")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 32 32"
                fill="none"
                className={`${styles.expandIcon} ${expanded ? styles.expanded : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M16.0002 19.9667C15.8225 19.9667 15.6504 19.9333 15.4842 19.8667C15.3171 19.8 15.178 19.7111 15.0669 19.6L8.93356 13.4667C8.68912 13.2222 8.56689 12.9111 8.56689 12.5333C8.56689 12.1556 8.68912 11.8444 8.93356 11.6C9.17801 11.3556 9.48912 11.2333 9.86689 11.2333C10.2447 11.2333 10.5558 11.3556 10.8002 11.6L16.0002 16.8L21.2002 11.6C21.4447 11.3556 21.7558 11.2333 22.1336 11.2333C22.5113 11.2333 22.8224 11.3556 23.0669 11.6C23.3113 11.8444 23.4336 12.1556 23.4336 12.5333C23.4336 12.9111 23.3113 13.2222 23.0669 13.4667L16.9336 19.6C16.8002 19.7333 16.6558 19.8276 16.5002 19.8827C16.3447 19.9387 16.178 19.9667 16.0002 19.9667Z"
                  fill="black"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className={styles.overviewFooter}>
          <span>Date found: {formatDate(item.dateFound)}</span>
          {work.type !== null && <span>Type: {formatType(work.type)}</span>}
          <span>
            Source:{" "}
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

      {expanded && (
        <div className={styles.details}>
          <span className={styles.reviewInstructions}>{t("details.reviewInstructions")}</span>
          <div className={styles.detailsList}>
            {(item.match.doi || whatMatched !== "matched-only") && (
              <div
                className={[
                  styles.detailsItem,
                  whatMatched === "highlight" ? styles.showContentHighlights : styles.hideContentHighlights,
                ].join(" ")}
              >
                <h5>DOI</h5>
                <a
                  href={doiToUrl(work.doi)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.match.doi && <mark>{work.doi}</mark>}
                  {!item.match.doi && <>{work.doi}</>}
                </a>
              </div>
            )}

            {item.match.title !== null && (
              <div
                className={[
                  styles.detailsItem,
                  whatMatched === "highlight" ? styles.showContentHighlights : styles.hideContentHighlights,
                ].join(" ")}
              >
                <h5>Title</h5>
                <span dangerouslySetInnerHTML={{ __html: sanitiseHighlight(item.match.title) }} />
              </div>
            )}
            {item.match.title === null && whatMatched !== "matched-only" && (
              <div
                className={[
                  styles.detailsItem,
                  whatMatched === "highlight" ? styles.showContentHighlights : styles.hideContentHighlights,
                ].join(" ")}
              >
                <h5>Title</h5>
                <span>{item.work.title}</span>
              </div>
            )}

            {item.match.abstract.length > 0 && (
              <div
                className={[
                  styles.detailsItem,
                  whatMatched === "highlight" ? styles.showContentHighlights : styles.hideContentHighlights,
                ].join(" ")}
              >
                <h5>Abstract</h5>
                {item.match.abstract.map((abs, i) => (
                  <span
                    key={i}
                    dangerouslySetInnerHTML={{ __html: sanitiseHighlight(abs) }}
                  />
                ))}
              </div>
            )}

            <ItemList
              label="Award IDs"
              items={work.awardIds}
              matches={item.match.awardIds}
              maxItems={maxItems}
              showMatchedOnly={whatMatched === "matched-only"}
              renderItem={(awardId, isMatch) => {
                return (
                  <span className={isMatch && whatMatched === "highlight" ? styles.match : undefined}>{awardId}</span>
                );
              }}
            />

            <ItemList
              label="Authors"
              items={work.authors}
              matches={item.match.authors}
              maxItems={maxItems}
              showMatchedOnly={whatMatched === "matched-only"}
              renderItem={(author, isMatch) => {
                const highlightMatch = isMatch && whatMatched === "highlight";
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

            <ItemList
              label="Institutions"
              items={work.institutions}
              matches={item.match.institutions}
              maxItems={maxItems}
              showMatchedOnly={whatMatched === "matched-only"}
              renderItem={(institution, isMatch) => {
                const highlightMatch = isMatch && whatMatched === "highlight";
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

            <ItemList
              label="Funders"
              items={work.funders}
              matches={item.match.funders}
              maxItems={maxItems}
              showMatchedOnly={whatMatched === "matched-only"}
              renderItem={(funder, isMatch) => {
                const highlightMatch = isMatch && whatMatched === "highlight";
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

          <div className={styles.reviewActions}>
            <div>
              <Button
                onPress={() => {}}
                className="primary"
                aria-label="Discard related work"
              >
                {t("buttons.discard")}
              </Button>

              <Button
                onPress={() => {}}
                className="primary"
                aria-label="Accept related work"
              >
                {t("buttons.accept")}
              </Button>
            </div>
          </div>

          <span className={styles.discardInstructions}>{t("details.discardInstructions")}</span>
        </div>
      )}
    </div>
  );
}

type ItemListProps<T> = {
  label: string;
  items: T[];
  matches: number[];
  maxItems: number;
  renderItem: (item: T, isMatch: boolean | null) => React.ReactNode;
  showMatchedOnly: boolean;
};

const sanitiseHighlight = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["mark"],
    ALLOWED_ATTR: [],
  });
};

function ItemList<T>({ label, items, matches, maxItems, renderItem, showMatchedOnly = false }: ItemListProps<T>) {
  const tooMany = items.length > maxItems;
  const remainder = items.length - maxItems;
  const [isOpen, setOpen] = useState(!tooMany);
  const visible = items.slice(0, tooMany && !isOpen ? maxItems : items.length);
  const matchSet = new Set(matches);

  if (items.length === 0 || matches.length === 0) {
    return null;
  }

  return (
    <div className={styles.detailsItem}>
      <h5>{label}</h5>
      {visible
        .map((item, i) => {
          const isMatch = matchSet.has(i);
          return { item, isMatch };
        })
        .filter((result) => {
          return !showMatchedOnly || (showMatchedOnly && result.isMatch);
        })
        .map((result, i, array) => {
          return (
            <React.Fragment key={i}>
              {renderItem(result.item, result.isMatch)}
              {i < array.length - 1 ? ", " : " "}
            </React.Fragment>
          );
        })}
      {!isOpen && tooMany && (
        <span
          className={styles.collapse}
          onClick={() => setOpen(true)}
        >
          +{remainder} more
        </span>
      )}
      {isOpen && tooMany && (
        <span
          className={styles.collapse}
          onClick={() => setOpen(false)}
        >
          {"less"}
        </span>
      )}
    </div>
  );
}

const doiToUrl = (doi: string): string => {
  return `https://doi.org/${doi}`;
};

const rorToUrl = (ror: string): string => {
  return `https://ror.org/${ror}`;
};

const orcidToUrl = (orcid: string): string => {
  return `https://orcid.org/${orcid}`;
};

const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

const formatType = (type: string): string => {
  return type
    .toLowerCase()
    .split("-")
    .map((t) => t.slice(0, 1).toUpperCase() + t.slice(1))
    .join(" ");
};

const formatConfidence = (score: number): string => {
  if (score >= 0.7) {
    return "High";
  } else if (score >= 0.4) {
    return "Medium";
  } else {
    return "Low";
  }
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
