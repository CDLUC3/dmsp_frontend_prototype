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
    <div className="question-edit" key={id}>
      <div className="question-edit__content">
        <p className="question-edit__label">Question</p>
        <p className="question-edit__name">{name}</p>
      </div>
      <div className="question-edit__actions">
        <Link href={link} className="question-edit__link">
          Edit question
        </Link>

      </div>
    </div>
  );
};

export default QuestionEdit;
