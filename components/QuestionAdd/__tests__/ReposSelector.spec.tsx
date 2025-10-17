/**
 * @jest-environment jsdom
 */
import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import RepositorySelectionSystem from '../ReposSelector';

expect.extend(toHaveNoViolations);


jest.mock('@/components/Pagination', () => () => <div data-testid="pagination">Pagination</div>);

// ---- Test data ----
const mockField = {
  id: 'repoSelector',
  label: 'Repo selector',
  enabled: false,
  placeholder: '',
  helpText: '',
  enableSearch: false,
  value: '',
  repoConfig: {
    hasCustomRepos: true,
    customRepos: [] as string[],

  },
} as any;

const mockHandleToggle = jest.fn();
const mockOnChange = jest.fn();

describe('RepositorySelectionSystem', () => {
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

  it('shows the "Remove all" button after a user selects a metadata standard', () => {
    render(
      <RepositorySelectionSystem
        field={mockField}
        handleTogglePreferredRepositories={mockHandleToggle}
        onRepositoriesChange={mockOnChange}
      />
    );

    // Open the modal
    const addButton = screen.getAllByRole('button', {
      name: /researchOutput.repoSelector.buttons.addRepo/i,
    })[0];
    fireEvent.click(addButton);

    // There should be a list of standards displayed with "Select" buttons
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
    }); render

  });
});
