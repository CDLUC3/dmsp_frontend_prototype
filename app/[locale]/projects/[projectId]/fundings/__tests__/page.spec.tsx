import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import ProjectsProjectFunding from '../page';
import { useProjectFundingsQuery } from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';

import mockFunders from '../__mocks__/mockFunders.json';



jest.mock("@/generated/graphql", () => ({
  useProjectFundingsQuery: jest.fn(),
}));

expect.extend(toHaveNoViolations);

const mockPush = jest.fn();
const mockToast = {
  add: jest.fn(),
};

describe('ProjectsProjectFunding', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '123' });

    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);

    // Mock the hook for data state
    (useProjectFundingsQuery as jest.Mock).mockReturnValue({
      data: mockFunders,
      loading: false,
      error: null,
    });
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title and description', async () => {
    render(
        <ProjectsProjectFunding />
    );

    expect(screen.getByText('Project Funding')).toBeInTheDocument();
    expect(screen.getByText('Manage funding sources for your project')).toBeInTheDocument();
    // breadcrumbs
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectOverview')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectFunding')).toBeInTheDocument();
  });

  it('should render breadcrumbs correctly', async () => {
    render(
      <ProjectsProjectFunding />
    );

    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectOverview')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectFunding')).toBeInTheDocument();
  });

  it('should render the "Add funding" button and handles click', async () => {
    render(
      <ProjectsProjectFunding />
    );

    const addButton = screen.getByRole('button', { name: 'Add funding' });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockPush).toHaveBeenCalledWith('/en-US/projects/123/fundings/search');
    });
  });

  it('should render the fundings list and handles "Edit" button click', async () => {
    render(
      <ProjectsProjectFunding />
    );

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit Irish Research Council (research.ie) details');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en-US/projects/123/fundings/IRL-000000X1/edit');
    });
  });

  it('should display toast error when a user clicks a funder without a funderProjectNumber', async () => {
    render(
      <ProjectsProjectFunding />
    );

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit National Science Foundation (nsf.gov) details');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('messages.errors.funderNumberNotFound', { type: 'error' });
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
        <ProjectsProjectFunding />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
