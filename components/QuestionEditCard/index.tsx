import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "react-aria-components";

// Utils
import { stripHtml } from "@/utils/general";
//Other
import styles from "./QuestionEditCard.module.scss";

interface QuestionChecklist {
  requirements: boolean;
  guidance: boolean;
  sampleText: boolean;
}

interface QuestionEditCardProps {
  id: string;
  text: string;
  link: string;
  name?: string;
  displayOrder?: number;
  handleDisplayOrderChange: (questionId: number, questionDisplayOrder: number) => void;
  questionAuthorType?: "funder" | "organization" | null;
  checklist?: QuestionChecklist;
  customizable?: boolean; // New prop to indicate if this is in a customizable template
  isCustomized?: boolean; // New prop to indicate if this question has been customized
  customData?: {
    questionText?: string;
    guidanceText?: string;
  }; // Optional prop for customized question data
}

const QuestionEditCard: React.FC<QuestionEditCardProps> = ({
  id,
  text,
  link,
  name,
  displayOrder,
  handleDisplayOrderChange,
  questionAuthorType,
  checklist,
  customizable = false,
  isCustomized = false,
  customData
}) => {
  // Use customized text if available, otherwise use original
  const displayText = isCustomized && customData?.questionText
    ? customData.questionText
    : text;

  const questionText = stripHtml(displayText);
  const questionId = Number(id);
  const questionDisplayOrder = Number(displayOrder);

  // Localization
  const EditQuestion = useTranslations("EditQuestion");
  const Global = useTranslations("Global");

  // Determine eyebrow heading based on questionAuthorType
  const getEyebrowText = () => {
    switch (questionAuthorType) {
      case "funder":
        return EditQuestion("label.funderQuestion");
      case "organization":
        return EditQuestion("label.organizationQuestion");
      default:
        return EditQuestion("label.question");
    }
  };

  // Determine card styling class
  const getCardClassName = () => {
    const classes = [styles.questionEditCard];

    if (isCustomized) {
      classes.push(styles.customizedQuestion);
    } else if (isOrganizationQuestion) {
      classes.push(styles.organizationQuestion);
    }

    return classes.join(' ');
  };

  // Determine if this is an organization question for styling
  const isOrganizationQuestion = questionAuthorType === "organization";

  // Determine link text based on questionAuthorType
  const getLinkText = () => {
    if (isCustomized) {
      return Global("buttons.edit");
    }
    if (customizable) {
      return EditQuestion("links.customizeQuestion");
    }
    return EditQuestion("links.editQuestion");
  };


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
    <div
      className={getCardClassName()}
      key={id}
      data-testid="question-edit-card"
    >
      <div
        className={styles.questionEditCard__content}
        aria-labelledby={`question-${id}`}
      >
        <div className={styles.questionEditCard__header}>
          <p
            className={styles.questionEditCard__label}
            id={`question-label-${id}`}
          >
            {getEyebrowText()}
          </p>
        </div>
        <div
          className={styles.questionEditCard__name}
          id={`question-${id}`}
        >
          <p>{questionText}</p>
        </div>
        {checklist && (
          <div
            className={styles.questionEditCard__checklist}
            role="group"
            aria-label="Question customization options"
          >
            <div className={`${styles.checklistItem} ${!checklist.requirements ? styles.unchecked : ""}`}>
              <span
                className={`${styles.checkIcon} ${checklist.requirements ? styles.checked : styles.unchecked}`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className={styles.checkLabel}>
                {EditQuestion("checklist.requirements")}
                <span className="hidden-accessibly">
                  {checklist.requirements
                    ? EditQuestion("checklist.completed")
                    : EditQuestion("checklist.notCompleted")}
                </span>
              </span>
            </div>
            <div className={`${styles.checklistItem} ${!checklist.guidance ? styles.unchecked : ""}`}>
              <span
                className={`${styles.checkIcon} ${checklist.guidance ? styles.checked : styles.unchecked}`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className={styles.checkLabel}>
                {EditQuestion("checklist.guidance")}
                <span className="hidden-accessibly">
                  {checklist.guidance ? EditQuestion("checklist.completed") : EditQuestion("checklist.notCompleted")}
                </span>
              </span>
            </div>
            <div className={`${styles.checklistItem} ${!checklist.sampleText ? styles.unchecked : ""}`}>
              <span
                className={`${styles.checkIcon} ${checklist.sampleText ? styles.checked : styles.unchecked}`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className={styles.checkLabel}>
                {EditQuestion("checklist.sampleText")}
                <span className="hidden-accessibly">
                  {checklist.sampleText ? EditQuestion("checklist.completed") : EditQuestion("checklist.notCompleted")}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div
        className={styles.questionEditCard__actions}
        role="group"
        aria-label="Question actions"
      >
        <Link
          href={link}
          className={styles.questionEditCard__link}
          aria-label={`${getLinkText()}: ${name}`}
        >
          {getLinkText()}
        </Link>
        {(!customizable || isCustomized) && (
          <div className={styles.orderButtons}>
            <Button
              className={`${styles.btnDefault} ${styles.orderButton}`}
              aria-label={EditQuestion("buttons.moveUp", { name: text })}
              onPress={() => handleDisplayOrderChange(questionId, questionDisplayOrder - 1)}
            >
              <UpArrowIcon />
            </Button>
            <Button
              className={`${styles.btnDefault} ${styles.orderButton}`}
              aria-label={EditQuestion("buttons.moveDown", { name: text })}
              onPress={() => handleDisplayOrderChange(questionId, questionDisplayOrder + 1)}
            >
              <DownArrowIcon />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuestionEditCard;
