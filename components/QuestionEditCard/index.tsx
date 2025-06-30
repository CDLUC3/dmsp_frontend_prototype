import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from "react-aria-components";

// Utils
import { stripHtml } from "@/utils/general";
//Other
import styles from './QuestionEditCard.module.scss';

interface QuestionEditCardProps {
  id: string;
  text: string;
  link: string;
  name?: string;
  displayOrder?: number;
  handleDisplayOrderChange: (questionId: number, questionDisplayOrder: number) => void;
}

const QuestionEditCard: React.FC<QuestionEditCardProps> = ({
  id,
  text,
  link,
  name,
  displayOrder,
  handleDisplayOrderChange
}) => {

  const questionText = stripHtml(text);
  const questionId = Number(id);
  const questionDisplayOrder = Number(displayOrder);

  // Localization
  const EditQuestion = useTranslations('EditQuestion');

  // Added for accessibility
  const [announcement, setAnnouncement] = useState('');

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
    <div className={styles.questionEditCard} key={id} data-testid="question-edit-card">
      <div className={styles.questionEditCard__content}
        aria-labelledby={`question-${id}`}>
        <p className={styles.questionEditCard__label}
          id={`question-label-${id}`}>
          {EditQuestion('label.question')}
        </p>
        <div className={styles.questionEditCard__name} id={`question-${id}`}>
          <p>
            {questionText}
          </p>
        </div>
      </div>
      <div className={styles.questionEditCard__actions} role="group"
        aria-label="Question actions">
        <Link href={link} className={styles.questionEditCard__link}
          aria-label={`Edit question: ${name}`}>
          {EditQuestion('links.editQuestion')}
        </Link>
        <Button
          className={`${styles.btnDefault} ${styles.orderButton}`}
          aria-label={EditQuestion('buttons.moveUp', { name: text ?? '' })}
          onPress={() => handleDisplayOrderChange(questionId, questionDisplayOrder - 1)}
        >
          <UpArrowIcon />
        </Button>
        <Button
          className={`${styles.btnDefault} ${styles.orderButton}`}
          aria-label={EditQuestion('buttons.moveDown', { name: text ?? '' })}
          onPress={() => handleDisplayOrderChange(questionId, questionDisplayOrder + 1)}
        >
          <DownArrowIcon />
        </Button>
      </div>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>

  );
};

export default QuestionEditCard;