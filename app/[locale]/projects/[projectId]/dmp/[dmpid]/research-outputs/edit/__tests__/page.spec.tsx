import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';

import ProjectsProjectPlanAdjustResearchOutputsEdit from '../page';
expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsProjectPlanAdjustResearchOutputsEdit', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    jest.spyOn(console, 'log').mockImplementation(() => { }); // Mock console.log
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  it('should render the form with all fields', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputsEdit />);

    // Check for the presence of form fields
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Abbreviation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Access Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Anticipated Release Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial License/i)).toBeInTheDocument();
    expect(screen.getByText(/May contain sensitive data/i)).toBeInTheDocument();
    expect(screen.getByText(/May contain personally identifiable information/i)).toBeInTheDocument();
  });

  it('should allow the user to fill out the form and submit', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputsEdit />);

    // Fill out the form fields
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Research Output Title' } });
    fireEvent.change(screen.getByLabelText(/Abbreviation/i), { target: { value: 'ROT' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'This is a description.' } });
    fireEvent.change(screen.getByLabelText(/Anticipated Release Date/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByLabelText(/Initial License/i), { target: { value: 'MIT' } });

    // Simulate checkbox interactions
    fireEvent.click(screen.getByText(/May contain sensitive data/i));
    fireEvent.click(screen.getByText(/May contain personally identifiable information/i));

    // Simulate form submission
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    // Verify the console log
    expect(console.log).toHaveBeenCalledWith('Submitting form data:', expect.any(Object));
  });

  it('should allow the user to cancel and go back', async () => {
    render(<ProjectsProjectPlanAdjustResearchOutputsEdit />);

    // Simulate cancel button click
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Verify navigation (mock window.history.back in a real test)
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/dmp/xxx/research-outputs');
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanAdjustResearchOutputsEdit />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
