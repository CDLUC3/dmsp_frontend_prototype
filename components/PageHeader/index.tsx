'use client';

import React, { ReactNode, useEffect } from 'react';
import BackButton from "@/components/BackButton";
import './pageheader.scss';
import {stripHtml} from "@/utils/general";

interface PageHeaderProps {
  /** The main title of the page */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Whether to show the back button - defaults to true */
  showBackButton?: boolean;
  /** Optional breadcrumbs component */
  breadcrumbs?: ReactNode;
  /** Optional actions (buttons) to be displayed */
  actions?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  breadcrumbs,
  actions,
  className = ''
}: PageHeaderProps) => {


  const plainTitle = stripHtml(title);

  useEffect(() => {
    document.title = `${plainTitle} | DMPTool`;
    window.scrollTo(0, 0);
  }, [plainTitle]);

  return (
    <div className={`template-editor-header ${className}`.trim()}>
      {/* Breadcrumbs slot */}
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}

      {/* Back button */}
      {showBackButton && (
        <BackButton />
      )}

      <div className="pageheader-container">
        {/* Title and description section */}
        <div className="">
          <h1 className="pageheader-title" aria-label={plainTitle}>{plainTitle}</h1>
          {description && (
            <p className="pageheader-intro">
              {description}
            </p>
          )}
        </div>

        {/* Actions slot - can contain one or multiple buttons */}
        {actions && (
          <div className="heading-buttons-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
