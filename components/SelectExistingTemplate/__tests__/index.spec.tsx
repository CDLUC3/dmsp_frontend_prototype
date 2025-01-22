import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useTranslations as OriginalUseTranslations } from 'next-intl';
import TemplateSelectTemplatePage from '../index';
import {
  useAddTemplateMutation,
  usePublishedTemplatesQuery,
  useMyVersionedTemplatesQuery
} from '@/generated/graphql';
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

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

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useAddTemplateMutation: jest.fn(),
  usePublishedTemplatesQuery: jest.fn(),
  useMyVersionedTemplatesQuery: jest.fn()
}));

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the debounce function
jest.mock('@/hooks/useFormatDate', () => ({
  useFormatDate: (fn: () => string) => fn,
}));


const mockPublicTemplates = {
  publishedTemplates: [
    {
      description: "",
      errors: null,
      id: 1,
      modifiedById: 1,
      name: "Public template 1",
      owner: null,
      template: {
        id: 1,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 2,
      modifiedById: 2,
      name: "Public template 2",
      owner: null,
      template: {
        id: 2,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    }
  ]
}

const mockTemplates = {
  myVersionedTemplates: [
    {
      description: "",
      errors: null,
      id: 3,
      modifiedById: 3,
      name: "Public template 3",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 3,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 4,
      modifiedById: 4,
      name: "Public template 4",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 4,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 5,
      modifiedById: 5,
      name: "Odd template 5",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 5,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 6,
      modifiedById: 6,
      name: "Public template 6",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 6,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    }
  ]
}
// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useAddTemplateMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  mockHook(usePublishedTemplatesQuery).mockReturnValue({ data: mockPublicTemplates, loading: false, error: undefined });
  mockHook(useMyVersionedTemplatesQuery).mockReturnValue({ data: mockTemplates, loading: false, error: undefined });
};


describe('TemplateSelectTemplatePage', () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    setupMocks();
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('should render the main content sections', async () => {
    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    const input = screen.getByLabelText('labels.searchByKeyword');
    expect(input).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public template 1/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public template 2/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public template 3/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /public template 4/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /odd template 5/i })).toBeInTheDocument();
  });

  it('should render text loading if templates are still loading', async () => {
    (usePublishedTemplatesQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    const loading = screen.getByText(/loading.../i);
    expect(loading).toBeInTheDocument();
  });

  it('should render a button that says \'Load 1 more\' and when clicked, should display \'public template 6\'', async () => {
    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    const loadMoreButton = screen.getByRole('button', { name: /buttons.loadMore/i });
    expect(loadMoreButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(loadMoreButton);
    });
    expect(screen.getByRole('heading', { name: /public template 6/i })).toBeInTheDocument();
  });

  it('should match only one item when a user enters text \'ODD\'', async () => {
    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    //Search input field
    const input = screen.getByLabelText('labels.searchByKeyword');
    const searchButton = screen.getByRole('button', { name: /search/i });

    expect(searchButton).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(input, { target: { value: 'ODD' } });
      fireEvent.click(searchButton);
    });

    expect(screen.getByRole('heading', { name: /odd template 5/i })).toBeInTheDocument();
    expect(screen.getByText(/resultsText/i)).toBeInTheDocument();
    const linkElement = screen.getAllByRole('link', { name: /clear filter/i });
    expect(linkElement).toHaveLength(1);
  });

  it('should call useAddTemplateMutation when a user clicks a \'Select\' button', async () => {
    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    //Search input field
    const selectButton = screen.getAllByRole('button', { name: /select/i });

    await act(async () => {
      fireEvent.click(selectButton[0]);
    });

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(useAddTemplateMutation).toHaveBeenCalled();
    });
  });

  it('should call useAddTemplateMutation when a user clicks a \'Select\' button', async () => {
    (useAddTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn(() => Promise.reject(new Error('Mutation failed'))), // Mock the mutation function
    ]);

    await act(async () => {
      render(
        <TemplateSelectTemplatePage templateName="test" />
      );
    });
    //Search input field
    const selectButton = screen.getAllByRole('button', { name: /Select Public template 2/i });

    screen.debug();
    await act(async () => {
      fireEvent.click(selectButton[0]);
    });

    expect(logECS).toHaveBeenCalledWith(
      'error',
      'handleClick',
      expect.objectContaining({
        error: expect.anything(),
        url: { path: '/template/create' },
      })
    )
  });


  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateSelectTemplatePage templateName="test" />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
