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
  /**Function to handle title change */
  handleTitleChange?: ((event: FormEvent<HTMLFormElement>) => void) | undefined;
  /**Function to handle input change */
  handleInputChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  /**New title */
  newTitle?: string;
}

const PageHeaderWithTitleChange: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  breadcrumbs,
  actions,
  className = '',
  handleInputChange,
  handleTitleChange,
  newTitle = '',
}: PageHeaderProps) => {

  const [isEditing, setIsEditing] = useState(false);
  const Global = useTranslations('Global');

  // const handleTitleChange = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   console.log('Title changed');
  // };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewTitle(e.target.value)
  // };

  useEffect(() => {
    document.title = `${title} | DMPTool`;
    window.scrollTo(0, 0);
  }, [title]);

  useEffect(() => {
    console.log("New Title:", newTitle);
  }, [newTitle]);

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
          <Form onSubmit={handleTitleChange}>
            {isEditing ? (
              <FormInput
                name={title}
                type="text"
                label="Template title"
                value={newTitle}
                inputClasses="titleChange-input"
                placeholder="Enter new template title"
                onChange={handleInputChange}
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
                <Button type="submit" className="primary">{Global('buttons.save')}</Button>
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
