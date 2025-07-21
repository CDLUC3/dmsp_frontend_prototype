'use client';

import React, { FormEvent, ReactNode, useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import {
  Button,
  Form,
} from "react-aria-components";
import { useTranslations } from 'next-intl';
import { FormInput } from '@/components/Form';
import './pageheaderWithTitle.scss';

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
  /** Callback to notify the title changed */
  onTitleChange: ((newTitle: string) => void);
}

const PageHeaderWithTitleChange: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  breadcrumbs,
  actions,
  className = '',
  onTitleChange,
}: PageHeaderProps) => {

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState<string>(title);
  const Global = useTranslations('Global');

  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    ev.preventDefault();
    setNewTitle(ev.target.value);
  }

  function handleFormSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setIsEditing(false);
    if (newTitle !== title) {
      onTitleChange(newTitle);
    }
  }

  useEffect(() => {
    document.title = `${title} | DMPTool`;
    window.scrollTo(0, 0);
  }, [title]);

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
        <div>
          <Form onSubmit={handleFormSubmit} className="pageheader-title-form">
            {isEditing ? (
              <FormInput
                name={title}
                type="text"
                label="Template title"
                value={newTitle}
                inputClasses="titleChange-input"
                placeholder="Enter new template title"
                onChange={handleChange}
              />
            ) : (
              <div className="pageheader-title-container">
                <h1 className="pageheader-title">{title}</h1>
                <Button
                  className='link'
                  onPress={() => setIsEditing(true)}
                >
                  Edit template name
                </Button>
              </div>
            )}
            {isEditing && (
              <div className="button-container">
                <Button type="submit" className="secondary" onPress={() => setIsEditing(false)}>{Global('buttons.cancel')}</Button>
                <Button type="submit" className="primary" data-testid="save-button">{Global('buttons.save')}</Button>
              </div>
            )}
            <p className="pageheader-intro">
              {description}
            </p>
          </Form>
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

export default PageHeaderWithTitleChange;
