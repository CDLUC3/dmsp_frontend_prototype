import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import '@testing-library/jest-dom';
import { MockedProvider } from '@apollo/client/testing';
import { axe, toHaveNoViolations } from 'jest-axe';

import { ProjectFundingsDocument } from '@/generated/graphql';

import ProjectsProjectFunding from '../page';


expect.extend(toHaveNoViolations);

const mockPush = jest.fn();

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
            "id": 1,
            "affiliation": {
              "displayName": "Test Funder 1",
              "uri": "https://funder-1",
            },
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
  });

  it('should render breadcrumbs correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
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
      expect(mockPush).toHaveBeenCalledWith('/en-US/projects/123/fundings/projFund_6902/edit');
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ProjectsProjectFunding />
      </MockedProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
