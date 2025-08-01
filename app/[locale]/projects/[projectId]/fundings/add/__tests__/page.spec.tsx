import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { MockedProvider } from '@apollo/client/testing';
import {
  AddAffiliationDocument,
  AddProjectFundingDocument,
} from '@/generated/graphql';

import logECS from '@/utils/clientLogger';

import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

import AddProjectFunderManually from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';


expect.extend(toHaveNoViolations);


const successMocks = [
  // For creating the Affiliate
  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "New-funderName-123",
        },
      },
    },

    result: {
      data: {
        addAffiliation: {
          errors: {
            name: null,
          },
          id: "222",
        }
      }
    },
  },

  // Second part for creating the ProjectFunding connection
  {
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "222",
          funderOpportunityNumber: 'New-opportunity-123',
          funderProjectNumber: 'New-projectNumber-123',
          grantId: 'New-grantNumber-123',
          status: 'PLANNED',
        }
      },
    },

    result: {
      data: {
        addProjectFunding: {
          id: "333",
          errors: {
            projectId: null,
            affiliationId: null,
            funderOpportunityNumber: null,
            funderProjectNumber: null,
            grantId: null,
            general: null,
            status: null,
          },
        },
      },
    },
  },
];

const errorMocks = [
  // For creating the Affiliate
  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "Affiliate Field Error",
        },
      },
    },

    result: {
      data: {
        addAffiliation: {
          errors: {
            name: "Error with affiliate name",
          },
          id: null,
        }
      }
    },
  },

  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "Valid Affiliate",
        },
      },
    },

    result: {
      data: {
        addAffiliation: {
          errors: {
            name: null,
          },
          id: "222",
        }
      }
    },
  },

  // Second part for creating the ProjectFunding connection
  {
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "222",
          funderOpportunityNumber: '',
          funderProjectNumber: '',
          grantId: '',
          status: 'PLANNED',
        }
      },
    },

    result: {
      data: {
        addProjectFunding: {
          id: "333",
          errors: {
            projectId: null,
            affiliationId: null,
            funderOpportunityNumber: "Opportunity number is required",
            funderProjectNumber: "Project number is required",
            grantId: "Grant id is required",
            general: null,
            status: null,
          },
        },
      },
    },
  },

  // Apollo Errors
  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "Affiliate Exception",
        },
      },
    },
    error: new Error('Server Error')
  }
];


jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}));


describe('AddProjectFunderManually', () => {

  beforeEach(() => {
    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '111' });

    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
  });

  it('should render the project details form', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={successMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    expect(screen.getByLabelText('labels.funderName')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.funderName')).toBeInTheDocument();
    expect(screen.getByText('labels.grantNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.projectNumber')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.opportunity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.saveChanges/i })).toBeInTheDocument();
  });

  it('should run correct mutations and redirect on submitting valid data', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    await act(async () => {
      render(
        <MockedProvider mocks={successMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    // Update data
    fireEvent.change(
      screen.getByLabelText('labels.funderName'),
      {target: { value: 'New-funderName-123' }}
    );

    fireEvent.change(
      screen.getByLabelText('labels.fundingStatus'),
      { target: { value: 'PLANNED' } }
    );

    // To change the value in FormSelect, we need to "click" one of the options
    // const optionGranted = screen.getByRole('option', { name: 'GRANTED' });
    // await fireEvent.click(optionGranted);

    fireEvent.change(
      screen.getByLabelText('labels.grantNumber'),
      { target: { value: 'New-grantNumber-123' } }
    );

    fireEvent.change(
      screen.getByLabelText('labels.projectNumber'),
      { target: { value: 'New-projectNumber-123' } }
    );

    fireEvent.change(
      screen.getByLabelText('labels.opportunity'),
      { target: { value: 'New-opportunity-123' } }
    );

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/projects\/111\/fundings/));
    });
  });

  it('should display errors for the affiliation name', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    fireEvent.change(
      screen.getByLabelText('labels.funderName'),
      {target: { value: 'Affiliate Field Error' }}
    );

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    await waitFor(() => {
      expect(screen.getByText('messages.errors.projectFundingUpdateFailed')).toBeInTheDocument();
      expect(screen.getByText('Error with affiliate name')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should display errors for the projectfunding fields', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    fireEvent.change(
      screen.getByLabelText('labels.funderName'),
      {target: { value: 'Valid Affiliate' }}
    );

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    await waitFor(() => {
      expect(screen.getByText('messages.errors.projectFundingUpdateFailed')).toBeInTheDocument();
      expect(screen.getByText('Opportunity number is required')).toBeInTheDocument();
      expect(screen.getByText('Project number is required')).toBeInTheDocument();
      expect(screen.getByText('Grant id is required')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should handle errors thrown by the graphql mutations promise chain', async() => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    fireEvent.change(
      screen.getByLabelText('labels.funderName'),
      {target: { value: 'Affiliate Exception' }}
    );

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    await waitFor(() => {
      expect(screen.getByText('messages.errors.projectFundingUpdateFailed')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'addProjectFunderManually',
        expect.objectContaining({
          err: expect.anything(),
          url: { path: '/projects/[projectId]/fundings/add' },
        })
      );
    });
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <AddProjectFunderManually />
      </MockedProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
