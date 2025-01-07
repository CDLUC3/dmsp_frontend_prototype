import React from "react";
import {act, fireEvent, render, screen, waitFor} from '@/utils/test-utils';
import {useTemplateQuery,} from '@/generated/graphql';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useParams} from 'next/navigation';
import {useTranslations as OriginalUseTranslations} from 'next-intl';
import SectionTypeSelectPage from '../page';

expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useTemplateQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();

type UseTranslationsType = ReturnType<typeof OriginalUseTranslations>;


// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: UseTranslationsType = ((key: string) => key) as UseTranslationsType;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
    };

    return mockUseTranslations;
  }),
}));

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

const mockTemplateData = {
  "name": "DMP Template from Dataverse",
  "description": "DMP Template from Dataverse",
  "errors": null,
  "latestPublishVersion": "v1",
  "latestPublishDate": "1648835084000",
  "created": "1412980160000",
  "sections": [
    {
      "id": 67,
      "displayOrder": 1,
      "bestPractice": false,
      "name": "Data description",
      "questions": [
        {
          "errors": null,
          "displayOrder": 1,
          "guidanceText": "<p><br><a href=\"http://thedata.org/book/data-management-plan\">Dataverse page on DMPs</a></p>",
          "id": 67,
          "questionText": "<p>Briefly describe nature &amp; scale of data {simulated, observed, experimental information; samples; publications; physical collections; software; models} generated or collected.</p>"
        }
      ]
    },
    {
      "id": 68,
      "displayOrder": 1,
      "bestPractice": true,
      "name": "Roles and Responsibilities",
      "questions": [
        {
          "errors": null,
          "displayOrder": 1,
          "guidanceText": "<p>Test</p>",
          "id": 68,
          "questionText": "<p>Roles and Responsibilities within a data management plan covers how the responsibilities for the management of your data will be delegated and potentially transferred over the long term.</p>"
        }
      ]
    },
  ]
};

describe("SectionTypeSelectPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
  });

  it("should render loading state", async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
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

  it("should render data returned from template query correctly", async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

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
    const selectLink = screen.getAllByRole('link', { name: 'Select' });
    const createNew = screen.getByRole('link', { name: 'buttons.createNew' });
    const questionsCount = screen.getAllByText('questionsCount');
    expect(heading).toHaveTextContent('headings.addNewSection');
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.templates')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.section')).toBeInTheDocument();
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByLabelText('search.label')).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();
    expect(screen.getByText('search.helpText')).toBeInTheDocument();
    expect(headingPreviouslyCreated).toBeInTheDocument();
    expect(screen.getByText('Data description')).toBeInTheDocument();
    expect(questionsCount).toHaveLength(2);
    expect(selectLink).toHaveLength(2);
    expect(headingBestPractice).toBeInTheDocument();
    expect(screen.getByText('Roles and Responsibilities')).toBeInTheDocument();
    expect(headingsBuildNewSection).toBeInTheDocument();
    expect(createNew).toBeInTheDocument();
  });

  it('should show filtered list when user clicks Search button', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

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
    expect(screen.getByText('Data description')).toBeInTheDocument();
  })

  it('should show error message when we cannot find item that matches search term', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

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

  it('should show error message when query fails with a network error', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: 'There was an error.' },
      refetch: jest.fn()
    });
    await act(async () => {
      render(
        <SectionTypeSelectPage />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('messaging.somethingWentWrong')).toBeInTheDocument();
    });
  })

  it('should pass axe accessibility test', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    const { container } = render(
      <SectionTypeSelectPage />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });
});
