import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectPlanAdjustFunding from '../page';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsProjectPlanAdjustFunding', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })

    window.scrollTo = jest.fn(); // Mock scrollTo to prevent errors in tests
  })

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should render the page header with correct title and description', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByText('Project Funding')).toBeInTheDocument();
    expect(screen.getByText('Manage funding sources for your project')).toBeInTheDocument();
  });

  it('should render the breadcrumb links', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should render the radio group with funding options', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByText('Select funding sources for this plan')).toBeInTheDocument();
    expect(screen.getByText('National Science Foundation (NSF)')).toBeInTheDocument();
    expect(screen.getByText('National Science Foundation - AAA (NSF-AA)')).toBeInTheDocument();
  });

  it('should render the note about changing the funding sources', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByText(/Note: Changing the funding sources may require a template change./)).toBeInTheDocument();
  });

  it('should render the save button', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should render the link to add new funding', () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    expect(screen.getByText('Add a new funding source')).toBeInTheDocument();
    expect(screen.getByText('Add a new funding source').closest('a')).toHaveAttribute('href', '/projects/proj_2425/fundings/');
  });

  it('should handle form submission', async () => {
    render(<ProjectsProjectPlanAdjustFunding />);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    // Check console log or redirection logic if mocked
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/dmp/xxx');
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanAdjustFunding />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
