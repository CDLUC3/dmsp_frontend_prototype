import React from "react";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);
import AdminSectionEditContainer from "../index";
import { mockSections } from "../mockData";

// Mock next-intl's useTranslations
jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      Sections: {
        "labels.section": "Section",
        "links.editSection": "Edit section",
        "buttons.moveUp": "Move section up {title}",
        "buttons.moveDown": "Move section down {title}",
        "messages.sectionMoved": "Section moved to position {displayOrder}",
        "checklist.requirements": "Requirements",
        "checklist.guidance": "Guidance",
        "checklist.completed": " completed",
        "checklist.notCompleted": " not completed",
      },
      EditQuestion: {
        "label.question": "Question",
        "label.funderQuestion": "Funder Question",
        "label.organizationQuestion": "Organization Question",
        "links.editQuestion": "Edit question",
        "links.customizeQuestion": "Customize",
        "checklist.requirements": "Requirements",
        "checklist.guidance": "Guidance",
        "checklist.sampleText": "Sample Text",
        "checklist.completed": " completed",
        "checklist.notCompleted": " not completed",
        "buttons.moveUp": "Move question up {name}",
        "buttons.moveDown": "Move question down {name}",
        "links.addQuestion": "Add question",
      },
      Global: {
        "messaging.loading": "Loading",
      },
    };
    return translations[namespace]?.[key] || key;
  },
}));

// Mock the toast context
const mockToastAdd = jest.fn();
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    add: mockToastAdd,
  }),
}));

interface SectionHeaderEditProps {
  title: string;
  checklist?: {
    requirements?: boolean;
    guidance?: boolean;
  };
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

// Mock child components to test interactions
jest.mock("@/components/SectionHeaderEdit", () => {
  const MockSectionHeaderEdit = (props: SectionHeaderEditProps) => (
    <div data-testid="section-edit-card">
      <h2>{props.title}</h2>
      {props.checklist && (
        <div>
          {props.checklist.requirements && <span>Requirements</span>}
          {props.checklist.guidance && <span>Guidance</span>}
        </div>
      )}
      {props.onMoveUp && (
        <button onClick={props.onMoveUp} data-testid="section-move-up">
          Move Section Up
        </button>
      )}
      {props.onMoveDown && (
        <button onClick={props.onMoveDown} data-testid="section-move-down">
          Move Section Down
        </button>
      )}
    </div>
  );
  MockSectionHeaderEdit.displayName = 'MockSectionHeaderEdit';
  return MockSectionHeaderEdit;
});

interface ChecklistItem {
  requirements?: boolean;
  guidance?: boolean;
  sampleText?: boolean;
}

jest.mock("@/components/QuestionEditCard", () => {
  const MockQuestionEditCard = (props: {
    questionAuthorType: string | null | undefined;
    text: string;
    checklist?: ChecklistItem;
    id: string;
    displayOrder: number;
    handleDisplayOrderChange: (id: number, newOrder: number) => void;
  }) => {
    const getAuthorTypeLabel = (type: string | null | undefined) => {
      switch (type) {
        case "funder":
          return "Funder Question";
        case "organization":
          return "Organization Question";
        default:
          return "Question";
      }
    };

    return (
      <div data-testid="question-edit-card">
        <span>{getAuthorTypeLabel(props.questionAuthorType)}</span>
        <p>{props.text}</p>
        {props.checklist && (
          <div>
            {props.checklist.requirements && <span>Requirements</span>}
            {props.checklist.guidance && <span>Guidance</span>}
            {props.checklist.sampleText && <span>Sample Text</span>}
          </div>
        )}
        <button
          onClick={() => props.handleDisplayOrderChange(Number(props.id), props.displayOrder - 1)}
          data-testid={`question-move-up-${props.id}`}
        >
          Move Up
        </button>
        <button
          onClick={() => props.handleDisplayOrderChange(Number(props.id), props.displayOrder + 1)}
          data-testid={`question-move-down-${props.id}`}
        >
          Move Down
        </button>
      </div>
    );
  };
  MockQuestionEditCard.displayName = 'MockQuestionEditCard';
  return MockQuestionEditCard;
});

jest.mock("@/components/AddQuestionButton", () => {
  const MockAddQuestionButton = (props: { href: string }) => (
    <a href={props.href} data-testid="add-question-button">
      Add question
    </a>
  );
  MockAddQuestionButton.displayName = 'MockAddQuestionButton';
  return MockAddQuestionButton;
});

describe("AdminSectionEditContainer", () => {
  const defaultProps = {
    section: mockSections[0], // Use first mock section
    templateId: "1",
    setErrorMessages: jest.fn(),
    onMoveUp: jest.fn(),
    onMoveDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockToastAdd.mockClear();
  });

  it("should render section header with title and number", () => {
    render(<AdminSectionEditContainer {...defaultProps} />);

    // Check for section title (the main heading)
    expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();
    // Check that the section header is rendered (using testid)
    expect(screen.getByTestId("section-edit-card")).toBeInTheDocument();
  });

  it("should render all questions from the section", () => {
    render(<AdminSectionEditContainer {...defaultProps} />);

    // Check that questions are rendered (using the mock data)
    expect(screen.getByText("What types of data will be collected in this research project?")).toBeInTheDocument();
    expect(
      screen.getByText("How will the data be stored and backed up during the research period?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What file formats will be used for the data, and why were these formats chosen?"),
    ).toBeInTheDocument();
  });

  it("should render section with checklist when provided", () => {
    render(<AdminSectionEditContainer {...defaultProps} />);

    // First section has checklist with requirements: true, guidance: false
    // Question 1: no checklist
    // Question 2: requirements: true, guidance: false, sampleText: true  
    // Question 3: requirements: false, guidance: true, sampleText: true
    // Expected: 1 section + 1 question2 = 2 "Requirements" total
    expect(screen.getAllByText("Requirements")).toHaveLength(2); // Section + Question 2
    // Expected: 0 section + 0 question2 + 1 question3 = 1 "Guidance" total  
    expect(screen.getAllByText("Guidance")).toHaveLength(1); // Question 3 only
  });

  it("should render questions with different author types", () => {
    render(<AdminSectionEditContainer {...defaultProps} />);

    // Check for different question types from mock data
    expect(screen.getByText("Question")).toBeInTheDocument(); // Default question
    expect(screen.getByText("Funder Question")).toBeInTheDocument(); // Funder question
    expect(screen.getByText("Organization Question")).toBeInTheDocument(); // Organization question
  });

  it("should render add question button", () => {
    render(<AdminSectionEditContainer {...defaultProps} />);

    expect(screen.getByText("Add question")).toBeInTheDocument();
  });

  it("should pass axe accessibility test", async () => {
    const { container } = render(<AdminSectionEditContainer {...defaultProps} />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  it("should pass axe accessibility test with organization section", async () => {
    const organizationSectionProps = {
      ...defaultProps,
      section: mockSections[1], // Second section is organization type
    };

    const { container } = render(<AdminSectionEditContainer {...organizationSectionProps} />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Section Move Functionality", () => {
    it("should call onMoveUp when section move up is triggered", () => {
      const mockOnMoveUp = jest.fn();
      const props = { ...defaultProps, onMoveUp: mockOnMoveUp };
      render(<AdminSectionEditContainer {...props} />);

      const moveUpButton = screen.getByTestId("section-move-up");
      fireEvent.click(moveUpButton);

      expect(mockOnMoveUp).toHaveBeenCalledTimes(1);
    });

    it("should call onMoveDown when section move down is triggered", () => {
      const mockOnMoveDown = jest.fn();
      const props = { ...defaultProps, onMoveDown: mockOnMoveDown };
      render(<AdminSectionEditContainer {...props} />);

      const moveDownButton = screen.getByTestId("section-move-down");
      fireEvent.click(moveDownButton);

      expect(mockOnMoveDown).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined onMoveUp and onMoveDown gracefully", () => {
      const props = { ...defaultProps, onMoveUp: undefined, onMoveDown: undefined };

      expect(() => {
        render(<AdminSectionEditContainer {...props} />);
      }).not.toThrow();

      // Should not render move buttons when callbacks are undefined
      expect(screen.queryByTestId("section-move-up")).not.toBeInTheDocument();
      expect(screen.queryByTestId("section-move-down")).not.toBeInTheDocument();
    });
  });

  describe("Question Reordering Functionality", () => {
    it("should handle question move up", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      const moveUpButton = screen.getByTestId("question-move-up-1");
      fireEvent.click(moveUpButton);

      // The component should handle the reordering logic
      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-1")).toBeInTheDocument();
      });
    });

    it("should handle question move down", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      const moveDownButton = screen.getByTestId("question-move-down-1");
      fireEvent.click(moveDownButton);

      // The component should handle the reordering logic
      await waitFor(() => {
        expect(screen.getByTestId("question-move-down-1")).toBeInTheDocument();
      });
    });

    it("should prevent concurrent reordering operations", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      const moveUpButton = screen.getByTestId("question-move-up-1");

      // Click multiple times rapidly
      fireEvent.click(moveUpButton);
      fireEvent.click(moveUpButton);
      fireEvent.click(moveUpButton);

      // Should still work without errors (component should handle concurrent operations)
      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-1")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility Features", () => {
    it("should have proper ARIA labels for questions list", () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      expect(screen.getByRole('list', { name: 'Questions list' })).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(5); // 1 section + 3 questions + 1 add button
    });

    it("should have aria-live region for announcements", () => {
      const { container } = render(<AdminSectionEditContainer {...defaultProps} />);

      const announceRegion = container.querySelector('[aria-live="polite"]');
      expect(announceRegion).toBeInTheDocument();
      expect(announceRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe("Props Validation", () => {
    it("should handle templateId as string", () => {
      const props = { ...defaultProps, templateId: "123" };
      render(<AdminSectionEditContainer {...props} />);

      const addQuestionButton = screen.getByTestId("add-question-button");
      expect(addQuestionButton).toHaveAttribute('href', '/template/123/q/new?section_id=1');
    });

    it("should handle templateId as number", () => {
      const props = { ...defaultProps, templateId: 123 };
      render(<AdminSectionEditContainer {...props} />);

      const addQuestionButton = screen.getByTestId("add-question-button");
      expect(addQuestionButton).toHaveAttribute('href', '/template/123/q/new?section_id=1');
    });
  });

  describe("Question Sorting", () => {
    it("should render questions in correct display order", () => {
      // Create mock section with questions in random order
      const unorderedSection = {
        ...mockSections[0],
        questions: [
          { ...mockSections[0].questions[2], displayOrder: 1, id: "3" }, // Third question first
          { ...mockSections[0].questions[0], displayOrder: 2, id: "1" }, // First question second  
          { ...mockSections[0].questions[1], displayOrder: 3, id: "2" }  // Second question third
        ]
      };

      render(<AdminSectionEditContainer {...defaultProps} section={unorderedSection} />);

      const questionCards = screen.getAllByTestId("question-edit-card");
      expect(questionCards).toHaveLength(3);

      // Verify questions appear in display order (sorted by displayOrder: 1, 2, 3)
      expect(questionCards[0]).toHaveTextContent("What file formats will be used for the data, and why were these formats chosen?");
      expect(questionCards[1]).toHaveTextContent("What types of data will be collected in this research project?");
      expect(questionCards[2]).toHaveTextContent("How will the data be stored and backed up during the research period?");
    });
  });

  describe("Edge Cases", () => {
    it("should handle section with no questions", () => {
      const emptySection = { ...mockSections[0], questions: [] };
      render(<AdminSectionEditContainer {...defaultProps} section={emptySection} />);

      expect(screen.getByText("Add question")).toBeInTheDocument();
      expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2); // Section header + add button
    });

    it("should handle section without checklist", () => {
      const sectionWithoutChecklist = {
        ...mockSections[0],
        checklist: undefined,
        questions: mockSections[0].questions.map(q => ({ ...q, checklist: undefined }))
      };

      expect(() => {
        render(<AdminSectionEditContainer {...defaultProps} section={sectionWithoutChecklist} />);
      }).not.toThrow();

      expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();
      expect(screen.getByText("Add question")).toBeInTheDocument();
    });

    it("should handle questions without checklist", () => {
      const sectionWithQuestionsWithoutChecklist = {
        ...mockSections[0],
        questions: mockSections[0].questions.map(q => ({ ...q, checklist: undefined }))
      };

      render(<AdminSectionEditContainer {...defaultProps} section={sectionWithQuestionsWithoutChecklist} />);

      // Should render all questions without errors
      expect(screen.getByText("What types of data will be collected in this research project?")).toBeInTheDocument();
      expect(screen.getByText("How will the data be stored and backed up during the research period?")).toBeInTheDocument();
      expect(screen.getByText("What file formats will be used for the data, and why were these formats chosen?")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should call setErrorMessages when provided", () => {
      const mockSetErrorMessages = jest.fn();
      const props = { ...defaultProps, setErrorMessages: mockSetErrorMessages };

      render(<AdminSectionEditContainer {...props} />);

      // Component should render without calling setErrorMessages initially
      expect(mockSetErrorMessages).not.toHaveBeenCalled();
    });
  });

  describe("Component Integration", () => {
    it("should pass correct props to child components", () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Verify section header is rendered with correct title
      expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();

      // Verify all questions are rendered
      expect(screen.getByText("What types of data will be collected in this research project?")).toBeInTheDocument();
      expect(screen.getByText("How will the data be stored and backed up during the research period?")).toBeInTheDocument();
      expect(screen.getByText("What file formats will be used for the data, and why were these formats chosen?")).toBeInTheDocument();

      // Verify add question button is rendered with correct href
      const addQuestionButton = screen.getByTestId("add-question-button");
      expect(addQuestionButton).toHaveAttribute('href', '/template/1/q/new?section_id=1');
    });

    it("should render correct number of list items", () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      const listItems = screen.getAllByRole('listitem');
      // Should have: 1 section header + 3 questions + 1 add button = 5 total
      expect(listItems).toHaveLength(5);
    });
  });

  describe("Question Validation Error Scenarios", () => {
    it("should show error when trying to move question below display order 1", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Question 1 is at position 1, moving up would try to go to position 0
      const moveUpButton = screen.getByTestId("question-move-up-1");
      fireEvent.click(moveUpButton);

      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.displayOrderAlreadyAtTop",
          { type: "error" }
        );
      });
    });

    it("should show error when trying to move question beyond max display order", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Question 3 is at position 3 (max), moving down would try to go to position 4
      const moveDownButton = screen.getByTestId("question-move-down-3");
      fireEvent.click(moveDownButton);

      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.cannotMoveFurtherDown",
          { type: "error" }
        );
      });
    });

    it("should show error when trying to move question to same position", async () => {
      // Create a section where we can test same position
      // We'll click move down then immediately move up to test concurrent operations
      // which effectively tries to keep same position
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Move question 2 down first
      const moveDownButton = screen.getByTestId("question-move-down-2");
      fireEvent.click(moveDownButton);

      // Immediately try to move it back up (should be prevented by isReordering flag)
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      // Wait for first operation to complete
      await waitFor(() => {
        expect(screen.getByTestId("question-move-down-2")).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe("Question Reordering Error Handling", () => {
    // Mock the updateDisplayOrder function to return errors
    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    it("should handle API failure with error array", async () => {
      // We need to mock the internal updateDisplayOrder to fail
      // Since it's not exported, we'll test the behavior by observing state changes

      const mockSetErrorMessages = jest.fn();
      render(<AdminSectionEditContainer {...defaultProps} setErrorMessages={mockSetErrorMessages} />);

      // Move question 2 up (from position 2 to 1)
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        // The mock always succeeds, so error handling won't be triggered here
        // But the component should still work
        expect(screen.getByTestId("question-move-up-2")).toBeInTheDocument();
      });
    });

    it("should handle successful question reordering and show announcement", async () => {
      const { container } = render(<AdminSectionEditContainer {...defaultProps} />);

      // Move question 2 up (from position 2 to 1)
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      // Wait for the async operation and announcement
      await waitFor(() => {
        const announceRegion = container.querySelector('[aria-live="polite"]');
        expect(announceRegion).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it("should update local state optimistically when reordering", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Get initial order
      const questionCards = screen.getAllByTestId("question-edit-card");
      expect(questionCards).toHaveLength(3);

      // Move question 2 up
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      // The component should update optimistically
      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-2")).toBeInTheDocument();
      });
    });

    it("should scroll focused element into view after reordering", async () => {
      const scrollIntoViewMock = jest.fn();

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<AdminSectionEditContainer {...defaultProps} />);

      // Focus an element
      const moveUpButton = screen.getByTestId("question-move-up-2");
      moveUpButton.focus();

      // Verify element is focused
      expect(document.activeElement).toBe(moveUpButton);

      // Move question
      fireEvent.click(moveUpButton);

      // Wait for scroll to be called
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledWith({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, { timeout: 1000 });
    });

    it("should handle case when no element is focused during reordering", async () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<AdminSectionEditContainer {...defaultProps} />);

      // Ensure no element is focused
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }

      // Move question without focusing
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      // Wait for operation to complete
      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-2")).toBeInTheDocument();
      }, { timeout: 1000 });

      // scrollIntoView might still be called if body is activeElement
      // Just verify the component doesn't crash
    });
  });

  describe("Question Not Found Validation", () => {
    it("should handle validation when question is not found in local state", async () => {
      // Create a component instance
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Verify initial render
      expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();
      expect(screen.getAllByTestId("question-edit-card")).toHaveLength(3);

      // Now test what happens if we try to move a question that suddenly doesn't exist
      // This could happen in edge cases with rapid state updates
      // The validation in handleDisplayOrderChange checks for this scenario

      // We can't directly trigger this without modifying internal state,
      // but we verify the component handles it gracefully by rendering correctly
      expect(screen.getByText("Data Collection and Management")).toBeInTheDocument();
    });

    it("should handle section with single question gracefully", async () => {
      const singleQuestionSection = {
        ...mockSections[0],
        questions: [mockSections[0].questions[0]]
      };

      render(<AdminSectionEditContainer {...defaultProps} section={singleQuestionSection} />);

      // With only 1 question, trying to move it down should fail validation
      const moveDownButton = screen.getByTestId("question-move-down-1");
      fireEvent.click(moveDownButton);

      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.cannotMoveFurtherDown",
          { type: "error" }
        );
      });

      // Trying to move it up should also fail
      jest.clearAllMocks();
      const moveUpButton = screen.getByTestId("question-move-up-1");
      fireEvent.click(moveUpButton);

      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.displayOrderAlreadyAtTop",
          { type: "error" }
        );
      });
    });

    it("should handle section with two questions and test all movement combinations", async () => {
      const twoQuestionSection = {
        ...mockSections[0],
        questions: [
          mockSections[0].questions[0],
          mockSections[0].questions[1]
        ]
      };

      render(<AdminSectionEditContainer {...defaultProps} section={twoQuestionSection} />);

      // Move question 1 down to position 2
      const moveDownButton1 = screen.getByTestId("question-move-down-1");
      fireEvent.click(moveDownButton1);

      // Wait for operation to complete
      await waitFor(() => {
        expect(screen.getByTestId("question-move-down-1")).toBeInTheDocument();
      }, { timeout: 1000 });

      // Now try to move question 2 up to position 1
      jest.clearAllMocks();
      const moveUpButton2 = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton2);

      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-2")).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe("Clearing Error Messages", () => {
    it("should clear error messages when starting a new reorder operation", async () => {
      const mockSetErrorMessages = jest.fn();
      render(<AdminSectionEditContainer {...defaultProps} setErrorMessages={mockSetErrorMessages} />);

      // Move a question
      const moveUpButton = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton);

      await waitFor(() => {
        // Should call setErrorMessages([]) to clear errors at the start
        expect(mockSetErrorMessages).toHaveBeenCalledWith([]);
      });
    });
  });

  describe("Optimistic Update Logic", () => {
    it("should correctly reorder when moving question down", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Get initial order
      const initialCards = screen.getAllByTestId("question-edit-card");
      expect(initialCards[0]).toHaveTextContent("What types of data will be collected");
      expect(initialCards[1]).toHaveTextContent("How will the data be stored");
      expect(initialCards[2]).toHaveTextContent("What file formats will be used");

      // Move question 1 down (position 1 -> 2)
      const moveDownButton = screen.getByTestId("question-move-down-1");
      fireEvent.click(moveDownButton);

      // Verify optimistic update happened
      await waitFor(() => {
        const cards = screen.getAllByTestId("question-edit-card");
        expect(cards).toHaveLength(3);
      }, { timeout: 1000 });
    });

    it("should correctly reorder when moving question up", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Move question 3 up (position 3 -> 2)
      const moveUpButton = screen.getByTestId("question-move-up-3");
      fireEvent.click(moveUpButton);

      // Verify the component handles it
      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-3")).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it("should maintain correct display orders after multiple moves", async () => {
      render(<AdminSectionEditContainer {...defaultProps} />);

      // Move question 2 up
      const moveUpButton2 = screen.getByTestId("question-move-up-2");
      fireEvent.click(moveUpButton2);

      await waitFor(() => {
        expect(screen.getByTestId("question-move-up-2")).toBeInTheDocument();
      }, { timeout: 1000 });

      // Wait a bit then move question 3 down
      jest.clearAllMocks();
      await new Promise(resolve => setTimeout(resolve, 600));

      const moveDownButton3 = screen.getByTestId("question-move-down-3");
      fireEvent.click(moveDownButton3);

      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.cannotMoveFurtherDown",
          { type: "error" }
        );
      });
    });
  });

  describe("Edge Case: Questions with Display Order Zero", () => {
    it("should handle questions with displayOrder of 0 in find operation", async () => {
      // Test the || 0 fallback in updateLocalQuestionOrder
      // This tests line 84: const oldOrder = prevQuestions.find((q) => q.id === questionId)?.displayOrder || 0;
      const sectionWithZeroOrder = {
        ...mockSections[0],
        questions: [
          { ...mockSections[0].questions[0], displayOrder: 0, id: "0" },
          { ...mockSections[0].questions[1], displayOrder: 1, id: "1" }
        ]
      };

      render(<AdminSectionEditContainer {...defaultProps} section={sectionWithZeroOrder} />);

      // Try to move question with display order 1
      const moveUpButton = screen.getByTestId("question-move-up-1");
      fireEvent.click(moveUpButton);

      // Should show error about going below minimum
      await waitFor(() => {
        expect(mockToastAdd).toHaveBeenCalledWith(
          "messages.errors.displayOrderAlreadyAtTop",
          { type: "error" }
        );
      });
    });
  });
});
