import React from "react";
import { act, render, screen } from "@testing-library/react";
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
jest.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    add: jest.fn(),
  }),
}));

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
    // There are 3 "Requirements" elements: 1 from section checklist + 2 from question checklists
    expect(screen.getAllByText("Requirements")).toHaveLength(3); // Section + 2 Question checklists
    expect(screen.getAllByText("Guidance")).toHaveLength(3); // Section + 2 Question checklists
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
});
