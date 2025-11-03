import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useAddSectionMutation,
  usePublishedSectionsLazyQuery
} from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import SectionTypeSelectPage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockPublishedSections from '../__mocks__/mockPublishedSections.json';


expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useAddSectionMutation: jest.fn(),
  usePublishedSectionsLazyQuery: jest.fn(),
  VersionedSectionSearchResult: jest.fn(),
  VersionedSectionSearchResults: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

const mockFetchSections = jest.fn();

describe("SectionTypeSelectPage", () => {
  let mockRouter;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Return [fetchFunction, { data, loading, error }]
    (usePublishedSectionsLazyQuery as jest.Mock).mockReturnValue([
      mockFetchSections,
      { data: mockPublishedSections, loading: false, error: null }
    ]);

  });

  it("should display loading message when sections are loading", async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Return [fetchFunction, { data, loading, error }]
    (usePublishedSectionsLazyQuery as jest.Mock).mockReturnValue([
      mockFetchSections,
      { data: null, loading: true, error: null }
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    expect(screen.getAllByText('messaging.loading')).toHaveLength(2); // One for each list
  });

  it("should handle when empty array is returned", async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    // Return [fetchFunction, { data, loading, error }]
    (usePublishedSectionsLazyQuery as jest.Mock).mockReturnValue([
      mockFetchSections,
      { data: { publishedSections: { items: [] } }, loading: false, error: null }
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    expect(screen.queryByText('headings.previouslyCreatedSections')).not.toBeInTheDocument();
    expect(screen.queryByText('headings.bestPracticeSections')).not.toBeInTheDocument();
  });

  it("should render data returned from published section query correctly", async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    const headingPreviouslyCreated = screen.getByRole('heading', { level: 2, name: 'headings.previouslyCreatedSections' });
    const headingBestPractice = screen.getByRole('heading', { level: 2, name: 'headings.previouslyCreatedSections' });
    const headingsBuildNewSection = screen.getByRole('heading', { level: 2, name: 'headings.buildNewSection' });
    const searchButton = screen.getByRole('button', { name: 'Clear search' });
    const createNew = screen.getByRole('link', { name: 'buttons.createNew' });
    expect(heading).toHaveTextContent('headings.addNewSection');
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.templates')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.addNewSection')).toBeInTheDocument();
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByLabelText('search.label')).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByText('search.helpText')).toBeInTheDocument();
    expect(headingPreviouslyCreated).toBeInTheDocument();
    expect(screen.getByText('Affiliation section A')).toBeInTheDocument();
    expect(screen.getByText('Affiliation section B')).toBeInTheDocument();
    expect(screen.getByText('Affiliation section C')).toBeInTheDocument();
    expect(screen.getByText('Affiliation section D')).toBeInTheDocument();
    expect(screen.getByText('Affiliation section E')).toBeInTheDocument();
    expect(screen.getByText('Affiliation section F')).toBeInTheDocument();
    expect(headingBestPractice).toBeInTheDocument();
    expect(screen.getByText('Best Practice section A')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section B')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section C')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section D')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section E')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section F')).toBeInTheDocument();
    expect(headingsBuildNewSection).toBeInTheDocument();
    expect(createNew).toBeInTheDocument();
  });

  it('should show filtered lists when user clicks Search button', async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);


    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    // Searching for translation key since cannot run next-intl for unit tests
    const searchInput = screen.getByLabelText(/search.label/i);
    expect(searchInput).toBeInTheDocument();

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'G' } });
    });
    const searchButton = screen.getByLabelText('Clear search');
    fireEvent.click(searchButton);

    expect(screen.getByText('Affiliation section G')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section G')).toBeInTheDocument();

    // Remove the search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: '' } });
    });
    fireEvent.click(searchButton);

    expect(screen.getByText('Affiliation section A')).toBeInTheDocument();
    expect(screen.getByText('Best Practice section A')).toBeInTheDocument();
  });

  it('should call addSectionMutation with correct input when select button is clicked', async () => {
    const mockAddSection = jest.fn().mockResolvedValueOnce({
      data: { addSection: { id: 999, errors: [] } }
    });
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      mockAddSection,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    // Find the select button for a specific section (e.g., "Best Practice section I")
    const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
    // Adjust index if needed to target the correct section
    fireEvent.click(selectButtons[selectButtons.length - 1]);

    await waitFor(() => {
      expect(mockAddSection).toHaveBeenCalledWith({
        variables: {
          input: {
            templateId: 123,
            copyFromVersionedSectionId: 217,
            name: "Best Practice section I",
          }
        }
      });
    });
  });

  it('should show error message when we cannot find item that matches search term', async () => {

    // Return [fetchFunction, { data, loading, error }]
    (usePublishedSectionsLazyQuery as jest.Mock).mockReturnValue([
      mockFetchSections,
      { data: {}, loading: false, error: null }
    ]);
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    const searchInput = screen.getByLabelText(/search.label/i);
    expect(searchInput).toBeInTheDocument();

    // enter search term that cannot be found
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } });
    });

    // Click the 'Search' button
    const searchButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(searchButton);

    await act(async () => {
      // Check that we message user about 'No items found'
      const errorElement = screen.getAllByText('messaging.noItemsFound');
      expect(errorElement).toHaveLength(2); // One for each list
    })
  })

  it('should pass axe accessibility test', async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const { container } = render(
      <SectionTypeSelectPage />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });

  it('should display correct pagination for sections', async () => {

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    // Find all pagination navs by role and aria-label
    const paginationNavs = screen.getAllByRole('navigation', { name: 'pagination' });
    expect(paginationNavs).toHaveLength(2); // One for each list

    // Check for the ordered lists inside each nav
    paginationNavs.forEach(nav => {
      expect(nav.querySelector('ol')).toBeInTheDocument();
    });

    const pageLinks = screen.getAllByRole('link', { name: /Page \d+/ });
    expect(pageLinks).toHaveLength(8);
  });

  it('should handle click of pagination links for org section', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    // Find all pagination navs by role and aria-label
    const paginationNavs = screen.getAllByRole('navigation', { name: 'pagination' });
    expect(paginationNavs).toHaveLength(2); // One for each list

    // Check for the ordered lists inside each nav
    paginationNavs.forEach(nav => {
      expect(nav.querySelector('ol')).toBeInTheDocument();
    });

    const pageLinks = screen.getAllByRole('link', { name: /Page \d+/ });
    expect(pageLinks).toHaveLength(8);
    const page1Link = screen.getAllByRole('link', { name: 'Page 1' });
    expect(page1Link[0]).toHaveClass('current');
    const page2Link = screen.getAllByRole('link', { name: 'Page 2' });
    expect(page2Link[0]).not.toHaveClass('current');
    fireEvent.click(page2Link[0]);

    await waitFor(() => {
      expect(page2Link[0]).toHaveClass('current');
      expect(page1Link[0]).not.toHaveClass('current');
      expect(screen.getByText('Affiliation section A')).toBeInTheDocument();
    });
  });

  it('should handle click of pagination navigation for best practices section', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    // Find all pagination navs by role and aria-label
    const paginationNavs = screen.getAllByRole('navigation', { name: 'pagination' });
    expect(paginationNavs).toHaveLength(2); // One for each list

    // Check for the ordered lists inside each nav
    paginationNavs.forEach(nav => {
      expect(nav.querySelector('ol')).toBeInTheDocument();
    });

    const pageLinks = screen.getAllByRole('link', { name: /Page \d+/ });
    expect(pageLinks).toHaveLength(8);
    const page1Link = screen.getAllByRole('link', { name: 'Page 1' });
    expect(page1Link[1]).toHaveClass('current');
    const page2Link = screen.getAllByRole('link', { name: 'Page 2' });
    expect(page2Link[1]).not.toHaveClass('current');
    fireEvent.click(page2Link[1]);

    await waitFor(() => {
      expect(page2Link[1]).toHaveClass('current');
      expect(page1Link[1]).not.toHaveClass('current');
      expect(screen.getByText('Affiliation section A')).toBeInTheDocument();
    });
  });

  it('should display error message when field-level error is returned from addSectionMutation', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          addSection: {
            id: null,
            errors: {
              name: "Name is required",
              general: "An error occurred"
            }
          }
        }
      }),
      {
        loading: false,
        error: null
      },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });


    // Find the select button for a specific section (e.g., "Best Practice section I")
    const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
    // Adjust index if needed to target the correct section
    fireEvent.click(selectButtons[selectButtons.length - 1]);
    await waitFor(async () => {
      // Check that we message user about 'No items found'
      const errorElement = screen.getByText('An error occurred');
      expect(errorElement).toBeInTheDocument();
    })
  })

  it('should call mockRouter if addSectionMutation is successful', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          addSection: {
            id: 1,
            errors: {
              general: null
            }
          }
        }
      }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });


    // Find the select button for a specific section (e.g., "Best Practice section I")
    const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
    // Adjust index if needed to target the correct section
    fireEvent.click(selectButtons[selectButtons.length - 1]);

    await waitFor(async () => {
      // Verify that router.push was called with "/login"
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/template/123/section/1');
    })
  })

  it('should display error if the response does not include data', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          addSection: null
        }
      }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });


    // Find the select button for a specific section (e.g., "Best Practice section I")
    const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
    // Adjust index if needed to target the correct section
    fireEvent.click(selectButtons[selectButtons.length - 1]);

    await waitFor(async () => {
      expect(screen.getByText('messages.errorCreatingSection')).toBeInTheDocument();
    })
  })

  it('should call logECS if addSectionMutation throws an error', async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockRejectedValueOnce(new Error('Network error')),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });


    // Find the select button for a specific section (e.g., "Best Practice section I")
    const selectButtons = screen.getAllByRole('button', { name: 'buttons.select' });
    // Adjust index if needed to target the correct section
    fireEvent.click(selectButtons[selectButtons.length - 1]);

    // //Check that error logged
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'copyPublishedSection',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/en-US/template/123/section/new' },
        })
      )
    })
  })
});


