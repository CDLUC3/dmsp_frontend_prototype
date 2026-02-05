import { useTranslations } from "next-intl";
import Link from "next/link";
import { DmpIcon } from "@/components/Icons";
import styles from "./customizedTemplateListItem.module.scss";
import { useToast } from "@/context/ToastContext";
interface TemplateSelectListItemProps {
  item: {
    id?: number | null;
    link?: string | null;
    template?: {
      id?: number | null;
    };
    funder?: string | null;
    title: string;
    description?: string;
    lastRevisedBy?: string | null;
    lastUpdated?: string | null;
    publishStatus?: string | null;
    publishDate?: string | null;
    visibility?: string | null;
    latestPublishVisibility?: string | null;
    hasAdditionalGuidance?: boolean;
  };
}

function TemplateSelectListItem({ item }: TemplateSelectListItemProps) {
  const toastState = useToast();

  //Localization keys
  const SelectListItem = useTranslations("TemplateSelectListItem");
  const Global = useTranslations("Global");

  // Create unique IDs for ARIA relationships
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <div
      className={styles.templateItem}
      role="listitem"
      data-testid="template-list-item"
    >
      <div className={styles.templateItemWrapper}>
        <div className={styles.TemplateItemInner}>
          <div className={styles.TemplateItemContent}>
            <div className={styles.funder}>{item.funder}</div>
            <h3
              className={styles.TemplateItemHeading}
              id={headingId}
            >
              {item.link ? (
                <Link
                  href={item.link}
                  aria-label={`${Global("links.update")} ${item.title}`}
                  className={styles.titleLink}
                >
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </h3>
            {item.description && <p className={styles.description}>{item.description}</p>}

            {/**TODO: This data needs to be about customizations only. Waiting for backend changes */}
            <div
              className={styles.metadata}
              data-testid="template-metadata"
            >
              <span>
                {Global("lastRevisedBy")}: {item.lastRevisedBy}
              </span>
              <span className={styles.separator}>
                {Global("lastUpdated")}: {item.lastUpdated}
              </span>
              {item.publishStatus && item.publishStatus.length > 0 && (
                <div className={styles.publishStatus}>
                  <span className={styles.separator}>
                    {item.publishStatus}
                  </span>
                  <span className={`${styles.unpublishedChangesIcon} ${styles.warning} icon `}> <DmpIcon icon="edit-square" /></span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.TemplateItemActions}>
            {item.link && (
              <Link
                href={item.link}
                aria-label={`${Global("links.update")} ${item.title}`}
                className="button-link button--primary"
              >
                {Global("links.update")}
              </Link>
            )}
          </div>

        </div>
      </div>
    </div >
  );
}

export default TemplateSelectListItem;
