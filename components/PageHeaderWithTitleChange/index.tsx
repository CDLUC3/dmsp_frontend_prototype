'use client';

import React, { FormEvent, ReactNode, useEffect, useState } from 'react';
import BackButton from "@/components/BackButton";
import {
  Button,
  Form,
} from "react-aria-components";
import { useTranslations } from 'next-intl';
import { FormInput } from '@/components/Form';
import styles from './pageheaderWithTitle.module.scss';

interface PageHeaderProps {
  /** The main title of the page */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional JSX elements to append to the description */
  descriptionAppend?: ReactNode;
  /** Required link text, such as 'Edit template title' */
  linkText: string;
  /** Required text for label */
  labelText: string;
  /** Optional placeholder title */
  placeholder?: string;
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
  descriptionAppend,
  linkText,
  labelText,
  placeholder,
  showBackButton = true,
  breadcrumbs,
  actions,
  className = '',
  onTitleChange,
}: PageHeaderProps) => {

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState<string>(title);
  const Global = useTranslations('Global');

  const handleEdit = () => {
    setNewTitle(title);
    setIsEditing(true);
  }

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
    <div className={`${styles.templateEditorHeader} ${className}`.trim()}>
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

      <div className={styles.pageheaderContainer}>
        {/* Title and description section */}
        <div className={styles.titleFormContainer}>
          <Form onSubmit={handleFormSubmit} className={styles.pageheaderTitleForm}>
            {isEditing ? (
              <FormInput
                name={title}
                type="text"
                label={labelText}
                value={newTitle}
                inputClasses={styles.titleChangeInput}
                placeholder={placeholder ?? Global('editTitle')}
                onChange={handleChange}
              />
            ) : (
              <div className={styles.pageheaderTitleContainer}>
                <h1 className={styles.pageheaderTitle}>{title}</h1>
                <Button
                  className="link"
                  onPress={handleEdit}
                >
                  {linkText ?? Global('links.editTitle')}
                </Button>
              </div>
            )}
            {isEditing && (
              <div className={styles.buttonContainer}>
                <Button type="submit" className="secondary" onPress={() => setIsEditing(false)}>{Global('buttons.cancel')}</Button>
                <Button type="submit" className="primary" data-testid="save-button">{Global('buttons.save')}</Button>
              </div>
            )}
            <p className={styles.pageheaderIntro}>
              {description}
              {descriptionAppend && <>{' '}{descriptionAppend}</>}
            </p>
          </Form>
        </div>

        {/* Actions slot - can contain one or multiple buttons */}
        {actions && (
          <div className={styles.headingButtonsActions}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeaderWithTitleChange;
