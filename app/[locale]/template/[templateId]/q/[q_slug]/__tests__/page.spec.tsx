import React from "react";
import { render, screen, act, fireEvent } from '@/utils/test-utils';
import {
  useQuestionQuery,
  useUpdateQuestionMutation,
  useQuestionTypesQuery
} from '@/generated/graphql';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams } from 'next/navigation';
import { useTranslations as OriginalUseTranslations } from 'next-intl';
import QuestionEdit from '../page';
expect.extend(toHaveNoViolations);

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useQuestionQuery: jest.fn(),
  useUpdateQuestionMutation: jest.fn(),
  useQuestionTypesQuery: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

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

const mockQuestionData = {
  question: {
    displayOrder: 17,
    errors: null,
    guidanceText: "This is the guidance text",
    id: 2271,
    isDirty: true,
    questionOptions:
      [
        {
          id: 63,
          orderNumber: 1,
          questionId: 2271,
          Text: "Alpha"
        },
        {
          id: 66,
          orderNumber: 2,
          questionId: 2271,
          Text: "Bravo"
        }
      ],
    questionText: "Testing",
    questionTypeId: 3,
    requirementText: "This is requirement text",
    sampleText: "This is sample text",
    sectionId: 67,
    templateId: 15
  }
}

const mockQuestionTypesData = {
  questionTypes: [
    {
      id: 1,
      name: "Text Area",
      usageDescription: "For questions that require longer answers, you can select formatting options too."
    },
    {
      id: 2,
      name: "Text Field",
      usageDescription: "For questions that require short, simple answers."
    },
    {
      id: 3,
      name: "Radio Buttons",
      usageDescription: "For multiple choice questions where users select just one option."
    },
    {
      id: 4,
      name: "Check Boxes",
      usageDescription: "For multiple choice questions where users can select multiple options."
    }
  ]
}


describe("QuestionEditPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    (useQuestionQuery as jest.Mock).mockReturnValue({
      data: mockQuestionData,
      loading: false,
      error: undefined,
    });

    (useQuestionTypesQuery as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: mockQuestionTypesData }),
      { loading: false, error: undefined },
    ]);
  });

  it("should render correct fields", async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <QuestionEdit />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Edit: Testing');
    const editQuestionTab = screen.getByRole('tab', { name: 'tabs.editQuestion' });
    expect(editQuestionTab).toBeInTheDocument();
    const editOptionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    expect(editOptionsTab).toBeInTheDocument();
    const editLogicTab = screen.getByRole('tab', { name: 'tabs.logic' });
    expect(editLogicTab).toBeInTheDocument();
    const questionTypeLabel = screen.getByRole('textbox', { name: 'labels.type' });
    expect(questionTypeLabel).toBeInTheDocument();
    const questionTextLabel = screen.getByRole('textbox', { name: 'labels.questionText' });
    expect(questionTextLabel).toBeInTheDocument();
    const questionRequirementTextLabel = screen.getByRole('textbox', { name: 'labels.requirementText' });
    expect(questionRequirementTextLabel).toBeInTheDocument();
    const questionGuidanceTextLabel = screen.getByRole('textbox', { name: 'labels.guidanceText' });
    expect(questionGuidanceTextLabel).toBeInTheDocument();
    const questionSampleTextLabel = screen.getByRole('textbox', { name: 'labels.sampleText' });
    expect(questionSampleTextLabel).toBeInTheDocument();

  });

  it('should pass axe accessibility test', async () => {
    (useUpdateQuestionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    const { container } = render(
      <QuestionEdit />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});