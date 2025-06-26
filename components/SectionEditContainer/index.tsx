import React, { useState, useEffect, useMemo } from 'react';
import {
  useSectionQuery,
  Section,
  Question,
} from '@/generated/graphql';
import SectionHeaderEdit from '@/components/SectionHeaderEdit';
import QuestionEditCard from '@/components/QuestionEditCard';
import AddQuestionButton from '@/components/AddQuestionButton';

interface SectionEditContainerProps {
  sectionId: number;
  templateId: string | number;
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
  onMoveUp: (() => void) | undefined;
  onMoveDown: (() => void) | undefined;
}

const SectionEditContainer: React.FC<SectionEditContainerProps> = ({
  sectionId,
  templateId,
  setErrorMessages,
  onMoveUp,
  onMoveDown
}) => {
  const { data, loading, error } = useSectionQuery({
    variables: { sectionId: Number(sectionId) },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  // Local state for optimistic updates
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);

  // Memoize the sorted questions to prevent unnecessary re-renders
  const sortedQuestionsFromData = useMemo(() => {
    if (!data?.section?.questions) return [];
    return [...data.section.questions].sort((a, b) => a.displayOrder! - b.displayOrder!);
  }, [data?.section?.questions]);

  // Update local questions when data changes
  useEffect(() => {
    if (sortedQuestionsFromData.length > 0) {
      setLocalQuestions(sortedQuestionsFromData);
    }
  }, [sortedQuestionsFromData]);

  const sortQuestions = (questions: Question[]) => {
    return [...questions].sort((a, b) => (a.displayOrder!) - (b.displayOrder!));
  };

  // Optimistic update function
  const updateLocalQuestionOrder = (questionId: number, newDisplayOrder: number) => {
    setLocalQuestions(prevQuestions => {
      const updatedQuestions = prevQuestions.map(question => {
        if (question.id === questionId) {
          return { ...question, displayOrder: newDisplayOrder };
        }
        // Adjust other questions' display orders
        if (question.displayOrder != null) {
          const currentOrder = question.displayOrder;
          const oldOrder = prevQuestions.find(q => q.id === questionId)?.displayOrder || 0;

          if (newDisplayOrder > oldOrder) {
            // Moving down: shift questions up
            if (currentOrder > oldOrder && currentOrder <= newDisplayOrder) {
              return { ...question, displayOrder: currentOrder - 1 };
            }
          } else {
            // Moving up: shift questions down  
            if (currentOrder >= newDisplayOrder && currentOrder < oldOrder) {
              return { ...question, displayOrder: currentOrder + 1 };
            }
          }
        }
        return question;
      });

      return sortQuestions(updatedQuestions);
    });
  };

  if (loading) return <div>Loading section...</div>;
  if (error || !data?.section) return <div>Failed to load section.</div>;

  const section: Section = data.section;

  return (
    <div role="list" aria-label="Questions list" style={{ marginBottom: '40px' }}>
      <div role="listitem">
        <SectionHeaderEdit
          key={section.id}
          sectionNumber={section.displayOrder!}
          title={section.name}
          editUrl={`/template/${templateId}/section/${section.id}`}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      </div>
      <div role="listitem">
        {localQuestions.map((question: Question) => (
          <QuestionEditCard
            key={question.id}
            id={question.id ? question.id.toString() : ''}
            text={question.questionText || ''}
            link={`/template/${templateId}/q/${question.id}`}
            displayOrder={Number(question.displayOrder)}
            setErrorMessages={setErrorMessages}
            onOptimisticUpdate={updateLocalQuestionOrder}
          />
        ))}
      </div>
      <div role="listitem">
        <AddQuestionButton href={`/template/${templateId}/q/new?section_id=${section.id}`} />
      </div>
    </div>
  );
};

export default SectionEditContainer;