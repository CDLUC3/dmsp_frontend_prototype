import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResearchDomainCascadingDropdown from '../index';
import { useTopLevelResearchDomainsQuery, useChildResearchDomainsQuery } from '@/generated/graphql';

// Mock GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useTopLevelResearchDomainsQuery: jest.fn(),
  useChildResearchDomainsQuery: jest.fn(),
}));

describe('ResearchDomainCascadingDropdown', () => {
  const mockSetProjectData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  })

  it('should render parent dropdown with top-level research domains', async () => {
    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
    });

    (useChildResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: { childResearchDomains: [] },
      refetch: jest.fn(),
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

    const hiddenContainers = screen.getAllByTestId('hidden-select-container');
    const select = hiddenContainers[0].querySelector('select[name="researchDomain"]');
    const options = select?.querySelectorAll('option');
    const domain1Option = Array.from(options || []).find(opt => opt.textContent === 'Domain 1');
    const domain2Option = Array.from(options || []).find(opt => opt.textContent === 'Domain 2');
    expect(domain1Option).toBeInTheDocument();
    expect(domain2Option).toBeInTheDocument();
  });

  it('should set correct parent and child values on page load', async () => {
    // Mock the top-level domains query
    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'engineering-and-technology', description: 'Engineering and Technology' },
          { id: 2, name: 'natural-sciences', description: 'Natural Sciences' },
        ],
      },
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

    // Mock the child domains query to initially return the child data
    // (since the component will call refetch during initial load)
    (useChildResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        childResearchDomains: [
          { id: 3, name: 'materials-engineering', description: 'Materials Engineering' },
          { id: 4, name: 'civil-engineering', description: 'Civil Engineering' },
        ],
      },
      refetch: refetchMock,
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
    // Explicitly define the type for childDomainsData
    let childDomainsData: { childResearchDomains: { id: number; description: string }[] } = { childResearchDomains: [] };

    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
    });

    const refetchMock = jest.fn(({ parentResearchDomainId }) => {
      if (parentResearchDomainId === 1) {
        childDomainsData = {
          childResearchDomains: [
            { id: 3, description: 'Child Domain 1' },
            { id: 4, description: 'Child Domain 2' },
          ],
        };
      } else {
        childDomainsData = { childResearchDomains: [] };
      }
      return Promise.resolve({ data: childDomainsData });
    });

    (useChildResearchDomainsQuery as jest.Mock).mockImplementation(() => ({
      data: childDomainsData,
      refetch: refetchMock,
    }));

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

    // Find and click the parent select button to open the dropdown
    const selectButtons = screen.getAllByTestId('select-button');
    const parentDropdownButton = selectButtons[0];
    fireEvent.click(parentDropdownButton);

    // Wait for the dropdown item to appear
    const options = await screen.findAllByRole('option', { name: 'Domain 1' });
    await userEvent.click(options[0]);

    // Check that refetch was called with correct parent id
    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledWith({ parentResearchDomainId: 1 });
    });

    // Find and click the child select button to open the dropdown
    const childDropdownButton = screen.getAllByTestId('select-button')[1];
    fireEvent.click(childDropdownButton);

    // Wait for the child dropdown options to appear and select one
    const childOptions = await screen.findAllByRole('option', { name: 'Child Domain 1' });
    await userEvent.click(childOptions[0]);

    // Assert that mockSetProjectData was called with the correct value
    expect(mockSetProjectData).toHaveBeenCalledWith({
      researchDomainId: '1',
      endDate: '2023-12-31',
      startDate: '2023-01-01',
      projectAbstract: 'This is a test project.',
      projectName: 'Test Project',
      isTestProject: false,
      parentResearchDomainId: '2'
    });
  });

  it('should not display subdomains if parent domain is not selected', async () => {
    // Explicitly define the type for childDomainsData
    let childDomainsData: { childResearchDomains: { id: number; name: string, description: string }[] } = { childResearchDomains: [] };

    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: null, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
    });

    const refetchMock = jest.fn(({ parentResearchDomainId }) => {
      if (parentResearchDomainId === 1) {
        childDomainsData = {
          childResearchDomains: [
            { id: 3, name: 'Child Domain 1', description: 'Child Domain 1' },
            { id: 4, name: 'Child Domain 2', description: 'Child Domain 2' },
          ],
        };
      } else {
        childDomainsData = { childResearchDomains: [] };
      }
      return Promise.resolve({ data: childDomainsData });
    });

    (useChildResearchDomainsQuery as jest.Mock).mockImplementation(() => ({
      data: childDomainsData,
      refetch: refetchMock,
    }));


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
    // Explicitly define the type for childDomainsData
    let childDomainsData: { childResearchDomains: { id: number; description: string }[] } = { childResearchDomains: [] };

    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1', description: 'Domain 1' },
          { id: 2, name: 'Domain 2', description: 'Domain 2' },
        ],
      },
    });

    const refetchMock = jest.fn(({ parentResearchDomainId }) => {
      if (parentResearchDomainId === 1) {
        childDomainsData = {
          childResearchDomains: [
            { id: 3, description: 'Child Domain 1' },
            { id: 4, description: 'Child Domain 2' },
          ],
        };
      } else {
        childDomainsData = { childResearchDomains: [] };
      }
      return Promise.resolve({ data: childDomainsData });
    });

    (useChildResearchDomainsQuery as jest.Mock).mockImplementation(() => ({
      data: childDomainsData,
      refetch: refetchMock,
    }));

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

    // Find and click the parent select button to open the dropdown
    const parentDropdownButton = screen.getAllByTestId('select-button')[0];
    fireEvent.click(parentDropdownButton);

    // Wait for the dropdown item to appear and select a parent option
    const parentOptions = await screen.findAllByRole('option', { name: 'Domain 1' });
    await userEvent.click(parentOptions[0]);

    // Check that refetch was called with correct parent id
    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalledWith({ parentResearchDomainId: 1 });
    });

    // Find and click the child select button to open the dropdown
    const childDropdownButton = screen.getAllByTestId('select-button')[1];
    fireEvent.click(childDropdownButton);

    // Wait for the child dropdown options to appear and select one
    const childOptions = await screen.findAllByRole('option', { name: 'Child Domain 1' });
    await userEvent.click(childOptions[0]);

    // Assert that mockSetProjectData was called with the correct value
    expect(mockSetProjectData).toHaveBeenCalledWith({
      researchDomainId: '1',
      endDate: '2023-12-31',
      startDate: '2023-01-01',
      projectAbstract: 'This is a test project.',
      projectName: 'Test Project',
      isTestProject: false,
      parentResearchDomainId: '2'
    });
  });
});
