import React, { useState } from "react";
import { ApolloError } from '@apollo/client';
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useSectionQuery,
  useTagsQuery,
  useUpdateSectionMutation,
  useRemoveSectionMutation
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import SectionUpdatePage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useTagsQuery: jest.fn(),
  useUpdateSectionMutation: jest.fn(),
  useRemoveSectionMutation: jest.fn(),
  UpdateSectionDocument: jest.fn(),
  useSectionQuery: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

// Need to mock the useSectionData hook with state to get react to re-render
// when the state changes
jest.mock('@/hooks/sectionData', () => ({
  useSectionData: () => {
    const [sectionData, setSectionData] = useState({
      sectionName: '',
      sectionIntroduction: '',
      sectionRequirements: '',
      sectionGuidance: '',
      displayOrder: undefined,
      bestPractice: undefined,
    });

    return {
      sectionData,
      setSectionData,
      selectedTags: [],
      checkboxTags: [],
      loading: false,
      setSelectedTags: jest.fn(),
      data: {
        section: {
          name: '',
          introduction: '',
          requirements: '',
          guidance: '',
          displayOrder: 1,
          bestPractice: false,
          tags: []
        }
      }
    };
  }
}));

const mockUseRouter = useRouter as jest.Mock;

const mockSectionsData = {
  bestPractice: false,
  displayOrder: 15,
  errors: null,
  guidance: "<p><strong>Testing guidance - Blah</strong></p>",
  id: 1108,
  introduction: "<p>Testing Introduction 123</p><ol><li><p>item 1</p></li><li><p>item 2</p></li></ol>",
  name: "<p><strong>Different Name</strong></p>",
  requirements: "<p>Testing requirements: List</p><ol><li><p>F<u>irst requirement;</u></p></li><li><p><em>Second requirement</em></p></li></ol>",
  tags: [
    {
      id: 1,
      name: "Data description",
      description: "The types of data that will be collected along with their formats"
    },
    {
      id: 2,
      name: "Security & Privacy",
      description: "Who will have access to the data"
    },
  ],
  template: {
    id: 15
  }

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

describe("SectionUpdatePage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;


    // Mock window.tinymce
    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };


    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}`, section_slug: '123' });
    (useTagsQuery as jest.Mock).mockReturnValue({
      data: mockTagsData,
      loading: true,
      error: null,
    });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    (useSectionQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce(mockSectionsData),
      { loading: false, error: undefined },
    ]);

    (useRemoveSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { removeSection: { id: 123, name: 'Test Section' } } }),
      { loading: false, error: undefined },
    ]);

  });

  it("should render correct fields", async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionUpdatePage />
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
    const sectionNameInput = screen.getByLabelText('labels.sectionName');
    expect(sectionNameInput).toBeInTheDocument();
    const sectionIntroductionLabel = screen.getByLabelText(/sectionIntroduction/i);
    expect(sectionIntroductionLabel).toBeInTheDocument();
    const sectionRequirementsLabel = screen.getByLabelText(/sectionRequirements/i);
    expect(sectionRequirementsLabel).toBeInTheDocument();
    const sectionGuidanceLabel = screen.getByLabelText(/sectionGuidance/i);
    expect(sectionGuidanceLabel).toBeInTheDocument();
    const tagsHeader = screen.getByText('labels.bestPracticeTags');
    expect(tagsHeader).toBeInTheDocument();
    const checkboxLabels = screen.getAllByTestId('checkboxLabel');
    expect(checkboxLabels).toHaveLength(11);

    // Check for the help text
    expect(screen.getByText('helpText.sectionIntroduction')).toBeInTheDocument();
    expect(screen.getByText('helpText.sectionRequirements')).toBeInTheDocument();
    expect(screen.getByText('helpText.sectionGuidance')).toBeInTheDocument();
  });

  it('should display error when no value is entered in section name field', async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionUpdatePage />
      );
    });

    const saveAndAdd = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });
    fireEvent.click(saveAndAdd);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('messages.fieldLengthValidation');
  })

  it('should call logECS when updateSection throws an error', async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error("Error")),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<SectionUpdatePage />);
    });

    const sectionName = screen.getByLabelText(/labels.sectionName/i);

    await act(async () => {
      fireEvent.change(sectionName, { target: { value: 'My section name' } });
    });

    const saveAndAdd = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });

    await act(async () => {
      fireEvent.click(saveAndAdd);
    });

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateSection',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/template/123/section/123' },
        })
      );
    });
  });

  it('should log error when an apollo error instance is returned', async () => {
    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'Apollo error occurred',
    });

    const mockUpdateSection = jest.fn()
      .mockRejectedValueOnce(apolloError) // First call returns an Apollo error
      .mockResolvedValueOnce({ data: { removeUserEmail: [{ errors: null }] } }); // Second call succeeds


    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      mockUpdateSection,
      { loading: false, error: undefined }
    ]);

    await act(async () => {
      render(<SectionUpdatePage />);
    });

    const sectionName = screen.getByLabelText(/labels.sectionName/i);

    await act(async () => {
      fireEvent.change(sectionName, { target: { value: 'My section name' } });
    });

    const saveAndAdd = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });

    await act(async () => {
      fireEvent.click(saveAndAdd);
    });

    await waitFor(() => {
      expect(screen.getByText('messages.errorUpdatingSection')).toBeInTheDocument();
    });
  });

  it('should log error when field-level errors are returned', async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { updateSection: { errors: { general: 'Error updating section' } } } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<SectionUpdatePage />);
    });

    const sectionName = screen.getByLabelText(/labels.sectionName/i);

    await act(async () => {
      fireEvent.change(sectionName, { target: { value: 'My section name' } });
    });

    const saveAndAdd = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });

    await act(async () => {
      fireEvent.click(saveAndAdd);
    });

    await waitFor(() => {
      expect(screen.getByText(/error updating section/i)).toBeInTheDocument();
    });
  });

  it('should redirect to Edit Template page after submitting form', async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<SectionUpdatePage />);
    });

    // Simulate adding content to the sectionName field
    const sectionNameInput = screen.getByLabelText(/sectionName/i);
    await act(async () => {
      fireEvent.change(sectionNameInput, { target: { value: 'Updated Section Name' } });
    });

    const saveAndAdd = screen.getByRole('button', { name: /buttons.saveAndUpdate/i });
    fireEvent.click(saveAndAdd);

    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/template/123');
    });
  });


  it('should pass axe accessibility test', async () => {
    (useUpdateSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const { container } = render(
      <SectionUpdatePage />
    );

    // Click on the options tab to ensure h2 headings are rendered
    const optionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    fireEvent.click(optionsTab);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Delete Section Functionality', () => {
    it('should render delete section button in danger zone', async () => {
      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const dangerZoneTitle = screen.getByText('deleteSection.heading');
      expect(dangerZoneTitle).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('buttons.deleteSection');
    });

    it('should open delete confirmation dialog when delete button is clicked', async () => {
      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('deleteModal.title')).toBeInTheDocument();
        expect(screen.getByText('deleteModal.content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /deleteModal.cancelButton/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /deleteModal.deleteButton/i })).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel button is clicked', async () => {
      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('deleteModal.title')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /deleteModal.cancelButton/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('deleteModal.title')).not.toBeInTheDocument();
      });
    });

    it('should successfully delete section when confirm button is clicked', async () => {
      const mockRemoveSection = jest.fn().mockResolvedValueOnce({ 
        data: { removeSection: { id: 123, name: 'Test Section' } } 
      });

      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      (useRemoveSectionMutation as jest.Mock).mockReturnValue([
        mockRemoveSection,
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('deleteModal.title')).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByRole('button', { name: /deleteModal.deleteButton/i });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockRemoveSection).toHaveBeenCalledWith({
          variables: { sectionId: 123 }
        });
        expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/template/123');
      });
    });

    it('should show error message when delete section fails', async () => {
      const mockRemoveSection = jest.fn().mockRejectedValueOnce(new Error('Delete failed'));

      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      (useRemoveSectionMutation as jest.Mock).mockReturnValue([
        mockRemoveSection,
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('deleteModal.title')).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByRole('button', { name: /deleteModal.deleteButton/i });
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(screen.getByText('messages.errorDeletingSection')).toBeInTheDocument();
        expect(logECS).toHaveBeenCalledWith(
          'error',
          'deleteSection',
          expect.objectContaining({
            error: expect.anything(),
            url: { path: '/en-US/template/123/section/123' },
          })
        );
      });
    });

    it('should disable delete button while deletion is in progress', async () => {
      const mockRemoveSection = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { removeSection: { id: 123 } } }), 100))
      );

      (useUpdateSectionMutation as jest.Mock).mockReturnValue([
        jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
        { loading: false, error: undefined },
      ]);

      (useRemoveSectionMutation as jest.Mock).mockReturnValue([
        mockRemoveSection,
        { loading: false, error: undefined },
      ]);

      await act(async () => {
        render(<SectionUpdatePage />);
      });

      const deleteButton = screen.getByRole('button', { name: /buttons.deleteSection/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('deleteModal.title')).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByRole('button', { name: /deleteModal.deleteButton/i });
      fireEvent.click(confirmDeleteButton);

      // Button should be disabled and show "Deleting..." text
      await waitFor(() => {
        expect(deleteButton).toBeDisabled();
        expect(deleteButton).toHaveTextContent('Deleting...');
      });
    });
  });
});
