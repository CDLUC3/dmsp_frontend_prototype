import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectFunding from '../page';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsProjectFunding', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title and description', () => {
    render(<ProjectsProjectFunding />);
    expect(screen.getByText('Project Funding')).toBeInTheDocument();
    expect(screen.getByText('Manage funding sources for your project')).toBeInTheDocument();
  });

  it('should render breadcrumbs correctly', () => {
    render(<ProjectsProjectFunding />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should render the "Add funding" button and handles click', async () => {
    render(<ProjectsProjectFunding />);
    const addButton = screen.getByRole('button', { name: 'Add funding' });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/fundings/search');
    });
  });

  it('should render the fundings list and handles "Edit" button click', async () => {
    render(<ProjectsProjectFunding />);
    const editButton = screen.getByRole('button', { name: 'Edit National Science Foundation details' });
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/fundings/projFund_6902/edit');
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectFunding />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
