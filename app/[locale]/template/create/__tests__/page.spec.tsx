import React from 'react';
import {useTranslations as OriginalUseTranslations} from 'next-intl';
import {fireEvent, render, screen, waitFor} from '@/utils/test-utils';
import '@testing-library/jest-dom';
import {useRouter} from 'next/navigation';
import TemplateCreatePage from '../page';
import {useQueryStep} from '../useQueryStep';


// Mock the useQueryStep hook
jest.mock('@/app/[locale]/template/create/useQueryStep', () => ({
  useQueryStep: jest.fn(),
}));

// Mock the debounce function
jest.mock('@/hooks/debounce', () => ({
  debounce: (fn: (..._args: unknown[]) => unknown) => fn,
}));

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/SelectExistingTemplate', () => ({
  __esModule: true,
  default: () => <div data-testid="select-existing-template">Mocked TemplateSelectTemplatePage Component</div>,
}));

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


describe('TemplateCreatePage', () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    window.scrollTo = jest.fn();
  });

  it('should render loading state initially', () => {
    (useQueryStep as jest.Mock).mockReturnValue(null); // No step in query initially

    render(<TemplateCreatePage />);
    expect(screen.getByText('...messaging.loading')).toBeInTheDocument();
  });

  it('should render step 1 form when step is 1', () => {
    (useQueryStep as jest.Mock).mockReturnValue(1);

    render(<TemplateCreatePage />);
    expect(screen.getByLabelText('nameOfYourTemplate')).toBeInTheDocument();
  });

  it('should render error message when "Next" is clicked with invalid input', async () => {
    (useQueryStep as jest.Mock).mockReturnValue(1);

    render(<TemplateCreatePage />);
    const button = screen.getByText('buttons.next');
    fireEvent.click(button);

    await waitFor(() =>
      expect(
        screen.getByText('messages.templateNameError')
      ).toBeInTheDocument()
    );
  });

  it('should navigate to step 2 when "Next" is clicked with valid input', async () => {
    (useQueryStep as jest.Mock).mockReturnValue(2);

    render(<TemplateCreatePage />);
    expect(screen.getByText(/Mocked TemplateSelectTemplatePage Component/i)).toBeInTheDocument();
  });
});
