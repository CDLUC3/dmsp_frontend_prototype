import React from "react";
import { render, screen, act } from '@/utils/test-utils';
import {
  useTemplateQuery,
} from '@/generated/graphql';

import { useParams } from 'next/navigation';
import { useTranslations as OriginalUseTranslations } from 'next-intl';
import SectionTypeSelectPage from '../page';

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


// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
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
    // Mock graphql requests
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
    // Mock the hook for data state
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
    const cardText = screen.getAllByText('This section includes:');
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
    expect(screen.getByText('questionsCount')).toBeInTheDocument();
    expect(selectLink).toHaveLength(4);
    expect(headingBestPractice).toBeInTheDocument();
    expect(screen.getByText('Ethics and Privacy Considerations')).toBeInTheDocument();
    expect(cardText).toHaveLength(3);
    expect(screen.getByText('5 pre-built questions')).toBeInTheDocument();
    expect(headingsBuildNewSection).toBeInTheDocument();
    expect(createNew).toBeInTheDocument();
  });
});