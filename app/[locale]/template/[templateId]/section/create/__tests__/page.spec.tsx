import React from "react";
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import {
  useAddSectionMutation,
  useSectionsDisplayOrderQuery,
  useTagsQuery,
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import CreateSectionPage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useAddSectionMutation: jest.fn(),
  useTagsQuery: jest.fn(),
  useSectionsDisplayOrderQuery: jest.fn(),
  SectionsDisplayOrderDocument: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

const mockSectionsData = {
  sections: [
    {
      displayOrder: 1
    },
    {
      displayOrder: 2
    }
  ]
}
const mockTagsData = {
  tags: [
    {
      id: 1,
      description: "The types of data that will be collected along with their formats and estimated volumes.",
      name: "Data description"
    },
    {
      id: 2,
      description: "Descriptions naming conventions, metadata standards that will be used along with data dictionaries and glossaries",
      name: "Data organization & documentation"
    },
    {
      id: 3,
      description: "Who will have access to the data and how that access will be controlled, how the data will be encrypted and relevant compliance with regulations or standards (e.g. HIPAA, GDPR)",
      name: "Security & privacy"
    },
    {
      id: 4,
      description: "Ethical considerations during data collection, use or sharing and how informed consent will be obtained from participants",
      name: "Ethical considerations"
    },
    {
      id: 5,
      description: "Training that will be provided to team members on data management practices and support for data issues",
      name: "Training & support"
    },
    {
      id: 6,
      description: "Policies and procedures for how the data will be shared with collaborators and/or the public, restrictions to access and the licenses and permissions used",
      name: "Data sharing"
    },
    {
      id: 7,
      description: "Where the data will be stored, the backup strategy and frequency and how long it will be retained",
      name: "Data storage & backup"
    },
    {
      id: 8,
      description: "Methods used to ensure data quality and integrity and any procedures used for validation",
      name: "Data quality & integrity"
    },
    {
      id: 9,
      description: "Desriptions of the project team members and their roles",
      name: "Roles & responsibilities"
    },
    {
      id: 10,
      description: "Description of the budget available for data collection, use and preservation including software licensing, personnel and storage costs",
      name: "Budget"
    },
    {
      id: 11,
      description: "How the data will be collected or generated, primary and secondary sources that will be used and any instruments that will be used",
      name: "Data collection"
    }
  ]
};

describe("CreateSectionPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
    (useTagsQuery as jest.Mock).mockReturnValue({
      data: mockTagsData,
      loading: true,
      error: null,
    });

    (useSectionsDisplayOrderQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockSectionsData), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);
  });

  it("should render correct fields", async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <CreateSectionPage />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('title');
    const editQuestionTab = screen.getByRole('tab', { name: 'tabs.editSection' });
    expect(editQuestionTab).toBeInTheDocument();
    const editOptionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    expect(editOptionsTab).toBeInTheDocument();
    const editLogicTab = screen.getByRole('tab', { name: 'tabs.logic' });
    expect(editLogicTab).toBeInTheDocument();
    const sectionNameEditor = screen.getByRole('textbox', { name: /sectionName/i });
    expect(sectionNameEditor).toBeInTheDocument();
    const sectionIntroductionEditor = screen.getByRole('textbox', { name: /sectionIntroduction/i });
    expect(sectionIntroductionEditor).toBeInTheDocument();
    const sectionRequirementsEditor = screen.getByRole('textbox', { name: /sectionRequirements/i });
    expect(sectionRequirementsEditor).toBeInTheDocument();
    const sectionGuidanceEditor = screen.getByRole('textbox', { name: /sectionGuidance/i });
    expect(sectionGuidanceEditor).toBeInTheDocument();

    // Check for the help text
    expect(screen.getByText('helpText.sectionIntroduction')).toBeInTheDocument();
    expect(screen.getByText('helpText.sectionRequirements')).toBeInTheDocument();
    expect(screen.getByText('helpText.sectionGuidance')).toBeInTheDocument();

    const tagsHeader = screen.getByText('labels.bestPracticeTags');
    expect(tagsHeader).toBeInTheDocument();
    const checkboxLabels = screen.getAllByTestId('checkboxLabel');
    expect(checkboxLabels).toHaveLength(11);
  });

  it('should display error when no value is entered in section name field', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <CreateSectionPage />
      );
    });

    const searchButton = screen.getByRole('button', { name: /button.createSection/i });
    fireEvent.click(searchButton);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('messages.fieldLengthValidation');
  })

  it('should pass axe accessibility test', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
    ]);

    const { container } = render(
      <CreateSectionPage />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
