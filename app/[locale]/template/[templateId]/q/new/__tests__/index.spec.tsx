import React from "react";
import {act, fireEvent, render, screen} from '@/utils/test-utils';
import {useQuestionTypesQuery} from '@/generated/graphql';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useParams} from 'next/navigation';
import {useQueryStep} from '@/app/[locale]/template/[templateId]/q/new/utils';
import {useTranslations as OriginalUseTranslations} from 'next-intl';
import QuestionTypeSelectPage from "../page";

expect.extend(toHaveNoViolations);

// Mock the useQuestionTypesQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionTypesQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@/components/QuestionEdit', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked QuestionEdit</div>,
  };
});

jest.mock("@/app/[locale]/template/[templateId]/q/new/utils", () => ({
  useQueryStep: jest.fn()
}))

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

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

const mockQuestionTypes = {
  questionTypes: [
    {
      "errors": null,
      "id": 1,
      "name": "Rich Text Editor",
      "usageDescription": "For questions that allow you to format data using mark down."
    },
    {
      "errors": null,
      "id": 2,
      "name": "Text Area",
      "usageDescription": "For questions that require longer answers."
    },
    {
      "errors": null,
      "id": 3,
      "name": "Text Field",
      "usageDescription": "For questions that require short answers."
    }
  ]
}

describe("QuestionTypeSelectPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;
    const mockUseQueryStep = useQueryStep as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
    mockUseQueryStep.mockReturnValue(1);
  });

  it("should render loading state", async () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(
        <QuestionTypeSelectPage />
      );
    });

    expect(screen.getByText(/messaging.loading.../i)).toBeInTheDocument();
  });

  it("should render data returned from template query correctly", async () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: mockQuestionTypes,
      loading: false,
      error: null,
    });

    await act(async () => {
      render(
        <QuestionTypeSelectPage />
      );
    });

    const pageTitle = screen.getByRole('heading', { level: 1, name: 'title' });
    expect(pageTitle).toBeInTheDocument();
    const pageDescription = screen.getByText('description');
    expect(pageDescription).toBeInTheDocument();
    const searchInput = screen.getByLabelText('labels.searchByKeyword');
    expect(searchInput).toBeInTheDocument();
    const searchButton = screen.getByText('buttons.search');
    expect(searchButton).toBeInTheDocument();
    const searchHelpText = screen.getByText('searchHelpText');
    expect(searchHelpText).toBeInTheDocument();

    //Question types
    const questionTypeCard1 = screen.getByRole('heading', { level: 2, name: /Rich Text Editor/i });
    const questionTypeCard1Description = screen.getByText('For questions that allow you to format data using mark down.');
    const questionTypeCard2 = screen.getByRole('heading', { level: 2, name: /Text Area/i });
    const questionTypeCard2Description = screen.getByText('For questions that require longer answers.');
    const questionTypeCard3 = screen.getByRole('heading', { level: 2, name: /Text Field/i });
    const questionTypeCard3Description = screen.getByText('For questions that require short answers.');
    const selectButtons = screen.getAllByRole('button', { name: /buttons.select/i });
    expect(questionTypeCard1).toBeInTheDocument();
    expect(questionTypeCard1Description).toBeInTheDocument();
    expect(questionTypeCard2).toBeInTheDocument();
    expect(questionTypeCard2Description).toBeInTheDocument();
    expect(questionTypeCard3).toBeInTheDocument();
    expect(questionTypeCard3Description).toBeInTheDocument();
    expect(selectButtons.length).toBe(3);
  });

  it('should show filtered list when user clicks Search button', async () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: mockQuestionTypes,
      loading: false,
      error: null,
    });

    await act(async () => {
      render(
        <QuestionTypeSelectPage />
      );
    });

    screen.debug();
    // Searching for translation key since cannot run next-intl for unit tests
    const searchInput = screen.getByLabelText(/labels.searchByKeyword/i);

    // enter findable search term
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Rich' } });
    });

    const searchButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(searchButton);

    // Check that we can find section name that matches the search item
    expect(screen.getByText('Rich Text Editor')).toBeInTheDocument();

    // Question Type 'Text Area' should not display after filtering
    const textArea = screen.queryByRole('textbox', { name: /text area/i });
    expect(textArea).not.toBeInTheDocument();
  })

  it('should show error message when query fails with a network error', async () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: 'There was an error.' },
    });

    await act(async () => {
      render(
        <QuestionTypeSelectPage />
      );
    });

    expect(screen.getByText('There was an error.')).toBeInTheDocument();

  })

  it('should pass axe accessibility test', async () => {
    (useQuestionTypesQuery as jest.Mock).mockReturnValue({
      data: mockQuestionTypes,
      loading: false,
      error: null,
    });
    const { container } = render(
      <QuestionTypeSelectPage />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });
});
