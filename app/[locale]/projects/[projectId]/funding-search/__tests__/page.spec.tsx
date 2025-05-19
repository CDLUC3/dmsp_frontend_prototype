import React from 'react';

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

import { useParams, useRouter } from 'next/navigation';
import { MockedProvider } from '@apollo/client/testing';
import {
  AffiliationFundersDocument,
  AddProjectFunderDocument,
} from '@/generated/graphql';

import { stripHtml, scrollToTop } from '@/utils/general';

import CreateProjectSearchFunder from '../page';
import { toHaveNoViolations } from 'jest-axe';


expect.extend(toHaveNoViolations);


const mocks = [
  {
    request: {
      query: AffiliationFundersDocument,
      variables: {
        name: "nih",
        funderOnly: true,
        paginationOptions: {
          type: "CURSOR",
          limit: 50,
        },
      },
    },

    result: {
      data: {
        affiliations: {
          items: Array.from({length: 50}, (_, i) => {
            const count = i + 1;
            return {
              id: count,
              uri: `https://funder${count}`,
              displayName: `Funder ${count}`,
            };
          }),
          totalCount: 50,
          limit: 50,
          nextCursor: null,
          currentOffset: null,
          hasNextPage: false,
          hasPreviousPage: null,
          availableSortFields: []
        }
      }
    },
  },

  // Paginated Mocks
  {
    request: {
      query: AffiliationFundersDocument,
      variables: {
        name: "paginated",
        funderOnly: true,
        paginationOptions: {
          type: "CURSOR",
          limit: 50,
        },
      },
    },

    result: {
      data: {
        affiliations: {
          items: Array.from({length: 50}, (_, i) => {
            const count = i + 1;
            return {
              id: count,
              uri: `https://funder${count}`,
              displayName: `Funder ${count}`,
            };
          }),
          totalCount: 70,
          limit: 50,
          nextCursor: "page2",
          currentOffset: null,
          hasNextPage: true,
          hasPreviousPage: null,
          availableSortFields: []
        }
      }
    },
  },

  // Paginated second page
  {
    request: {
      query: AffiliationFundersDocument,
      variables: {
        name: "paginated",
        funderOnly: true,
        paginationOptions: {
          type: "CURSOR",
          cursor: "page2",
          limit: 50,
        },
      },
    },

    result: {
      data: {
        affiliations: {
          items: Array.from({length: 20}, (_, i) => {
            const count = i + 51;
            return {
              id: count,
              uri: `https://funder${count}`,
              displayName: `Funder ${count}`,
            };
          }),
          totalCount: 70,
          limit: 50,
          nextCursor: null,
          currentOffset: null,
          hasNextPage: true,
          hasPreviousPage: null,
          availableSortFields: []
        }
      }
    },
  },

  // This is for when we select a funder
  {
    request: {
      query: AddProjectFunderDocument,
      variables: {
        input: {
          projectId: 123,
          affiliationId: "https://funder1",
        },
      },
    },

    result: {
      data: {
        addProjectFunder: {
          errors: {
              affiliationId: null,
              funderOpportunityNumber: null,
              funderProjectNumber: null,
              general: null,
              grantId: null,
              projectId: null,
              status: null,
          },
        }
      }
    },
  },

  // Mocked error response for addProjectFunder
  {
    request: {
      query: AddProjectFunderDocument,
      variables: {
        input: {
          projectId: 123,
          // We will use funder3 for the error
          affiliationId: "https://funder3",
        },
      },
    },

    result: {
      data: {
        addProjectFunder: {
          errors: {
            affiliationId: null,
            funderOpportunityNumber: null,
            funderProjectNumber: null,
            general: "This should throw an error",
            grantId: null,
            projectId: null,
            status: null,
          },
        }
      }
    },
  },
];


// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));


// Needed for the errormessages component
jest.mock('@/utils/general', () => ({
  scrollToTop: jest.fn(),

  // FIXME:: I'm mocking this function because it's breaking all my tests
  // for some reason. Need to debug
  stripHtml: jest.fn(),
}));


describe("CreateProjectSearchFunder", () => {

  beforeEach(() => {
    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '123' });

    // const mockRouter = useRouter as jest.Mock;
    // mockRouter.mockReturnValue({ push: jest.fn() });
  });

  it("Should render the view", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: Search-field is the testid provided by the fundersearch component
    expect(screen.getByTestId('search-field')).toBeInTheDocument();
  });

  it("Should render the search results", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: search-field and search-input are testID's provided by elements
    // inside the FunderSearch component.
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "nih" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      const resultSet = [
        ["Funder 1", "https://funder1"],
        ["Funder 30", "https://funder30"],
      ]
      resultSet.forEach((funder) => {
        const funderTitle = screen.getByText(funder[0]);
        const funderContainer = funderTitle.closest('div');
        const funderContent = within(funderContainer);
        const selectBtn = funderContent.getByRole('button', {
          name: /select/i,
        });

        expect(funderTitle).toBeInTheDocument();
        expect(selectBtn).toHaveAttribute('data-funder-uri', funder[1]);
      });
    });
  });

  it("Load More button visible when there are more results", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: search-field and search-input are testID's provided by elements
    // inside the FunderSearch component.
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "paginated" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      const funderTitle = screen.getByText("Funder 50");
      const funderContainer = funderTitle.closest('div');
      const funderContent = within(funderContainer);
      const selectBtn = funderContent.getByRole('button', {
        name: /select/i,
      });

      expect(funderTitle).toBeInTheDocument();
      expect(selectBtn).toHaveAttribute('data-funder-uri', "https://funder50");
    });

    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument();
  });

  it("Should load more when clicking the button", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: search-field and search-input are testID's provided by elements
    // inside the FunderSearch component.
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "paginated" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      const funderTitle = screen.getByText("Funder 50");
      const funderContainer = funderTitle.closest('div');
      const funderContent = within(funderContainer);
      const selectBtn = funderContent.getByRole('button', {
        name: /select/i,
      });

      expect(funderTitle).toBeInTheDocument();
      expect(selectBtn).toHaveAttribute('data-funder-uri', "https://funder50");
    });

    const loadMoreBtn = screen.getByTestId('load-more-btn');
    expect(loadMoreBtn).toBeInTheDocument();
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(screen.getByText("Funder 70")).toBeInTheDocument();
    });
  });

  it("Should run the addFunder mutation and redirect when selecting a funder", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: search-field and search-input are testID's provided by elements
    // inside the FunderSearch component.
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "nih" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText("Funder 1")).toBeInTheDocument();
    });

    const firstFunder = screen.getByText("Funder 1").closest('div');
    const funderContent = within(firstFunder);
    const selectBtn = funderContent.getByRole('button', {
      name: /select/i,
    });
    expect(selectBtn).toHaveAttribute('data-funder-uri', 'https://funder1');
    fireEvent.click(selectBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/projects\/123/));
    });
  });

  it("Should handle Errors", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CreateProjectSearchFunder />
      </MockedProvider>
    );

    // NOTE: search-field and search-input are testID's provided by elements
    // inside the FunderSearch component.
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "nih" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText("Funder 30")).toBeInTheDocument();
    });

    const firstFunder = screen.getByText("Funder 3").closest('div');
    const funderContent = within(firstFunder);
    const selectBtn = funderContent.getByRole('button', {
      name: /select/i,
    });
    expect(selectBtn).toHaveAttribute('data-funder-uri', 'https://funder3');
    fireEvent.click(selectBtn);

    await waitFor(() => {
      expect(screen.getByText("This should throw an error")).toBeInTheDocument();
      expect(scrollToTop).toHaveBeenCalled();
    });
  });

});
