import React from 'react';
import Link from 'next/link'; // Assuming you're using Next.js for routing
import './QuestionEdit.scss';

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
      </div>
    </div>
  );
};

export default QuestionEdit;
