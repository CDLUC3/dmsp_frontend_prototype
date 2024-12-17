import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './AddSectionButton.module.scss';
import { Button } from "react-aria-components";

interface AddSectionButtonProps {
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  href?: string;
  className?: string;
}

const AddSectionButton: React.FC<AddSectionButtonProps> = ({
  onClick,
  href = '#',
  className = '',
}) => {
  const Sections = useTranslations('Sections');

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <a
        href={href}
        className={styles.link}
        onClick={handleClick}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>{Sections('links.addSection')}</span>
      </a>
    </div>
  );
};


<div className="section-add-cont">
  <Button
    className="add-section-button tertiary"
  >
    + Add new section
  </Button>
</div>

export default AddSectionButton;
