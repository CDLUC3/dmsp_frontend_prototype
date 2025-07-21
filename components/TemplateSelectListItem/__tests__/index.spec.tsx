import React, { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RichTranslationValues } from 'next-intl';
import TemplateSelectListItem from '../index';

expect.extend(toHaveNoViolations);

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

type MockUseTranslations = {
  (key: string, ...args: unknown[]): string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
};

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: MockUseTranslations = ((key: string) => key) as MockUseTranslations;

    mockUseTranslations.rich = (key, values) => {
      const p = values?.p;
      if (typeof p === 'function') {
        return p(key); // Can return JSX
      }
      return key; // fallback
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
    lastRevisedBy: "Henry Ford",
    lastUpdated: '10-25-2025',
    hasAdditionalGuidance: true,
    publishStatus: 'notPublished',
    visibility: 'public',
    publishDate: '10-25-2025',
    link: '/templates/10',
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
    expect(screen.getByText('lastRevisedBy: Henry Ford')).toBeInTheDocument();
    expect(screen.getByText('lastUpdated: 10-25-2025')).toBeInTheDocument();
    expect(screen.getByText(/notPublished.*(10-25-2025)/i)).toBeInTheDocument();
    expect(screen.getByText(/visibility\s*:\s*Public/i)).toBeInTheDocument();
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
