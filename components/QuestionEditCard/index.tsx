import React from 'react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import styles from './QuestionEditCard.module.scss';
import {Button} from "react-aria-components";
import {stripHtml} from "@/utils/general";

interface QuestionEditCardProps {
  id: string;
  text: string;
  link: string;
  name?: string;
}

const QuestionEditCard: React.FC<QuestionEditCardProps> = ({
 id,
 text,
 link,
 name
}) => {

  const questionText = stripHtml(text);
  const EditQuestion = useTranslations('EditQuestion');
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
    <div className={styles.questionEditCard} key={id} role="listitem">
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
        <Button className={`${styles.btnDefault} ${styles.orderButton}`}
                aria-label={EditQuestion('buttons.moveUp')}>
          <UpArrowIcon/>
        </Button>
        <Button className={`${styles.btnDefault} ${styles.orderButton}`}
                aria-label={EditQuestion('buttons.moveDown')}>
          <DownArrowIcon/>
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditCard;
