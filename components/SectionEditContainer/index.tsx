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
}

const SectionEditContainer: React.FC<SectionEditContainerProps> = ({
  sectionId,
  templateId,
  setErrorMessages,
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
    ? [...section.questions].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    : [];

  return (
    <div key={section.id} role="list" aria-label="Questions list" style={{ marginBottom: '40px' }}>
      <SectionHeaderEdit
        sectionNumber={section.displayOrder ?? 0}
        title={section.name}
        editUrl={`/template/${templateId}/section/${section.id}`}
        onMoveUp={() => null}
        onMoveDown={() => null}
      />
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
      <AddQuestionButton href={`/template/${templateId}/q/new?section_id=${section.id}`} />
    </div>
  );
};

export default SectionEditContainer;