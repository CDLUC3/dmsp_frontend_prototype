import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { axe, toHaveNoViolations } from 'jest-axe';

import { ProjectFundingsDocument } from '@/generated/graphql';

import ProjectsProjectFunding from '../page';
import { useToast } from '@/context/ToastContext';

expect.extend(toHaveNoViolations);

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

const mockPush = jest.fn();
const mockToast = {
  add: jest.fn(),
};

const mocks = [
  {
    request: {
      query: ProjectFundingsDocument,
      variables: {
        projectId: 123,
      },
    },
    result: {
      data: {
        projectFundings: [
          {
            id: 1,
            affiliation: {
              displayName: "Test Funder 1",
              name: "National Science Foundation",
              uri: "https://funder-1",
            },
            status: 'PLANNED',
            grantId: 'https://awards.example.com/245t24g4tg',
            funderOpportunityNumber: 'NSF-12345-ABC',
            funderProjectNumber: '945tg9h4g045g'
          },
          {
            id: 3,
            status: "DENIED",
            grantId: null,
            funderOpportunityNumber: "NSF-123455678/wf34f",
            funderProjectNumber: null,
            affiliation: {
              displayName: "National Science Foundation (nsf.gov)",
              name: "National Science Foundation",
              uri: "https://ror.org/021nxhr62"
            }
          }
        ],
      },
    }
  },
];


describe('ProjectsProjectFunding', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '123' });
    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title and description', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
    );

    expect(screen.getByText('Project Funding')).toBeInTheDocument();
    expect(screen.getByText('Manage funding sources for your project')).toBeInTheDocument();

    // breadcrumbs
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectOverview')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectFunding')).toBeInTheDocument();
  });

  it('should render breadcrumbs correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
    );

    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectOverview')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projectFunding')).toBeInTheDocument();
  });

  it('should render the "Add funding" button and handles click', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
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
    act(() => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsProjectFunding />
        </MockedProvider>
      );
    });

    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit Test Funder 1 details');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/en-US/projects/123/fundings/945tg9h4g045g/edit');
    });

  });

  it('should display toast error when a user clicks a funder without a funderProjectNumber', async () => {
    act(() => {
      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <ProjectsProjectFunding />
        </MockedProvider>
      );
    });
    await waitFor(() => {
      const editButton = screen.getByLabelText('Edit National Science Foundation (nsf.gov) details');
      expect(editButton).toBeInTheDocument();
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('messages.errors.funderNumberNotFound', { type: 'error' });
    });
  });


  it.only('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
    );
    // Wait for Apollo data to load (or check for a specific rendered element)
    await waitFor(async () => {
      // You can wait for some visible element to render
      const editButton = screen.getByLabelText('Edit National Science Foundation (nsf.gov) details');
      expect(editButton).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});