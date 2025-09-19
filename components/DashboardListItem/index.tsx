import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./DashboardListItem.module.scss";

interface DashboardListItemProps {
  heading: string;
  url: string;
  children: React.ReactNode;
}

function DashboardListItem({ heading, url, children }: DashboardListItemProps) {
  const Global = useTranslations("Global");

  // Create unique ID for ARIA relationship
  const headingId = `${heading.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <div
      className={styles.dashboardItem}
      role="listitem"
      data-testid="dashboard-list-item"
    >
      <div className={styles.dashboardItemInner}>
        <div className={styles.dashboardItemContent}>
          <h2 id={headingId}>
            <Link
              href={url}
              aria-label={`${Global("links.update")} ${heading}`}
              className={styles.titleLink}
            >
              {heading}
            </Link>
          </h2>

          <div className={styles.content}>{children}</div>
        </div>

        <div className={styles.dashboardItemActions}>
          <Link
            href={url}
            aria-label={`${Global("links.update")} ${heading}`}
            className={styles.updateLink}
          >
            {Global("links.update")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardListItem;
