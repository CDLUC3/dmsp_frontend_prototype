import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "react-aria-components";
import { RelatedWorksItemProps } from "@/app/types";
import { format } from "date-fns";
import styles from "./RelatedWorksListItem.module.scss";

function RelatedWorksListItem({ item }: { item: RelatedWorksItemProps }) {
  const [expanded, setExpanded] = useState<boolean>(item.defaultExpanded);
  const t = useTranslations("RelatedWorks");
  const Global = useTranslations("Global");
  const toggleExpand = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${item.title.toLowerCase().replace(/\s+/g, "-")}-content`;
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, "-")}-heading`;

  const maxAuthorChars = 40;
  const { authorNames, containerTitle, publicationYear } = formatSubtitle(item, maxAuthorChars);

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
                  {item.doi ? (
                    <a
                      href={doiToUrl(item.doi)}
                      aria-label={`${t("links.title")} ${item.title}`}
                      className={styles.titleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
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
              Confidence: {formatConfidence(item.score)}
            </span>
            <Button
              aria-expanded={expanded}
              aria-controls={expandedContentId}
              aria-label={`${expanded ? t("buttons.reviewCollapse") : t("buttons.review")} details for ${item.title}`}
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
          {item.type !== null && <span>Type: {formatType(item.type)}</span>}
        </div>
      </div>

      {expanded && <p>Details</p>}
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

const formatSubtitle = (
  item: RelatedWorksItemProps,
  maxAuthorChars: number,
): { authorNames: string; containerTitle: string; publicationYear: string } => {
  // Build author names
  const names = item.authors
    .map((author) => {
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
    })
    .filter((n): n is string => !!n);

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
  if (item.containerTitle) {
    containerTitle = ` ${item.containerTitle}${item.publicationDate ? ", " : "."}`;
  }

  // Build publication year
  const publicationYear = item.publicationDate ? `${item.publicationDate.getFullYear()}.` : "";

  return { authorNames: authorNames.join(", ") + ".", containerTitle, publicationYear };
};

export default RelatedWorksListItem;
