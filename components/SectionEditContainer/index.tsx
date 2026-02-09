import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import {
  Question,
  Section,
} from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';
import SectionHeaderEdit from '@/components/SectionHeaderEdit';
import QuestionEditCard from '@/components/QuestionEditCard';
import AddQuestionButton from '@/components/AddQuestionButton';
import { updateQuestionDisplayOrderAction } from './actions';

interface SectionEditContainerProps {
  section: Section;
  templateId: string | number;
  displayOrder: number;
  customizable?: boolean; // New prop to indicate if this is in a customizable template
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
  onMoveUp: (() => void) | undefined;
  onMoveDown: (() => void) | undefined;
}

type ExtendedQuestion = Question & {
  isCustomized?: boolean;
  customData?: {
    questionText?: string;
    guidanceText?: string;
  };
};

const SectionEditContainer: React.FC<SectionEditContainerProps> = ({
  section,
  templateId,
  displayOrder,
  customizable = false,
  setErrorMessages,
  onMoveUp,
  onMoveDown
}) => {
  const router = useRouter();
  const toastState = useToast();
  const t = useTranslations('Sections');
  const Global = useTranslations('Global');

  // Local state for optimistic updates
  const [localQuestions, setLocalQuestions] = useState<ExtendedQuestion[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Added for accessibility
  const [announcement, setAnnouncement] = useState('');

  // Memoize the sorted questions from passed section data
  const sortedQuestionsFromSection = useMemo(() => {
    if (!section?.questions) return [];
    return [...section.questions].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [section?.questions]);

  // Update local questions when section data changes
  useEffect(() => {
    if (sortedQuestionsFromSection.length > 0) {
      // Map questions to ExtendedQuestion type with isCustomized flag
      const extendedQuestions: ExtendedQuestion[] = sortedQuestionsFromSection.map(q => ({
        ...q,
        // Check if this question has the isCustomized flag from merging
        isCustomized: (q as any).isCustomized || false,
        customData: (q as any).isCustomized ? {
          questionText: q.questionText || undefined,
          guidanceText: (q as any).guidanceText || undefined,
        } : undefined
      }));
      setLocalQuestions(extendedQuestions);
    }
  }, [sortedQuestionsFromSection]);

  const sortQuestions = (questions: ExtendedQuestion[]) => {
    return [...questions].sort((a, b) => (a.displayOrder!) - (b.displayOrder!));
  };

  const validateQuestionMove = (questionId: number, newDisplayOrder: number): { isValid: boolean, message?: string } => {
    const currentQuestion = localQuestions.find(q => q.id === questionId);

    // If current question doesn't exist in localQuestions
    if (!currentQuestion || currentQuestion.displayOrder == null) {
      const errorMsg = t('messages.errors.updateDisplayOrderError');
      return { isValid: false, message: errorMsg }
    }

    // If new display order is zero
    const maxDisplayOrder = Math.max(...localQuestions.map(s => s.displayOrder!));
    if (newDisplayOrder < 1) {
      const errorMsg = t('messages.errors.displayOrderAlreadyAtTop');
      return { isValid: false, message: errorMsg }
    }

    // If new display order exceeds max number of questions
    if (newDisplayOrder > maxDisplayOrder) {
      const errorMsg = t('messages.errors.cannotMoveFurtherDown');
      return { isValid: false, message: errorMsg }
    }

    // If new display order is same as current one
    if (currentQuestion.displayOrder === newDisplayOrder) {
      const errorMsg = t('messages.errors.cannotMoveFurtherUpOrDown');
      return { isValid: false, message: errorMsg }
    }

    return { isValid: true };
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


  // Call Server Action updateQuestionDisplayOrder
  const updateDisplayOrder = async (questionId: number, newDisplayOrder: number) => {

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateQuestionDisplayOrderAction({
      questionId,
      newDisplayOrder
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

  const handleDisplayOrderChange = async (questionId: number, newDisplayOrder: number) => {
    setErrorMessages([]);
    console.log("Handle display order", { questionId, newDisplayOrder });

    if (isReordering) return;

    const { isValid, message } = validateQuestionMove(questionId, newDisplayOrder);
    if (!isValid && message) {
      toastState.add(message, { type: 'error' });
      return;
    }

    updateLocalQuestionOrder(questionId, newDisplayOrder);
    setIsReordering(true);

    try {
      const result = await updateDisplayOrder(questionId, newDisplayOrder);

      if (!result.success) {
        // On failure, revert by resetting from section prop
        if (section?.questions) {
          const resetQuestions = [...section.questions]
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map(q => ({
              ...q,
              isCustomized: (q as any).isCustomized || false,
              customData: (q as any).isCustomized ? {
                questionText: q.questionText || undefined,
                guidanceText: (q as any).guidanceText || undefined,
              } : undefined
            }));
          setLocalQuestions(resetQuestions);
        }

        const errors = result.errors;
        if (Array.isArray(errors)) {
          if (setErrorMessages) {
            setErrorMessages(errors.length > 0 ? errors : [Global('messaging.somethingWentWrong')])
          }
        }
      } else if (result.data?.errors?.general) {
        // Revert on server errors
        if (section?.questions) {
          const resetQuestions = [...section.questions]
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map(q => ({
              ...q,
              isCustomized: (q as any).isCustomized || false,
            }));
          setLocalQuestions(resetQuestions);
        }
        setErrorMessages(prev => [...prev, result.data?.errors?.general || t('messages.errors.updateQuestionOrder')]);
      }

      const focusedElement = document.activeElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }

      const message = t('messages.questionMoved', { displayOrder: newDisplayOrder })
      setAnnouncement(message);
    } catch {
      // Revert on error
      if (section?.questions) {
        const resetQuestions = [...section.questions]
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map(q => ({
            ...q,
            isCustomized: (q as any).isCustomized || false,
          }));
        setLocalQuestions(resetQuestions);
      }
      setErrorMessages(prev => [...prev, t('messages.errors.updateQuestionOrder')]);
    } finally {
      setIsReordering(false);
    }
  }

  if (!section) return <div>{t('messages.errors.failedToLoadSection')}</div>;

  return (
    <div role="list" aria-label="Questions list" style={{ marginBottom: '40px' }}>
      <div role="listitem">
        <SectionHeaderEdit
          key={section.id}
          sectionNumber={displayOrder}
          title={section.name}
          editUrl={customizable ? `/template/${templateId}/section/${section.id}/customize` : `/template/${templateId}/section/${section.id}`}
          customizable={customizable}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      </div>
      {localQuestions.map((question: ExtendedQuestion) => (
        <div key={question.id} role="listitem">
          <QuestionEditCard
            key={question.id}
            id={question.id ? question.id.toString() : ''}
            text={question.questionText || ''}
            link={customizable ? `/template/${templateId}/q/${question.id}/customize` : `/template/${templateId}/q/${question.id}`}
            displayOrder={Number(question.displayOrder)}
            handleDisplayOrderChange={handleDisplayOrderChange}
            questionAuthorType={question?.isCustomized ? "organization" : "funder"}
            customizable={customizable}
            isCustomized={question?.isCustomized}
            customData={question?.customData}
          />
        </div>
      ))}
      <div role="listitem">
        {customizable ? (
          <AddQuestionButton href={`/template/${templateId}/q/new/customize?section_id=${section.id}`} />
        ) : (
          <AddQuestionButton href={`/template/${templateId}/q/new?section_id=${section.id}`} />
        )}
      </div>
      <div aria-live="polite" aria-atomic="true" className="hidden-accessibly">
        {announcement}
      </div>
    </div>
  );
};

export default SectionEditContainer;