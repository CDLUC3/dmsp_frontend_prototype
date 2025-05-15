import React, { useState } from 'react';

import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { MockedProvider } from '@apollo/client/testing';
import { AffiliationFundersDocument } from '@/generated/graphql';

import FunderSearch from '@/components/FunderSearch';


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
          limit: 2,
        },
      },
    },

    result: {
      data: {
        affiliations: {
          items: [
            {
              uri: "https://fundera",
              displayName: "Funder A"
            },
            {
              uri: "https://funderb",
              displayName: "Funder B"
            },
          ],
          totalCount: 4,
          limit: 2,
          nextCursor: "abc1",
          currentOffset: null,
          hasNextPage: true,
          hasPreviousPage: null,
          availableSortFields: []
        }
      }
    },
  },

  {
    request: {
      query: AffiliationFundersDocument,
      variables: {
        name: "nih",
        funderOnly: true,
        paginationOptions: {
          type: "CURSOR",
          cursor: "abc1",
          limit: 2,
        },
      },
    },

    result: {
      data: {
        affiliations: {
          items: [
            {
              uri: "https://funderc",
              displayName: "Funder C"
            },
            {
              uri: "https://funderd",
              displayName: "Funder D"
            },
          ],
          totalCount: 4,
          limit: 2,
          nextCursor: "abc2",
          currentOffset: null,
          hasNextPage: false,
          hasPreviousPage: true,
          availableSortFields: []
        }
      }
    },
  },
];


describe("FunderSearch", () => {
  /**
    * A wrapper to simulate how the component is used, so that we can simulate
    * some the events and state changes.
    */
  function WrappedSearch() {
    const [moreCounter, setMoreCounter] = useState(0);
    const [funders, setFunders] = useState([])

    function handleResults(resp) {
      if (resp) {
        setFunders(resp.items);
      }
    }

    return (
      <>
        <FunderSearch
          limit={2}
          onResults={handleResults}
          moreTrigger={moreCounter}
        />

        <ul data-testid="results-list">
          {funders.map((funder, index) => (
            <li key={index}>
              <span>{funder.displayName}</span>
              <span>{funder.uri}</span>
            </li>
          ))}
        </ul>

        <button
          data-testid="loadmore"
          onClick={() => setMoreCounter(moreCounter + 1)}
          aria-label="Load more funders"
        >
          Load More
        </button>
      </>
    )
  }

  it("should render the component", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <FunderSearch onResults={() => {}} />
      </MockedProvider>
    );

    const searchField = screen.getByTestId('search-field');
    expect(searchField).toBeInTheDocument();
  });

  it("should perform search on submit", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <WrappedSearch />
      </MockedProvider>
    );

    // We must set the search term before we can search
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "nih" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      const resultSet = [
        ["Funder A", "https://fundera"],
        ["Funder B", "https://funderb"],
      ]
      for (const [name, uri] of resultSet) {
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(uri)).toBeInTheDocument();
      }
    });
  });
  
  it("should load more when the moretrigger is activated", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <WrappedSearch />
      </MockedProvider>
    );

    // We must set the search term before we can search
    const searchInput = screen.getByTestId('search-field')
                              .querySelector('input');
    fireEvent.change(searchInput, {target: {value: "nih" }});

    const searchBtn = screen.getByTestId('search-btn');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      const resultSet = [
        ["Funder A", "https://fundera"],
        ["Funder B", "https://funderb"],
      ]
      for (const [name, uri] of resultSet) {
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(uri)).toBeInTheDocument();
      }
    });

    const loadMoreBtn = screen.getByTestId('loadmore');
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      const resultSet = [
        ["Funder C", "https://funderc"],
        ["Funder D", "https://funderd"],
      ]
      for (const [name, uri] of resultSet) {
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(uri)).toBeInTheDocument();
      }
    });
  });
});
