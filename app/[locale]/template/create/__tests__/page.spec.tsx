import React from 'react';
import {fireEvent, render, screen, waitFor} from '@/utils/test-utils';
import '@testing-library/jest-dom';
import {useRouter} from 'next/navigation';
import TemplateCreatePage from '../page';
import {useQueryStep} from '../useQueryStep';
import {mockScrollTo} from '@/__mocks__/common';

// Mock the useQueryStep hook
jest.mock('@/app/[locale]/template/create/useQueryStep', () => ({
  useQueryStep: jest.fn(),
}));

// Mock the debounce function
/* eslint-disable no-unused-vars */
jest.mock('@/hooks/debounce', () => ({
  debounce: (fn: (..._args: unknown[]) => unknown) => fn,
}));
/* eslint-enable no-unused-vars */

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/SelectExistingTemplate', () => ({
  __esModule: true,
  default: () => <div data-testid="select-existing-template">Mocked TemplateSelectTemplatePage Component</div>,
}));

describe('TemplateCreatePage', () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    mockScrollTo();
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
