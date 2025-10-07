import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/context/ToastContext";
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEditCard from "@/components/QuestionEditCard";
import AddQuestionButton from "@/components/AddQuestionButton";
import { MockQuestion, MockSection } from "./mockData";

// Mock data types are now imported from mockData.ts

interface AdminSectionEditContainerProps {
  section: MockSection;
  templateId: string | number;
  setErrorMessages: React.Dispatch<React.SetStateAction<string[]>>;
  onMoveUp: (() => void) | undefined;
  onMoveDown: (() => void) | undefined;
}

const AdminSectionEditContainer: React.FC<AdminSectionEditContainerProps> = ({
  section,
  templateId,
  setErrorMessages,
  onMoveUp,
  onMoveDown,
}) => {
  const toastState = useToast();
  const t = useTranslations("Sections");
  const Global = useTranslations("Global");

  // Local state for optimistic updates
  const [localQuestions, setLocalQuestions] = useState<MockQuestion[]>(section.questions);
  const [isReordering, setIsReordering] = useState(false);

  // Added for accessibility
  const [announcement, setAnnouncement] = useState("");

  const sortQuestions = (questions: MockQuestion[]) => {
    return [...questions].sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const validateQuestionMove = (
    questionId: string,
    newDisplayOrder: number,
  ): { isValid: boolean; message?: string } => {
    const currentQuestion = localQuestions.find((q) => q.id === questionId);

    // If current question doesn't exist in localQuestions
    if (!currentQuestion) {
      const errorMsg = t("messages.errors.updateDisplayOrderError");
      return { isValid: false, message: errorMsg };
    }

    // If new display order is zero
    const maxDisplayOrder = Math.max(...localQuestions.map((q) => q.displayOrder));
    if (newDisplayOrder < 1) {
      const errorMsg = t("messages.errors.displayOrderAlreadyAtTop");
      return { isValid: false, message: errorMsg };
    }

    // If new display order exceeds max number of questions
    if (newDisplayOrder > maxDisplayOrder) {
      const errorMsg = t("messages.errors.cannotMoveFurtherDown");
      return { isValid: false, message: errorMsg };
    }

    // If new display order is same as current one
    if (currentQuestion.displayOrder === newDisplayOrder) {
      const errorMsg = t("messages.errors.cannotMoveFurtherUpOrDown");
      return { isValid: false, message: errorMsg };
    }

    return { isValid: true };
  };

  // Optimistic update function
  const updateLocalQuestionOrder = (questionId: string, newDisplayOrder: number) => {
    setLocalQuestions((prevQuestions) => {
      const updatedQuestions = prevQuestions.map((question) => {
        if (question.id === questionId) {
          return { ...question, displayOrder: newDisplayOrder };
        }
        // Adjust other questions' display orders
        const currentOrder = question.displayOrder;
        const oldOrder = prevQuestions.find((q) => q.id === questionId)?.displayOrder || 0;

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
        return question;
      });

      return sortQuestions(updatedQuestions);
    });
  };

  // Mock update function (no server call)
  const updateDisplayOrder = async (_questionId: string, _newDisplayOrder: number) => {
    // Simulate server delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock success response
    return {
      success: true,
      errors: [] as string[],
      data: null as { errors?: { general?: string } } | null,
    };
  };

  const handleDisplayOrderChange = async (questionId: string, newDisplayOrder: number) => {
    // Remove all current errors
    setErrorMessages([]);

    if (isReordering) return; // Prevent concurrent operations

    const { isValid, message } = validateQuestionMove(questionId, newDisplayOrder);
    if (!isValid && message) {
      // Deliver toast error messages
      toastState.add(message, { type: "error" });
      return;
    }

    // First, optimistically update the UI immediately for smoother reshuffling
    updateLocalQuestionOrder(questionId, newDisplayOrder);
    setIsReordering(true);

    try {
      const result = await updateDisplayOrder(questionId, newDisplayOrder);

      if (!result.success) {
        // Revert optimistic update on failure
        setLocalQuestions(section.questions); // Reset to original
        const errors = result.errors;

        //Check if errors is an array or an object
        if (Array.isArray(errors)) {
          if (setErrorMessages) {
            setErrorMessages(errors.length > 0 ? errors : [Global("messaging.somethingWentWrong")]);
          }
        }
      } else if (result.data && typeof result.data === "object" && "errors" in result.data) {
        // Revert on server errors
        setLocalQuestions(section.questions); // Reset to original
        const serverErrors = result.data.errors as { general?: string };
        setErrorMessages((prev) => [...prev, serverErrors.general || t("messages.errors.updateQuestionOrder")]);
      }

      // Scroll user to the reordered section
      const focusedElement = document.activeElement;

      // Check if an element is actually focused
      if (focusedElement) {
        // Scroll the focused element into view
        focusedElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }

      // After successful update
      const message = t("messages.questionMoved", { displayOrder: newDisplayOrder });
      setAnnouncement(message);
    } catch {
      // Revert optimistic update on network error
      setLocalQuestions(section.questions); // Reset to original
      setErrorMessages((prev) => [...prev, t("messages.errors.updateQuestionOrder")]);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <>
      <div
        role="list"
        aria-label="Questions list"
        style={{ marginBottom: "40px" }}
      >
        <div role="listitem">
          <SectionHeaderEdit
            key={section.id}
            sectionNumber={section.sectionNumber}
            title={section.title}
            editUrl={section.editUrl}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            sectionAuthorType={section.sectionAuthorType}
            checklist={section.checklist}
          />
        </div>
        {localQuestions.map((question: MockQuestion) => (
          <div
            key={question.id}
            role="listitem"
          >
            <QuestionEditCard
              key={question.id}
              id={question.id}
              text={question.text}
              link={question.link}
              name={question.name}
              displayOrder={question.displayOrder}
              handleDisplayOrderChange={(questionId: number, newDisplayOrder: number) =>
                handleDisplayOrderChange(questionId.toString(), newDisplayOrder)
              }
              questionAuthorType={question.questionAuthorType}
              checklist={question.checklist}
            />
          </div>
        ))}
        <div role="listitem">
          <AddQuestionButton href={`/template/${templateId}/q/new?section_id=${section.id}`} />
        </div>
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="hidden-accessibly"
      >
        {announcement}
      </div>
    </>
  );
};

export default AdminSectionEditContainer;
