import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  });

  it('should render parent dropdown with top-level research domains', async () => {
    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1' },
          { id: 2, name: 'Domain 2' },
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

  it('should update child dropdown when a parent domain is selected', async () => {
    // Explicitly define the type for childDomainsData
    let childDomainsData: { childResearchDomains: { id: number; name: string }[] } = { childResearchDomains: [] };

    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1' },
          { id: 2, name: 'Domain 2' },
        ],
      },
    });

    const refetchMock = jest.fn(({ parentResearchDomainId }) => {
      if (parentResearchDomainId === 1) {
        childDomainsData = {
          childResearchDomains: [
            { id: 3, name: 'Child Domain 1' },
            { id: 4, name: 'Child Domain 2' },
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
    const childOption1 = await screen.findByRole('option', { name: 'Child Domain 1' });
    const childOption2 = await screen.findByRole('option', { name: 'Child Domain 2' });
    expect(childOption1).toBeInTheDocument();
    expect(childOption2).toBeInTheDocument();
  });


  it('calls setProjectData when a child domain is selected', async () => {
    // Explicitly define the type for childDomainsData
    let childDomainsData: { childResearchDomains: { id: number; name: string }[] } = { childResearchDomains: [] };

    (useTopLevelResearchDomainsQuery as jest.Mock).mockReturnValue({
      data: {
        topLevelResearchDomains: [
          { id: 1, name: 'Domain 1' },
          { id: 2, name: 'Domain 2' },
        ],
      },
    });

    const refetchMock = jest.fn(({ parentResearchDomainId }) => {
      if (parentResearchDomainId === 1) {
        childDomainsData = {
          childResearchDomains: [
            { id: 3, name: 'Child Domain 1' },
            { id: 4, name: 'Child Domain 2' },
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
      researchDomainId: '3',
    });
  });
});
