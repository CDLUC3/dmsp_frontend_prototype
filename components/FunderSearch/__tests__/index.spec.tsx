import React from 'react';

import {act, render, screen} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';
import {Affiliation, useAffiliationsLazyQuery} from '@/generated/graphql';

import FunderSearch from '@/components/FunderSearch';


expect.extend(toHaveNoViolations);

jest.mock('@/generated/graphql', () => ({
  useAffiliationsLazyQuery: jest.fn(),
}));


const mockFunderResults = {
  "data": {
    "affiliations": [
      {
        "id": 1,
        "displayName": "National Science Foundation (nsf.gov)",
        "uri": "https://ror.org/021nxhr62",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 2,
        "displayName": "Antarctic Sciences (nsf.gov)",
        "uri": "https://ror.org/05fnzca26",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 3,
        "displayName": "Swiss National Science Foundation (snf.ch)",
        "uri": "https://ror.org/00yjd3n13",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 4,
        "displayName": "National Natural Science Foundation of China (nsfc.gov.cn)",
        "uri": "https://ror.org/01h0zpd94",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 5,
        "displayName": "National Center for Science and Engineering Statistics (nsf.gov)",
        "uri": "https://ror.org/0445wmv88",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 6,
        "displayName": "Simons Foundation (simonsfoundation.org)",
        "uri": "https://ror.org/01cmst727",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 7,
        "displayName": "NSF of Sri Lanka",
        "uri": "https://dmptool.org/affiliations/5bc40c82",
        "__typename": "AffiliationSearch"
      },
      {
        "id": 8,
        "displayName": "Directorate for Social, Behavioral & Economic Sciences (nsf.gov)",
        "uri": "https://ror.org/03h7mcc28",
        "__typename": "AffiliationSearch"
      }
    ]
  }
};

const mockHook = (hook: any) => hook as jest.Mock;


describe("FunderSearch", () => {
  beforeEach(() => {
    mockHook(useAffiliationsLazyQuery).mockReturnValue({
      data: mockFunderResults,
      loading: false,
      error: null,
    });
  });

  it("should render the view", async () => {
    render(<FunderSearch />);
    expect(screen.getByTestId('search-filed')).toBeInTheDocument();
  });

});
