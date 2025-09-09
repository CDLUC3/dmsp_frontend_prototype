import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import ProjectsProjectPlanFeedback from "../page";

expect.extend(toHaveNoViolations);

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    projectId: 'test-project-id',
    dmpid: 'test-dmp-id',
  })),
}));

// Mock the PageHeader component
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />,
}));

// Mock ExpandableContentSection
jest.mock('@/components/ExpandableContentSection', () => ({
  __esModule: true,
  default: ({ children, heading }: { children: React.ReactNode; heading: string }) => (
    <div data-testid="expandable-section">
      <h3>{heading}</h3>
      {children}
    </div>
  ),
}));


// Mock routePath
jest.mock('@/utils/routes', () => ({
  routePath: jest.fn((route, params) => `/${route}/${params?.projectId || ''}/${params?.dmpId || ''}`),
}));

describe('ProjectsProjectPlanFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page successfully', () => {
    render(<ProjectsProjectPlanFeedback />);
    
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'form.label' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'form.submitButton' })).toBeInTheDocument();
  });

  it('should display form elements correctly', () => {
    render(<ProjectsProjectPlanFeedback />);
    
    const textarea = screen.getByRole('textbox', { name: 'form.label' });
    const submitButton = screen.getByRole('button', { name: 'form.submitButton' });
    
    expect(textarea).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('should handle form submission', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<ProjectsProjectPlanFeedback />);
    
    const textarea = screen.getByRole('textbox', { name: 'form.label' });
    const submitButton = screen.getByRole('button', { name: 'form.submitButton' });
    
    // Type in the textarea
    fireEvent.change(textarea, { target: { value: 'Test feedback message' } });
    
    // Submit the form
    fireEvent.click(submitButton);
    
    // Check that console.log was called (simulating the submission)
    expect(consoleSpy).toHaveBeenCalledWith('Requesting feedback from University of California support team');
    expect(consoleSpy).toHaveBeenCalledWith('Feedback message:', 'Test feedback message');
    
    // Check loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('form.successMessage')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Check that textarea is hidden after submission
    expect(screen.queryByRole('textbox', { name: 'form.label' })).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should display sidebar content', () => {
    render(<ProjectsProjectPlanFeedback />);
    
    expect(screen.getByText('sidebar.universitySupport.title')).toBeInTheDocument();
    expect(screen.getByText('sidebar.teamMembers.title')).toBeInTheDocument();
  });

  it('should display team feedback section', () => {
    render(<ProjectsProjectPlanFeedback />);
    
    expect(screen.getByText('teamFeedback.title')).toBeInTheDocument();
    expect(screen.getByText('teamFeedback.description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'teamFeedback.updateAccessButton' })).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanFeedback />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

