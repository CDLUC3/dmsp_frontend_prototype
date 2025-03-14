import React from 'react';
import {act, fireEvent, render, screen} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useTranslations as OriginalUseTranslations} from 'next-intl';
import TemplateSelectListItem from '../index';

expect.extend(toHaveNoViolations);

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
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

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

const mockOnSelect = jest.fn();

const props = {
  onSelect: mockOnSelect,
  item: {
    id: 10,
    template: {
      id: 20,
    },
    funder: 'NSF',
    title: 'NSF Dolphin Research',
    description: 'Researching dolphins in Fiji',
    lastRevisedBy: 10,
    lastUpdated: '10-25-2025',
    hasAdditionalGuidance: true
  },
}

describe('TemplateSelectListItem', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('should render the main content', async () => {
    await act(async () => {
      render(
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      );
    });

    const role = screen.getByRole('listitem');
    const description = screen.getByText(/Researching dolphins in Fiji/i);
    const selectButton = screen.getByRole('button', { name: /select/i });
    expect(role).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(selectButton).toBeInTheDocument();
    expect(screen.getByText('lastRevisedBy: 10')).toBeInTheDocument();
    expect(screen.getByText('lastUpdated: 10-25-2025')).toBeInTheDocument();
    expect(screen.getByText('messages.additionalGuidance')).toBeInTheDocument();
  });

  it('should call onSelect method when user clicks the onSelect button', async () => {
    await act(async () => {
      render(
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      );
    });

    const selectButton = screen.getByRole('button', { name: /select/i });
    await act(async () => {
      fireEvent.click(selectButton);
    });
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should pass accessibility tests', async () => {
    /*Need to wrap the component in a div with role='list' to prevent
    an accessibility error because the component uses role = 'listitem' */
    const { container } = render(
      <div role="list">
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
