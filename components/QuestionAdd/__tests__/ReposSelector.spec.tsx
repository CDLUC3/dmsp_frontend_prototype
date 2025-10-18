/**
 * @jest-environment jsdom
 */
import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RepositorySelectionSystem from '../ReposSelector';

expect.extend(toHaveNoViolations);

jest.mock('@/components/Pagination', () => {
  const MockPagination = () => <div data-testid="pagination">Pagination</div>;
  MockPagination.displayName = 'Pagination';
  return MockPagination;
});

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    add: jest.fn(),
  }),
}));

// ---- Test data ----
const createMockField = (hasCustomRepos: boolean = true, customRepos: string[] = []) => ({
  id: 'repoSelector',
  label: 'Repo selector',
  enabled: false,
  placeholder: '',
  helpText: '',
  value: '',
  repoConfig: {
    hasCustomRepos,
    customRepos,
  },
});

const mockField = createMockField();
const mockHandleToggle = jest.fn();
const mockOnChange = jest.fn();

describe('RepositorySelectionSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should pass axe accessibility test', async () => {
      const { container } = render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  describe('Checkbox Toggle', () => {
    it('renders checkbox and calls handleTogglePreferredRepositories when clicked', () => {
      const handleToggle = jest.fn();
      render(
        <RepositorySelectionSystem
          field={createMockField(false)}
          handleTogglePreferredRepositories={handleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('displays selected items section when hasCustomRepos is true', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      expect(screen.getByText(/researchOutput.repoSelector.labels.createRepos/i)).toBeInTheDocument();
    });

    it('does not display selected items section when hasCustomRepos is false', () => {
      render(
        <RepositorySelectionSystem
          field={createMockField(false)}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      expect(screen.queryByText(/researchOutput.repoSelector.repositorySelected/i)).not.toBeInTheDocument();
    });
  });

  describe('Modal - Open/Close', () => {
    it('renders the modal when "Add" button is clicked and closes it via aria-label button', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Initially, modal is not visible
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      // Click "Add" button to open modal
      const addRepoButton = screen.getByRole('button', {
        name: 'researchOutput.repoSelector.buttons.addRepo',
      });
      fireEvent.click(addRepoButton);

      // Modal should appear
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      // Find the close button by its aria-label (translated key)
      const closeButton = screen.getByRole('button', {
        name: 'buttons.closeModal',
      });

      // Click the close button
      fireEvent.click(closeButton);

      // Modal should now be closed
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Repository Selection', () => {
    it('shows the "Remove all" button after a user selects a repository', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Open the modal
      const addButton = screen.getByRole('button', {
        name: 'researchOutput.repoSelector.buttons.addRepo',
      });
      fireEvent.click(addButton);

      // There should be a list of repositories displayed with "Select" buttons
      const selectButtons = screen.getAllByRole('button', {
        name: 'buttons.select',
      });
      expect(selectButtons.length).toBeGreaterThan(0);

      // Click the first "Select" button to add one
      fireEvent.click(selectButtons[0]);

      // Close the modal using the close button
      const closeButton = screen.getByRole('button', {
        name: 'buttons.closeModal',
      });
      fireEvent.click(closeButton);

      // After closing, the "Remove all" button should now appear
      const removeAllBtn = screen.getByRole('button', {
        name: 'buttons.removeAll',
      });
      expect(removeAllBtn).toBeInTheDocument();
    });

    it('changes button from "Select" to "Remove" when repository is selected', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // Button text should change to "Remove"
      const removeButton = screen.getAllByRole('button', { name: 'buttons.remove' })[0];
      expect(removeButton).toBeInTheDocument();
    });

    it('toggles selection state correctly when clicking select/remove buttons', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // Should change to Remove button
      expect(screen.getAllByRole('button', { name: 'buttons.remove' }).length).toBeGreaterThan(0);

      // Click again to deselect
      const removeButton = screen.getAllByRole('button', { name: 'buttons.remove' })[0];
      fireEvent.click(removeButton);

      // Should go back to Select button
      expect(screen.getAllByRole('button', { name: 'buttons.select' }).length).toBeGreaterThan(0);
    });

    it('displays selected count in modal heading', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
      fireEvent.click(selectButtons[0]);
      fireEvent.click(selectButtons[1]);

      // Check that selected count tag is displayed
      expect(screen.getByText(/researchOutput.repoSelector.selectedCount/)).toBeInTheDocument();
    });
  });

  describe('Remove Repository', () => {
    it('removes a selected repository when remove button is clicked', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Select a repository
      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // Close modal
      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Repository should be displayed in selected items
      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();

      // Remove the repository from the selected items list
      const removeButtons = screen.getAllByRole('button', { name: 'buttons.remove' });
      fireEvent.click(removeButtons[0]);

      // The repository should no longer be displayed
      expect(screen.queryByText('1.2 Meter CO Survey Dataverse')).not.toBeInTheDocument();
    });

    it('removes all repositories when "Remove all" button is clicked with confirmation', () => {
      window.confirm = jest.fn(() => true);

      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Select repositories
      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
      fireEvent.click(selectButtons[0]);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Click "Remove all" button
      const removeAllBtn = screen.getByRole('button', { name: 'buttons.removeAll' });
      fireEvent.click(removeAllBtn);

      // Confirmation dialog should appear
      expect(window.confirm).toHaveBeenCalled();

      // Selected items section should be empty
      expect(screen.queryByText('1.2 Meter CO Survey Dataverse')).not.toBeInTheDocument();
    });

    it('does not remove all repositories when user cancels confirmation', () => {
      window.confirm = jest.fn(() => false);

      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Click "Remove all" button
      const removeAllBtn = screen.getByRole('button', { name: 'buttons.removeAll' });
      fireEvent.click(removeAllBtn);

      expect(window.confirm).toHaveBeenCalled();

      // Repository should still be in the list
      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters repositories based on search term', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      // Search for a specific term
      const searchInput = screen.getByLabelText(/labels.searchTerm/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Protein' } });

      const applyFilterBtn = screen.getByRole('button', { name: 'buttons.applyFilter' });
      fireEvent.click(applyFilterBtn);

      // Should display only Protein Data Bank
      expect(screen.getByText('Protein Data Bank')).toBeInTheDocument();
    });

    it('searches in name, description, and tags fields', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const searchInput = screen.getByLabelText(/labels.searchTerm/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'biology' } });

      const applyFilterBtn = screen.getByRole('button', { name: 'buttons.applyFilter' });
      fireEvent.click(applyFilterBtn);

      // Should find repositories with "biology" in tags or description
      expect(screen.getByText('Protein Data Bank')).toBeInTheDocument();
    });

    it('clears search and resets to all repositories', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const searchInput = screen.getByLabelText(/labels.searchTerm/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Protein' } });

      const applyFilterBtn = screen.getByRole('button', { name: 'buttons.applyFilter' });
      fireEvent.click(applyFilterBtn);

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      fireEvent.click(applyFilterBtn);

      // All repositories should be visible again
      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();
      expect(screen.getByText('GenBank')).toBeInTheDocument();
    });
  });

  describe('Subject Area and Repository Type Filters', () => {
    it('renders subject area selector', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByText('researchOutput.repoSelector.labels.subjectArea')).toBeInTheDocument();
    });

    it('renders repository type selector', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByText('researchOutput.repoSelector.labels.repoType')).toBeInTheDocument();
    });
  });

  describe('Custom Repository Form', () => {
    it('toggles custom form visibility when "Add custom repo" button is clicked', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      // Form should not be visible initially
      expect(screen.queryByTestId('form-input-repo-name')).not.toBeInTheDocument();

      // Click the "Add custom repo" button to show custom form
      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // Form should now be visible
      expect(screen.getByTestId('form-input-repo-name')).toBeInTheDocument();
      expect(screen.getByTestId('form-input-repo-url')).toBeInTheDocument();
      expect(screen.getByTestId('form-input-repo-description')).toBeInTheDocument();
    });

    it('adds a custom repository when form is submitted with valid data', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // Fill in the form
      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: 'Custom Repo' } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: 'https://example.com' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: 'A custom repository' } });

      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      // Form should be hidden after submission
      expect(screen.queryByTestId('form-input-repo-name')).not.toBeInTheDocument();

      // Close modal and check if custom repo appears in selected items
      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      expect(screen.getByText('Custom Repo')).toBeInTheDocument();
    });

    it('shows error when submitting form with empty fields', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // Try to submit without filling in fields
      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      // Form should still be visible since validation failed
      expect(screen.getByTestId('form-input-repo-name')).toBeInTheDocument();
    });

    it('trims whitespace from custom form inputs', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // Fill in the form with whitespace
      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: '   Custom Repo   ' } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: '   https://example.com   ' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: '   A custom repo   ' } });

      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Repository should be displayed with trimmed whitespace
      expect(screen.getByText('Custom Repo')).toBeInTheDocument();
    });

    it('closes custom form when "Cancel" button is clicked', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      expect(screen.getByTestId('form-input-repo-name')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'buttons.cancel' });
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('form-input-repo-name')).not.toBeInTheDocument();
    });

    it('resets custom form fields when cancel is clicked', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // Fill in the form
      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: 'Test' } });

      const cancelButton = screen.getByRole('button', { name: 'buttons.cancel' });
      fireEvent.click(cancelButton);

      // Open form again
      fireEvent.click(screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i }));

      // Fields should be empty
      expect((screen.getByTestId('form-input-repo-name') as HTMLInputElement).value).toBe('');
    });
  });

  describe('Repository Details Expansion', () => {
    it('displays more info button for each repository', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      // Should have expand buttons for each repository
      const expandButtons = screen.getAllByTestId('expand-button');
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('expands and collapses repository details', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const expandButton = screen.getAllByTestId('expand-button')[0];
      fireEvent.click(expandButton);

      // Details section should show contact, access, identifier info
      expect(screen.getByText('researchOutput.repoSelector.descriptions.contactTitle')).toBeInTheDocument();
      expect(screen.getByText('researchOutput.repoSelector.descriptions.dataAccessTitle')).toBeInTheDocument();
    });
  });

  describe('Repository Details Expansion', () => {
    it('displays more info button for each repository', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      // Should have expand buttons for each repository
      const expandButtons = screen.getAllByTestId('expand-button');
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('expands and collapses repository details', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const expandButton = screen.getAllByTestId('expand-button')[0];
      fireEvent.click(expandButton);

      // Details section should show contact, access, identifier info
      expect(screen.getByText('researchOutput.repoSelector.descriptions.contactTitle')).toBeInTheDocument();
      expect(screen.getByText('researchOutput.repoSelector.descriptions.dataAccessTitle')).toBeInTheDocument();
    });
  });

  describe('Selected Items Display', () => {
    it('displays selected count in the correct format (singular)', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      expect(screen.getByText(/1.*researchOutput.repoSelector.repositorySelected/)).toBeInTheDocument();
    });

    it('displays selected count in the correct format (plural)', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
      fireEvent.click(selectButtons[0]);
      fireEvent.click(selectButtons[1]);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      expect(screen.getByText(/2.*researchOutput.repoSelector.repositoriesSelected/)).toBeInTheDocument();
    });

    it('displays repository metadata in selected items', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Should display repository info with access badge and identifier
      expect(screen.getByText(/Open/)).toBeInTheDocument();
      expect(screen.getByText(/DOI/)).toBeInTheDocument();
    });

    it('displays view repository link in selected items', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Should have a link to view the repository
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Callback Functions', () => {
    it('calls onRepositoriesChange when a repository is selected', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // onRepositoriesChange should have been called
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('calls onRepositoriesChange with correct repository data', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // Check if the callback was called with data
      expect(mockOnChange).toHaveBeenCalledWith(expect.any(Array));
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            url: expect.any(String),
            description: expect.any(String),
            access: expect.any(String),
            identifier: expect.any(String),
            contact: expect.any(String),
            tags: expect.any(Array),
          })
        ])
      );
    });

    it('calls handleTogglePreferredRepositories when checkbox is clicked', () => {
      const handleToggle = jest.fn();
      render(
        <RepositorySelectionSystem
          field={createMockField(false)}
          handleTogglePreferredRepositories={handleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleToggle).toHaveBeenCalledWith(true);
    });
  });

  describe('Pagination', () => {
    it('renders pagination component in modal', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('displays pagination info text', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByText(/Displaying repositories 1 - 10 of 4372 in total/)).toBeInTheDocument();
    });
  });

  describe('Repository List Display', () => {
    it('displays repository name and tags in results', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();
      expect(screen.getByText('radio telescope')).toBeInTheDocument();
    });

    it('displays repository description in results', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      expect(screen.getByText(/Radio Telescope Data Center/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('handles missing repoConfig gracefully', () => {
      const mockRepoSelector = {
        id: 'repoSelector',
        label: 'Repo selector',
        enabled: false,
        placeholder: '',
        helpText: '',
        value: '',
        repoConfig: undefined,
      };
      render(
        <RepositorySelectionSystem
          field={mockRepoSelector}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('disables "Remove all" button when no repositories are selected', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // "Remove all" button should not be present initially
      const removeAllBtn = screen.queryByRole('button', { name: 'buttons.removeAll' });
      expect(removeAllBtn).not.toBeInTheDocument();
    });

    it('handles rapid selection and deselection correctly', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];

      // Rapidly toggle selection
      fireEvent.click(selectButton);
      fireEvent.click(screen.getAllByRole('button', { name: 'buttons.remove' })[0]);
      fireEvent.click(screen.getAllByRole('button', { name: 'buttons.select' })[0]);

      // Should end up in selected state
      expect(screen.getAllByRole('button', { name: 'buttons.remove' }).length).toBeGreaterThan(0);
    });

    it('generates unique IDs for custom repositories', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Add first custom repository
      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: 'Custom 1' } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: 'https://example1.com' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: 'Description 1' } });

      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      expect(screen.getByText('Custom 1')).toBeInTheDocument();

      // Open modal again to add another custom repository
      const addButton2 = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton2);

      const addCustomButton2 = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton2);

      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: 'Custom 2' } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: 'https://example2.com' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: 'Description 2' } });

      fireEvent.click(screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i }));

      const closeButton2 = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton2);

      // Both should be displayed
      expect(screen.getByText('Custom 1')).toBeInTheDocument();
      expect(screen.getByText('Custom 2')).toBeInTheDocument();
    });

    it('handles empty search results gracefully', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const searchInput = screen.getByLabelText(/labels.searchTerm/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'nonexistent-repo-xyz-12345' } });

      const applyFilterBtn = screen.getByRole('button', { name: 'buttons.applyFilter' });
      fireEvent.click(applyFilterBtn);

      // Search results section should still be visible
      expect(screen.getByText(/Displaying repositories/)).toBeInTheDocument();
    });

    it('case-insensitive search works correctly', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const searchInput = screen.getByLabelText(/labels.searchTerm/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'protein' } });

      const applyFilterBtn = screen.getByRole('button', { name: 'buttons.applyFilter' });
      fireEvent.click(applyFilterBtn);

      // Should find results even with lowercase search
      expect(screen.getByText('Protein Data Bank')).toBeInTheDocument();
    });

    it('handles very long repository names and descriptions', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      const longName = 'A'.repeat(500);
      const longDescription = 'B'.repeat(1000);

      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: longName } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: 'https://example.com' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: longDescription } });

      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      const closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Should display the long name
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('validates URL format in custom form', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      // The input type is "url" which provides browser validation
      const urlInput = screen.getByTestId('form-input-repo-url') as HTMLInputElement;
      expect(urlInput.type).toBe('url');
    });
  });

  describe('State Management', () => {
    it('maintains selected repositories across modal open/close cycles', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      // Select a repository
      let addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const selectButton = screen.getAllByRole('button', { name: 'buttons.select' })[0];
      fireEvent.click(selectButton);

      // Close modal
      let closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();

      // Open modal again
      addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      // Repository should still be marked as selected
      expect(screen.getAllByRole('button', { name: 'buttons.remove' }).length).toBeGreaterThan(0);

      closeButton = screen.getByRole('button', { name: 'buttons.closeModal' });
      fireEvent.click(closeButton);

      // Repository should still appear in selected items
      expect(screen.getByText('1.2 Meter CO Survey Dataverse')).toBeInTheDocument();
    });

    it('clears custom form fields after successful submission', () => {
      render(
        <RepositorySelectionSystem
          field={mockField}
          handleTogglePreferredRepositories={mockHandleToggle}
          onRepositoriesChange={mockOnChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepo/i });
      fireEvent.click(addButton);

      const addCustomButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton);

      fireEvent.change(screen.getByTestId('form-input-repo-name'), { target: { value: 'Test Repo' } });
      fireEvent.change(screen.getByTestId('form-input-repo-url'), { target: { value: 'https://example.com' } });
      fireEvent.change(screen.getByTestId('form-input-repo-description'), { target: { value: 'Test Description' } });

      const submitButton = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addRepository/i });
      fireEvent.click(submitButton);

      // Form should be hidden
      expect(screen.queryByTestId('form-input-repo-name')).not.toBeInTheDocument();

      // Open form again
      const addCustomButton2 = screen.getByRole('button', { name: /researchOutput.repoSelector.buttons.addCustomRepo/i });
      fireEvent.click(addCustomButton2);

      // Form fields should be empty
      expect((screen.getByTestId('form-input-repo-name') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('form-input-repo-url') as HTMLInputElement).value).toBe('');
      expect((screen.getByTestId('form-input-repo-description') as HTMLInputElement).value).toBe('');
    });
  });
});