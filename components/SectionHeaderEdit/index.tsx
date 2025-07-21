import React from 'react';
import { useTranslations } from 'next-intl';
import styles from './SectionHeaderEdit.module.scss';
import { Button } from "react-aria-components";

interface SectionHeaderEditProps {
  title: string;
  sectionNumber: number;
  editUrl: string;
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
}

const SectionHeaderEdit: React.FC<SectionHeaderEditProps> = ({
  title,
  sectionNumber,
  editUrl,
  onMoveUp,
  onMoveDown
}) => {
  const Sections = useTranslations('Sections');
  const UpArrowIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 15L12 9L6 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const DownArrowIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );


  return (
    <div className={styles.sectionHeader} data-testid="section-edit-card">
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionNumber}>{Sections('labels.section')} {sectionNumber} </span>
        {title}
      </h2>
      <div className={styles.buttonGroup}>
        <a href={editUrl} className={styles.editButton}>{Sections('links.editSection')}</a>
        {onMoveUp && (
          <Button className={`${styles.btnDefault} ${styles.orderButton}`}
            onPress={onMoveUp}
            aria-label={Sections('buttons.moveUp', { title })}>
            <UpArrowIcon />
          </Button>
        )}

        {onMoveDown && (
          <Button className={`${styles.btnDefault} ${styles.orderButton}`}
            onPress={onMoveDown}
            aria-label={Sections('buttons.moveDown', { title })}>
            <DownArrowIcon />
          </Button>
        )}

      </div>
    </div>

  );
};

export default SectionHeaderEdit;
