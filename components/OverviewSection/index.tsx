import React from "react";
import { Link } from "react-aria-components";
import styles from "./OverviewSection.module.scss";

interface OverviewSectionProps {
  /** The heading/title for the section */
  heading: string;
  /** The ID for the heading element (for aria-labelledby) */
  headingId: string;
  /** The link URL */
  linkHref: string;
  /** The link text */
  linkText: string;
  /** The aria-label for the link */
  linkAriaLabel: string;
  /** Additional CSS class for the section */
  className?: string;
  /** The content to display under the heading */
  children: React.ReactNode;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  heading,
  headingId,
  linkHref,
  linkText,
  linkAriaLabel,
  className = "",
  children,
}) => {
  return (
    <section
      className={`${styles.overviewSection} ${className}`}
      aria-labelledby={headingId}
    >
      <div className={styles.overviewSectionContent}>
        <h2
          id={headingId}
          className={styles.overviewSectionTitle}
        >
          {heading}
        </h2>
        <div className={styles.overviewSectionText}>{children}</div>
      </div>
      <Link
        href={linkHref}
        aria-label={linkAriaLabel}
        className={styles.overviewSectionLink}
      >
        {linkText}
      </Link>
    </section>
  );
};

export default OverviewSection;
