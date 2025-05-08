import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { useAddSectionMutation, usePublishedSectionsQuery } from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import SectionTypeSelectPage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockPublishedSections from '../__mocks__/mockPublishedSections.json';


expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useAddSectionMutation: jest.fn(),
  usePublishedSectionsQuery: jest.fn(),
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


describe("SectionTypeSelectPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
  });

  it.skip("should render loading state", async () => {
    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    expect(screen.getByText(/messaging.loading.../i)).toBeInTheDocument();
  });

  it.skip("should render data returned from template query correctly", async () => {
    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: mockPublishedSections,
      loading: false,
      error: null,
    });


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
    expect(screen.getByText('Data Sharing')).toBeInTheDocument();
    expect(headingBestPractice).toBeInTheDocument();
    expect(screen.getByText('Selection and Preservation')).toBeInTheDocument();
    expect(headingsBuildNewSection).toBeInTheDocument();
    expect(createNew).toBeInTheDocument();
  });

  it.skip('should show filtered list when user clicks Search button', async () => {

    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: mockPublishedSections,
      loading: false,
      error: null,
    });

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
      fireEvent.change(searchInput, { target: { value: 'Data' } });
    });

    const searchButton = screen.getByLabelText('Clear search');
    fireEvent.click(searchButton);

    // Check that we can find section name that matches the search item
    expect(screen.getByText('Data Sharing')).toBeInTheDocument();
  })

  it.skip('should show error message when we cannot find item that matches search term', async () => {

    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: { publishedSections: mockPublishedSections },
      loading: false,
      error: null,
    });

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

    // Check that we message user about 'No items found'
    const errorElement = screen.getByText('messaging.noItemsFound');
    expect(errorElement).toBeInTheDocument();
  })

  it.skip('should show error message when query fails with a network error', async () => {

    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: 'There was an error.' },
      refetch: jest.fn()
    });

    (useAddSectionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('messaging.somethingWentWrong')).toBeInTheDocument();
    });
  })

  it.skip('should pass axe accessibility test', async () => {

    (usePublishedSectionsQuery as jest.Mock).mockReturnValue({
      data: { publishedSections: mockPublishedSections },
      loading: false,
      error: null,
    });

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
});
