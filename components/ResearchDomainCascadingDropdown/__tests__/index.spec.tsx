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

    render(
      <ResearchDomainCascadingDropdown
        projectData={{}}
        setProjectData={mockSetProjectData}
      />
    );

    expect(screen.getByText(/labels.researchDomain/i)).toBeInTheDocument();
    expect(await screen.findByText('Domain 1')).toBeInTheDocument();
    expect(await screen.findByText('Domain 2')).toBeInTheDocument();
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
      parentResearchDomainId: '1',
      researchDomainId: '3',
      projectName: 'Test Project',
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

    render(
      <ResearchDomainCascadingDropdown
        projectData={{}}
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

    // Trigger re-render to reflect updated child domains

    // Find and click the child select button to open the dropdown
    const childDropdownButton = selectButtons[1];
    fireEvent.click(childDropdownButton);

    // Confirm child dropdown updated
    const childOption1 = await screen.findAllByText(/Child Domain 1/i);
    const childOption2 = await screen.findAllByText(/Child Domain 2/i);
    expect(childOption1[0]).toBeInTheDocument();
    expect(childOption2[0]).toBeInTheDocument();

    // Select a child option
    await userEvent.click(childOption1[0]);
    expect(mockSetProjectData).toHaveBeenCalledWith({
      researchDomainId: '1',
    });
  });

  it('should set child list to empty array if parentResearchDomainId is missing', async () => {
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

    render(
      <ResearchDomainCascadingDropdown
        projectData={{}}
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

    // Find and click the child select button to open the dropdown
    const childDropdownButton = selectButtons[1];
    fireEvent.click(childDropdownButton);

    // Get all elements with the same data-testid
    const hiddenContainers = screen.getAllByTestId('hidden-select-container');

    // Find the correct container by looking for the <select> with name="childDomain"
    const correctContainer = hiddenContainers.find(container =>
      container.querySelector('select[name="childDomain"]')
    );

    // Assert that the correct container was found
    expect(correctContainer).toBeDefined();

    // Query the <select> element inside the correct container
    const hiddenChildDomainSelect = correctContainer?.querySelector('select[name="childDomain"]');

    // Assert that the <select> element exists and is disabled
    expect(hiddenChildDomainSelect).toBeDisabled();

    // Assert that there are no options within the <select>
    const childOptions = hiddenChildDomainSelect?.querySelectorAll('option');

    // Filter out empty or placeholder options
    const meaningfulOptions = Array.from(childOptions || []).filter(
      option => option.value.trim() !== '' || option.textContent?.trim() !== ''
    );

    // Assert that there are no meaningful options
    expect(meaningfulOptions.length).toBe(0);
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

    render(
      <ResearchDomainCascadingDropdown
        projectData={{}}
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
    });
  });
});
