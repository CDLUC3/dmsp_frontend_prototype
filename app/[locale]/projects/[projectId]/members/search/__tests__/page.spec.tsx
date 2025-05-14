import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectMembersSearch from '../page';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsProjectMembersSearch', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title', () => {
    render(<ProjectsProjectMembersSearch />);
    expect(screen.getByText('Who are the collaborators?')).toBeInTheDocument();
  });

  it('should render the search field with label and description', () => {
    render(<ProjectsProjectMembersSearch />);
    expect(screen.getByLabelText('Search by name, organization or ORCID')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Search by a person's name, organization and/or ORCiD. Entering more information will help narrow the search, for example Frederick Cook 0427."
      )
    ).toBeInTheDocument();
  });

  it('should execute search and displays results', () => {
    render(<ProjectsProjectMembersSearch />);
    const input = screen.getByLabelText('Search by name, organization or ORCID');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'Fred' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('Showing 1-3 of 124 results')).toBeInTheDocument();
    expect(screen.getByText('Frederick Cook')).toBeInTheDocument();
    expect(screen.getByText('Kansas State University', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Fred Cook')).toBeInTheDocument();
    expect(screen.getByText(/New Jersey City University\s+and 3 more/i)).toBeInTheDocument();
  });

  it('should handle "Add" button click for a search result', async () => {
    render(<ProjectsProjectMembersSearch />);
    const input = screen.getByLabelText('Search by name, organization or ORCID');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'Fred' } });
    fireEvent.click(searchButton);

    const addButton = screen.getByRole('button', { name: /Add Frederick Cook/i });

    fireEvent.click(addButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/members');
    });
  });

  it('should handle "Create collaborator" button click', async () => {
    render(<ProjectsProjectMembersSearch />);
    const createCollaboratorButton = screen.getByRole('button', { name: /Create collaborator/i });

    fireEvent.click(createCollaboratorButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/members/123/edit');
    });
  });

  it('should display no results when search term is empty', () => {
    render(<ProjectsProjectMembersSearch />);
    const input = screen.getByLabelText('Search by name, organization or ORCID');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(searchButton);

    expect(screen.queryByText('Showing 1-3 of 124 results')).not.toBeInTheDocument();
    expect(screen.queryByText('Frederick Cook')).not.toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectMembersSearch />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
