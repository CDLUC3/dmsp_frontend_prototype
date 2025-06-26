import React from 'react';
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
  onMoveDown: (() => void) | undefined
}

const SectionEditContainer: React.FC<SectionEditContainerProps> = ({
  sectionId,
  templateId,
  setErrorMessages,
  onMoveUp,
  onMoveDown
}) => {
  const { data, loading, error, refetch } = useSectionQuery({
    variables: { sectionId: Number(sectionId) },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  if (loading) return <div>Loading section...</div>;
  if (error || !data?.section) return <div>Failed to load section.</div>;

  const section: Section = data.section;
  const sortedQuestions = section.questions
    ? [...section.questions].sort((a, b) => a.displayOrder! - b.displayOrder!)
    : [];

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
        {sortedQuestions.map((question: Question) => (
          <QuestionEditCard
            key={question.id}
            id={question.id ? question.id.toString() : ''}
            text={question.questionText || ''}
            link={`/template/${templateId}/q/${question.id}`}
            displayOrder={Number(question.displayOrder)}
            setErrorMessages={setErrorMessages}
            refetchSection={refetch} // Pass section-specific refetch
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