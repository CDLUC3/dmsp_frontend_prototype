import React from 'react';
import Link from 'next/link'; // Assuming you're using Next.js for routing
import './QuestionEdit.scss';
import {Button} from "react-aria-components";

interface QuestionEditProps {
  id: string;
  name: string;
  link: string;
}

const QuestionEdit: React.FC<QuestionEditProps> = ({
                                                     id,
                                                     name,
                                                     link
                                                   }) => {

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
      className="question-edit"
      key={id}
      role="listitem"
    >
      <div
        className="question-edit__content"
        aria-labelledby={`question-${id}`}
      >
        <p
          className="question-edit__label"
          id={`question-label-${id}`}
        >
          Question
        </p>
        <p
          className="question-edit__name"
          id={`question-${id}`}
        >
          {name}
        </p>
      </div>
      <div
        className="question-edit__actions"
        role="group"
        aria-label="Question actions"
      >
        <Link
          href={link}
          className="question-edit__link"
          aria-label={`Edit question: ${name}`}
        >
          Edit question
        </Link>
        <Button className="btn-default order-button"
                aria-label="Move question up">
          <UpArrowIcon/>
        </Button>
        <Button className="btn-default  order-button"
                aria-label="Move question down">
          <DownArrowIcon/>
        </Button>
      </div>
    </div>
  );
};

export default QuestionEdit;
