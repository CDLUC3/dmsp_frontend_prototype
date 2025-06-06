import React from 'react';
import { useRouter } from 'next/navigation';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsCreateProjectFunding from '../page';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsCreateProjectFunding', () => {
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
    render(<ProjectsCreateProjectFunding />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Do you already have funding for this project?');
  });

  it('should render the radio group with options', () => {
    render(<ProjectsCreateProjectFunding />);
    expect(screen.getByLabelText('Do you already have funding for this project?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('should handle radio button selection', () => {
    render(<ProjectsCreateProjectFunding />);
    const yesRadio = screen.getByLabelText('Yes');
    const noRadio = screen.getByLabelText('No');

    fireEvent.click(noRadio);
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();

    fireEvent.click(yesRadio);
    expect(yesRadio).toBeChecked();
    expect(noRadio).not.toBeChecked();
  });

  it('should navigate to funding search page when "Yes" is selected and form is submitted', async () => {
    render(<ProjectsCreateProjectFunding />);
    const yesRadio = screen.getByLabelText('Yes');
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    fireEvent.click(yesRadio);
    fireEvent.click(continueButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/create-project/funder-search');
    });
  });

  it('should navigate to new project page when "No" is selected and form is submitted', async () => {
    render(<ProjectsCreateProjectFunding />);
    const noRadio = screen.getByLabelText('No');
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    fireEvent.click(noRadio);
    fireEvent.click(continueButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425new');
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsCreateProjectFunding />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
