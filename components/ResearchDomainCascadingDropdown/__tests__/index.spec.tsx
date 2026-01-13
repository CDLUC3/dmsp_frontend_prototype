import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResearchDomainCascadingDropdown from '../index';
import { useQuery, useLazyQuery } from '@apollo/client/react';

import {
  TopLevelResearchDomainsDocument,
  ChildResearchDomainsDocument
} from '@/generated/graphql';

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useLazyQuery: jest.fn(),
}));

// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);
const mockUseLazyQuery = jest.mocked(useLazyQuery);

let mockFetchChildResearchDomains: jest.Mock;

const setupMocks = () => {
  // Initialize the module-level variables
  mockFetchChildResearchDomains = jest.fn().mockResolvedValue({
    data: { childResearchDomains: [] },
  });

  // Create stable references OUTSIDE mockImplementation
  const stableTopLevelReturn = {
    data: {
      topLevelResearchDomains: [
        { id: 1, name: 'Domain 1', description: 'Domain 1' },
        { id: 2, name: 'Domain 2', description: 'Domain 2' },
      ],
    },
    loading: false,
    error: null
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === TopLevelResearchDomainsDocument) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return stableTopLevelReturn as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    };
  });

  // Lazy query mocks
  const stableChildDomainsData = { childResearchDomains: [] };

  const stableChildResearchDomainsReturn = [
    mockFetchChildResearchDomains,
    {
      data: stableChildDomainsData,
      loading: false,
      error: null
    }
  ];

  mockUseLazyQuery.mockImplementation((document) => {
    if (document === ChildResearchDomainsDocument) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return stableChildResearchDomainsReturn as any;
    }
    return {
      data: null,
      loading: false,
      error: undefined
    };
  });
};

describe('ResearchDomainCascadingDropdown', () => {
  const mockSetProjectData = jest.fn();

  beforeEach(() => {
    setupMocks();
    jest.clearAllMocks();
  })

  it('should render parent dropdown with top-level research domains', async () => {
    const mockProjectData = {
      projectName: 'Test Project',
      projectAbstract: 'This is a test project.',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      parentResearchDomainId: '2',
      researchDomainId: '3',
      isTestProject: false
    };

    render(
      <ResearchDomainCascadingDropdown
        projectData={mockProjectData}
        setProjectData={mockSetProjectData}
      />
    );

    const hiddenContainers = screen.getAllByTestId('hidden-select-container');
    const select = hiddenContainers[0].querySelector('select[name="researchDomain"]');
    const options = select?.querySelectorAll('option');
    const domain1Option = Array.from(options || []).find(opt => opt.textContent === 'Domain 1');
    const domain2Option = Array.from(options || []).find(opt => opt.textContent === 'Domain 2');
    expect(domain1Option).toBeInTheDocument();
    expect(domain2Option).toBeInTheDocument();
  });

  it('should set correct parent and child values on page load', async () => {
    const mockTopLevelResearchDomainsQuery = {
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'engineering-and-technology', description: 'Engineering and Technology' },
          { id: 2, name: 'natural-sciences', description: 'Natural Sciences' },
        ],
      },
      loading: false,
      error: undefined
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === TopLevelResearchDomainsDocument) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return mockTopLevelResearchDomainsQuery as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    // Create a mock refetch function
    const refetchMock = jest.fn().mockResolvedValue({
      data: {
        childResearchDomains: [
          { id: 3, name: 'materials-engineering', description: 'Materials Engineering' },
          { id: 4, name: 'civil-engineering', description: 'Civil Engineering' },
        ],
      }
    });

    const stableChildDomainsData = {
      childResearchDomains: [
        { id: 3, name: 'materials-engineering', description: 'Materials Engineering' },
        { id: 4, name: 'civil-engineering', description: 'Civil Engineering' },
      ],
    };

    const stableChildResearchDomainsReturn = [
      mockFetchChildResearchDomains,
      {
        data: stableChildDomainsData,
        loading: false,
        error: null
      },
      {
        refetch: refetchMock,
      }
    ];

    mockUseLazyQuery.mockImplementation((document) => {
      if (document === ChildResearchDomainsDocument) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return stableChildResearchDomainsReturn as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const mockSetProjectData = jest.fn();

    const mockProjectData = {
      projectName: 'Test Project',
      projectAbstract: 'This is a test project.',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      parentResearchDomainId: '1',
      researchDomainId: '3',
      isTestProject: false
    };

    render(
      <ResearchDomainCascadingDropdown
        projectData={mockProjectData}
        setProjectData={mockSetProjectData}
      />
    );

    // Wait for the component to process the initial data
    await waitFor(() => {
      const selectButtons = screen.getAllByTestId('select-button');
      expect(selectButtons).toHaveLength(2);
    }, { timeout: 3000 });

    // Check that both dropdowns have the correct values
    await waitFor(() => {
      const selectButtons = screen.getAllByTestId('select-button');

      // Assert parent dropdown value
      const parentButton = selectButtons[0];
      expect(within(parentButton).getByText('Engineering and Technology')).toBeInTheDocument();

      // Assert child dropdown value
      const childButton = selectButtons[1];
      expect(within(childButton).getByText('Materials Engineering')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should update child dropdown when a parent domain is selected', async () => {
    const mockTopLevelResearchDomainsQuery = {
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
      loading: false,
      error: undefined
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === TopLevelResearchDomainsDocument) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return mockTopLevelResearchDomainsQuery as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    // Update mockFetchChildResearchDomains to return proper data
    mockFetchChildResearchDomains.mockResolvedValue({
      data: {
        childResearchDomains: [
          { id: 3, description: 'Child Domain 1' },
          { id: 4, description: 'Child Domain 2' },
        ],
      }
    });

    const stableChildResearchDomainsReturn = [
      mockFetchChildResearchDomains,
      {
        data: {
          childResearchDomains: [
            { id: 3, description: 'Child Domain 1' },
            { id: 4, description: 'Child Domain 2' },
          ],
        },
        loading: false,
        error: null
      }
    ];

    mockUseLazyQuery.mockImplementation((document) => {
      if (document === ChildResearchDomainsDocument) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        return stableChildResearchDomainsReturn as any;
      }
      return [jest.fn(), { data: null, loading: false, error: undefined }] as any;
    });

    const mockProjectData = {
      projectName: 'Test Project',
      projectAbstract: 'This is a test project.',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      parentResearchDomainId: '2',
      researchDomainId: '3',
      isTestProject: false
    };

    render(
      <ResearchDomainCascadingDropdown
        projectData={mockProjectData}
        setProjectData={mockSetProjectData}
      />
    );

    const selectButtons = screen.getAllByTestId('select-button');
    const parentDropdownButton = selectButtons[0];
    fireEvent.click(parentDropdownButton);

    const options = await screen.findAllByRole('option', { name: 'Domain 1' });
    await userEvent.click(options[0]);

    // Check that mockFetchChildResearchDomains was called (NOT refetchMock!)
    await waitFor(() => {
      expect(mockFetchChildResearchDomains).toHaveBeenCalledWith({
        variables: { parentResearchDomainId: 1 }
      });
    });
  });

  it('should not display subdomains if parent domain is not selected', async () => {
    // Use a stable reference for child domains data
    const stableChildDomainsData = { childResearchDomains: [] };

    const mockTopLevelResearchDomainsQuery = {
      data: {
        topLevelResearchDomains: [
          { id: null, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
      loading: false,
      error: undefined
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === TopLevelResearchDomainsDocument) {
        return mockTopLevelResearchDomainsQuery as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    // Always return the same reference for data
    const stableChildResearchDomainsReturn = [
      mockFetchChildResearchDomains,
      {
        data: stableChildDomainsData,
        loading: false,
        error: null
      }
    ];

    mockUseLazyQuery.mockImplementation((document) => {
      if (document === ChildResearchDomainsDocument) {
        return stableChildResearchDomainsReturn as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const mockProjectData = {
      projectName: 'Test Project',
      projectAbstract: 'This is a test project.',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      parentResearchDomainId: '',
      researchDomainId: '3',
      isTestProject: false
    };

    render(
      <ResearchDomainCascadingDropdown
        projectData={mockProjectData}
        setProjectData={mockSetProjectData}
      />
    );

    const subdomainSelect = screen.queryByTestId('subdomain-select');
    expect(subdomainSelect).not.toBeInTheDocument();
  });


  it('calls setProjectData when a child domain is selected', async () => {
    const stableChildDomainsData = {
      childResearchDomains: [
        { id: 3, description: 'Child Domain 1' },
        { id: 4, description: 'Child Domain 2' },
      ]
    };

    const mockTopLevelResearchDomainsQuery = {
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1', description: 'Domain 1' }, // ← Changed id: null to id: 1
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
      loading: false,
      error: undefined
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === TopLevelResearchDomainsDocument) {
        return mockTopLevelResearchDomainsQuery as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const stableChildResearchDomainsReturn = [
      mockFetchChildResearchDomains,
      {
        data: stableChildDomainsData,
        loading: false,
        error: null
      }
    ];

    mockUseLazyQuery.mockImplementation((document) => {
      if (document === ChildResearchDomainsDocument) {
        return stableChildResearchDomainsReturn as any;
      }
      return [jest.fn(), { data: null, loading: false, error: undefined }] as any;
    });

    const mockProjectData = {
      projectName: 'Test Project',
      projectAbstract: 'This is a test project.',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      parentResearchDomainId: '2',
      researchDomainId: '3',
      isTestProject: false
    };

    render(
      <ResearchDomainCascadingDropdown
        projectData={mockProjectData}
        setProjectData={mockSetProjectData}
      />
    );

    const parentDropdownButton = screen.getAllByTestId('select-button')[0];
    fireEvent.click(parentDropdownButton);

    const parentOptions = await screen.findAllByRole('option', { name: 'Domain 1' });
    await userEvent.click(parentOptions[0]);

    // ← WAIT for the child dropdown to appear!
    await waitFor(() => {
      const selectButtons = screen.getAllByTestId('select-button');
      expect(selectButtons.length).toBe(2);
    });

    // Now it's safe to get the child dropdown
    const childDropdownButton = screen.getAllByTestId('select-button')[1];
    fireEvent.click(childDropdownButton);

    const childOptions = await screen.findAllByRole('option', { name: 'Child Domain 1' });
    await userEvent.click(childOptions[0]);

    expect(mockSetProjectData).toHaveBeenCalledWith({
      researchDomainId: '3', // ← This should be '3' (the child domain id), not '1'
      endDate: '2023-12-31',
      startDate: '2023-01-01',
      projectAbstract: 'This is a test project.',
      projectName: 'Test Project',
      isTestProject: false,
      parentResearchDomainId: '2'
    });
  });
});
