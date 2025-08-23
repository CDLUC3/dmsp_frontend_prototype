import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { MockedProvider } from '@apollo/client/testing';
import * as apolloClientModule from '@/lib/graphql/client/apollo-client';
import { useTranslations } from 'next-intl';
import {
  AffiliationsDocument,
  AddAffiliationDocument,
  AddProjectFundingDocument,
} from '@/generated/graphql';

import logECS from '@/utils/clientLogger';

import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

import AddProjectFunderManually from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';


expect.extend(toHaveNoViolations);
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/lib/graphql/client/apollo-client');



const mockQuery = jest.fn();
const mockClient = { query: mockQuery };

const successMocks = [
  // For TypeAheadSearch
  {
    request: {
      query: AffiliationsDocument,
      variables: {
        name: 'term'
      },
    },
    result: {
      data: {
        affiliations: {
          totalCount: 2,
          items: [
            {
              id: '1',
              displayName: "Valid Affiliate 1",
              uri: 'https://dmptool/123',
            },
            {
              id: '2',
              displayName: "Valid Affiliate 2",
              uri: 'https://dmptool/456'
            },
          ],
          __typename: "AffiliationSearchResults"
        },
      },
    },
  },
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
          uri: "https://dmptool/123",
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
          affiliationId: "https://dmptool/123",
          funderOpportunityNumber: 'New-opportunity-123',
          funderProjectNumber: 'New-projectNumber-123',
          grantId: 'New-grantNumber-123',
          status: 'GRANTED',
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
  // For adding Other 
  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "Other Affiliation",
        },
      },
    },

    result: {
      data: {
        addAffiliation: {
          errors: {
            name: null,
          },
          uri: "https://dmptool/other",
        }
      }
    },
  },
  // For adding Other 
  {
    request: {
      query: AddAffiliationDocument,
      variables: {
        input: {
          funder: true,
          name: "Other Affiliation",
        },
      },
    },

    result: {
      data: {
        addAffiliation: {
          errors: {
            name: null,
          },
          uri: "https://dmptool/other",
        }
      }
    },
  },
  {//Called after Typeahead search
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "https://ror.org/1234",
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
  {//Called after submitting form with Other affiliation
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "https://dmptool/other",
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
  {//Called after submitting form with Other affiliation
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "https://dmptool/other",
          funderOpportunityNumber: 'New-opportunity-123',
          funderProjectNumber: 'New-projectNumber-123',
          grantId: 'New-grantNumber-123',
          status: 'GRANTED',
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
  {
    request: {
      query: AffiliationsDocument,
      variables: {
        name: 'term'
      },
    },
    result: {
      data: {
        affiliations: {
          totalCount: 2,
          items: [
            {
              id: '1',
              displayName: "Valid Affiliate 1",
              uri: 'https://dmptool/123',
            },
            {
              id: '2',
              displayName: "Valid Affiliate 2",
              uri: 'https://dmptool/456'
            },
          ],
          __typename: "AffiliationSearchResults"
        },
      },
    },
  },
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
          uri: null,
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
          uri: "https://dmptool/123",
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
          affiliationId: "https://dmptool/123",
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
  {
    request: {
      query: AddProjectFundingDocument,
      variables: {
        input: {
          projectId: 111,
          affiliationId: "",
          funderOpportunityNumber: '',
          funderProjectNumber: '',
          grantId: '',
          status: 'PLANNED',
        }
      },
    },

    error: new Error('Server Error')
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
    jest.clearAllMocks();   // resets call history
    jest.resetModules();    // resets module state if needed
    // Reset all mocks and setup fresh state for each test
    jest.clearAllMocks();
    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '111' });

    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    (apolloClientModule.createApolloClient as jest.Mock).mockImplementation(() => mockClient);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  })
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

  it.skip('should run correct mutations and redirect on submitting valid data', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });

    await act(async () => {
      render(
        <MockedProvider mocks={successMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    // Navigate to "Other" option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    });

    // Select "Other"
    await act(async () => {
      fireEvent.keyDown(screen.getByText('Other'), { key: 'Enter', code: 'Enter' });
    });

    // Wait for the "Other Institution" field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Other Institution')).toBeInTheDocument();
    });

    // Find and fill the "Other Institution" input field
    const otherInstitutionInput = screen.getByLabelText('Other Institution');
    expect(otherInstitutionInput).toBeInTheDocument();

    // Clear the existing placeholder value and enter new value
    fireEvent.change(otherInstitutionInput, { target: { value: '' } });
    fireEvent.change(otherInstitutionInput, { target: { value: 'Other Affiliation' } });

    // Verify the value was set
    await waitFor(() => {
      expect(otherInstitutionInput).toHaveValue('Other Affiliation');
    })

    // To change the value in FormSelect, we need to "click" to open the options
    const statusSelect = screen.getByRole('button', { name: /fundingStatus/ });
    fireEvent.click(statusSelect);

    // Now we need to click on one of the options
    const optionGranted = screen.getByRole('option', { name: /granted/i });
    fireEvent.click(optionGranted);

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
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));
    })

    await act(async () => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/projects\/111\/fundings/));
    });
  });

  it('should display errors for the affiliation name', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });


    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    // Navigate to "Other" option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    });

    // Select "Other"
    await act(async () => {
      fireEvent.keyDown(screen.getByText('Other'), { key: 'Enter', code: 'Enter' });
    });

    // Wait for the "Other Institution" field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Other Institution')).toBeInTheDocument();
    });

    // Find and fill the "Other Institution" input field
    const otherInstitutionInput = screen.getByLabelText('Other Institution');
    expect(otherInstitutionInput).toBeInTheDocument();

    // Clear the existing placeholder value and enter new value
    fireEvent.change(otherInstitutionInput, { target: { value: '' } });
    fireEvent.change(otherInstitutionInput, { target: { value: 'Affiliate Field Error' } });

    // Verify the value was set
    expect(otherInstitutionInput).toHaveValue('Affiliate Field Error');

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

    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });
    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    // Navigate to "Other" option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    });

    // Select "Other"
    await act(async () => {
      fireEvent.keyDown(screen.getByText('Other'), { key: 'Enter', code: 'Enter' });
    });

    // Wait for the "Other Institution" field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Other Institution')).toBeInTheDocument();
    });

    // Find and fill the "Other Institution" input field
    const otherInstitutionInput = screen.getByLabelText('Other Institution');
    expect(otherInstitutionInput).toBeInTheDocument();

    // Clear the existing placeholder value and enter new value
    fireEvent.change(otherInstitutionInput, { target: { value: '' } });
    fireEvent.change(otherInstitutionInput, { target: { value: 'Valid Affiliate' } });

    // Verify the value was set
    expect(otherInstitutionInput).toHaveValue('Valid Affiliate');

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

  it('should handle errors thrown by the graphql mutations promise chain', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });


    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });

    await act(async () => {
      render(
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    // Navigate to "Other" option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    });

    // Select "Other"
    await act(async () => {
      fireEvent.keyDown(screen.getByText('Other'), { key: 'Enter', code: 'Enter' });
    });

    // Wait for the "Other Institution" field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Other Institution')).toBeInTheDocument();
    });

    // Find and fill the "Other Institution" input field
    const otherInstitutionInput = screen.getByLabelText('Other Institution');
    expect(otherInstitutionInput).toBeInTheDocument();

    // Clear the existing placeholder value and enter new value
    fireEvent.change(otherInstitutionInput, { target: { value: '' } });
    fireEvent.change(otherInstitutionInput, { target: { value: 'Affiliate Exception' } });

    // Verify the value was set
    expect(otherInstitutionInput).toHaveValue('Affiliate Exception');

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

  it.skip('should allow user to select funder name from dropdown', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });
    await act(async () => {
      render(
        <MockedProvider mocks={successMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Test University')).toBeInTheDocument();
    });

    // Test arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    })

    fireEvent.keyDown(screen.getByText('Other'), { key: 'ArrowDown' });

    const listItem = await screen.findByText('Test University');

    expect(listItem).toHaveFocus();
    Object.defineProperty(listItem, 'innerText', { value: 'Test University' });

    await act(async () => {
      fireEvent.keyDown(listItem, { key: 'Enter', code: 'Enter' });
    });

    expect(input).toHaveValue('Test University');

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    // Successfully matches the values in the addProjectFunding mock above
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/projects\/111\/fundings/));
    });
  });

  it.skip('should set correct other funder name when form is submitted', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });
    await act(async () => {
      render(
        <MockedProvider mocks={successMocks} addTypename={false}>
          <AddProjectFunderManually />
        </MockedProvider>
      );
    });

    const input = screen.getByRole('textbox', { name: /funderName/ });

    act(() => {
      fireEvent.change(input, { target: { value: 'Test' } });
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    // Navigate to "Other" option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    await waitFor(() => {
      expect(screen.getByText('Other')).toHaveFocus();
    });

    // Select "Other"
    await act(async () => {
      fireEvent.keyDown(screen.getByText('Other'), { key: 'Enter', code: 'Enter' });
    });

    // Wait for the "Other Institution" field to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Other Institution')).toBeInTheDocument();
    });

    // Find and fill the "Other Institution" input field
    const otherInstitutionInput = screen.getByLabelText('Other Institution');
    expect(otherInstitutionInput).toBeInTheDocument();

    // Clear the existing placeholder value and enter new value
    fireEvent.change(otherInstitutionInput, { target: { value: '' } });
    fireEvent.change(otherInstitutionInput, { target: { value: 'Other Affiliation' } });

    // Verify the value was set
    expect(otherInstitutionInput).toHaveValue('Other Affiliation');

    // Submit the form
    fireEvent.submit(screen.getByRole('button', { name: /buttons.saveChanges/i }));

    // Verify successful submission
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/projects\/111\/fundings/));
    });
  });
});

describe('Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();   // resets call history
    jest.resetModules();    // resets module state if needed
    // Reset all mocks and setup fresh state for each test
    jest.clearAllMocks();
    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '111' });

    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    (apolloClientModule.createApolloClient as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  })


  it('should pass axe accessibility test', async () => {
    mockClient.query.mockResolvedValueOnce({
      data: {
        affiliations: {
          items: [
            { id: '1', displayName: 'Test University', uri: "https://ror.org/1234" },
            { id: '2', displayName: 'Test Institution', uri: "https://ror.org/2345" }
          ]
        }
      }
    });

    const { container } = render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <AddProjectFunderManually />
      </MockedProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
})
