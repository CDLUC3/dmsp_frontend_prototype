import React from "react";
import {act, fireEvent, render, screen} from '@/utils/test-utils';
import {useQuestionTypesQuery} from '@/generated/graphql';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useParams, useRouter, useSearchParams} from 'next/navigation';
import {useQueryStep} from '@/app/[locale]/template/[templateId]/q/new/utils';
import QuestionTypeSelectPage from "../page";
import {mockScrollIntoView, mockScrollTo} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

// Mock the useQuestionTypesQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionTypesQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

jest.mock('@/components/QuestionAdd', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked QuestionAdd</div>,
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

// Mock QuestionAdd component since it has it's own separate unit test
jest.mock('@/components/QuestionAdd', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Question Add Component</div>,
  };
});

const mockQuestionTypes = {
  questionTypes: [
    {
      errors: null,
      id: 1,
      name: "Rich Text Editor",
      usageDescription: "For questions that allow you to format data using mark down."
    },
    {
      errors: null,
      id: 2,
      name: "Text Area",
      usageDescription: "For questions that require longer answers."
    },
    {
      errors: null,
      id: 3,
      name: "Text Field",
      usageDescription: "For questions that require short answers."
    }
  ]
}

describe("QuestionTypeSelectPage", () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;
    const mockUseQueryStep = useQueryStep as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
    mockUseQueryStep.mockReturnValue(1);

    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { section_id: '123' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: '1' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });


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

  it('should load QuestionAdd component when a user selects a question type', async () => {
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

    // Find a question type that has options, like a radio button
    const buttons = screen.getAllByText('buttons.select');
    const selectButton = buttons.find(button => button.getAttribute('data-type') === '3');
    expect(selectButton).toBeInTheDocument();

    if (selectButton) {
      fireEvent.click(selectButton);
    } else {
      throw new Error('Select button not found');
    }

    // Should load the QuestionAdd component once a user selects a question type with options
    expect(screen.getByText('Mocked Question Add Component')).toBeInTheDocument();
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
