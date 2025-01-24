'use client';

import QuestionEdit from '@/components/QuestionEdit';

const QuestionEditPage: React.FC = () => {
  return (
    /* We share this QuestionEdit form between adding a new question, or modifying an existing one*/
    <QuestionEdit />
  );
}

export default QuestionEditPage;
