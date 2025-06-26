import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "react-aria-components";

// Utils
import { stripHtml } from "@/utils/general";
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
//Other
import { updateQuestionDisplayOrderAction } from './actions';
import styles from './QuestionEditCard.module.scss';

interface QuestionEditCardProps {
  id: string;
  text: string;
  link: string;
  name?: string;
  displayOrder?: number;
  setErrorMessages?: React.Dispatch<React.SetStateAction<string[]>>;
  onOptimisticUpdate?: (questionId: number, newDisplayOrder: number) => void; // New prop
}

const QuestionEditCard: React.FC<QuestionEditCardProps> = ({
  id,
  text,
  link,
  name,
  displayOrder,
  setErrorMessages,
  onOptimisticUpdate
}) => {

  const questionText = stripHtml(text);
  const questionId = Number(id);
  const questionDisplayOrder = Number(displayOrder);
  // Get templateId param
  const params = useParams();
  const router = useRouter();
  const templateId = String(params.templateId);

  // Localization
  const EditQuestion = useTranslations('EditQuestion');
  const Global = useTranslations('Global');

  const generalErrorMessage = Global('messaging.somethingWentWrong');

  // Added for accessibility
  const [announcement, setAnnouncement] = useState('');

  // Call Server Action updateQuestionDisplayOrder
  const updateDisplayOrder = async (questionId: number, newDisplayOrder: number) => {

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateQuestionDisplayOrderAction({
      questionId: questionId,
      newDisplayOrder: newDisplayOrder
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  }

  const handleDisplayOrderChange = async (newDisplayOrder: number) => {
    // If new display order is less than 1 then just return
    if (newDisplayOrder < 1) {
      console.log("Will call setErrorMessages")
      if (setErrorMessages) {
        setErrorMessages(prev => [...prev, generalErrorMessage]);
      }
      return;
    }

    // First, optimistically update the UI immediately for smoother reshuffling
    if (onOptimisticUpdate) {
      onOptimisticUpdate(questionId, newDisplayOrder);
    }

    const result = await updateDisplayOrder(
      questionId,
      newDisplayOrder
    );

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        if (setErrorMessages) {
          setErrorMessages(errors.length > 0 ? errors : [generalErrorMessage])
        }
      }

    } else {
      if (
        result.data?.errors &&
        typeof result.data.errors === 'object' &&
        typeof result.data.errors.general === 'string') {
        if (setErrorMessages) {
          // Handle errors as an object with general or field-level errors
          setErrorMessages(prev => [...prev, result.data?.errors?.general || generalErrorMessage]);
        }
      }
      // After successful update
      const message = EditQuestion('messages.questionMoved', { displayOrder: newDisplayOrder })
      setAnnouncement(message);
    }
  }

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
          aria-label={EditQuestion('buttons.moveUp', { name: name ?? '' })}
          onPress={() => handleDisplayOrderChange(questionDisplayOrder - 1)}
        >
          <UpArrowIcon />
        </Button>
        <Button
          className={`${styles.btnDefault} ${styles.orderButton}`}
          aria-label={EditQuestion('buttons.moveDown', { name: name ?? '' })}
          onPress={() => handleDisplayOrderChange(questionDisplayOrder + 1)}
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