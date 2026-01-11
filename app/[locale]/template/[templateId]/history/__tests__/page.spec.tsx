import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import TemplateHistory from '../page';
import { useQuery } from '@apollo/client/react';
import { TemplateVersionsDocument } from '@/generated/graphql';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import mockData from './mockedResponse.json';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));


// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn((namespace) => {
    if (namespace === 'Global') {
      return jest.fn((key) => {
        if (key === 'version') return 'version';
        if (key === 'lastUpdated') return 'lastUpdated';
        return key;
      });
    }
    return jest.fn((key) => key);
  }),
}));

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

jest.mock('@/components/PageHeader', () => {
  const mockPageHeader = jest.fn(({ children }: { children: ReactNode, title: string, description: string }) => (
    <div data-testid="mock-page-wrapper">{children}</div>
  ));
  return {
    __esModule: true,
    default: mockPageHeader
  }
});

const mockUseRouter = useRouter as jest.Mock;
// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);

const setupMocks = () => {
  // Create stable references OUTSIDE mockImplementation
  const stableTemplateVersionsReturn = {
    data: mockData,
    loading: false,
    error: null,
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === TemplateVersionsDocument) {
      return stableTemplateVersionsReturn as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    };
  });
};

describe('TemplateHistory', () => {
  beforeEach(() => {
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  it('should render the component with PageHeader', async () => {
    const titleProp = 'title';
    const pageWrapper = await import('@/components/PageHeader');
    const mockPageHeader = pageWrapper.default;

    const { getByTestId } = render(<TemplateHistory />);

    expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
    // Check only the first argument (props) for the title prop
    expect((mockPageHeader as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({ title: titleProp }));
  })

  it('should use the templateId from the param in the call to useTemplateVersionsQuery', () => {
    render(<TemplateHistory />);

    expect(mockUseQuery).toHaveBeenCalledWith(
      TemplateVersionsDocument,
      expect.objectContaining({
        variables: { templateId: 123 }
      })
    );
  });

  it('should render loading state correctly', () => {
    const stableTemplateVersionsReturn = {
      data: mockData,
      loading: true,
      error: null,
    };
    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return stableTemplateVersionsReturn as any;
      }

      return {
        data: null,
        loading: true,
        error: undefined
      };
    });

    render(<TemplateHistory />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should handle graphQL error state correctly', async () => {
    const router = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(router);

    // Mock the Apollo error object
    // Apollo Client's ApolloError has a message property
    const errorObj = {
      message: 'Unauthenticated',
      graphQLErrors: [
        {
          message: 'Unauthenticated',
          extensions: { code: 'UNAUTHENTICATED' }
        }
      ],
      networkError: null,
    };

    const stableTemplateVersionsReturn = {
      data: null,
      loading: false,
      error: errorObj,
      refetch: jest.fn(),
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return stableTemplateVersionsReturn as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<TemplateHistory />);

    // The component sets errors with error.message in the useEffect
    expect(await screen.findByText('Unauthenticated')).toBeInTheDocument();
  });

  it('should render subHeading and call mockPageHeader with correct descriptionAdded', async () => {
    const titleProp = 'title';
    const pageWrapper = await import('@/components/PageHeader');
    const mockPageHeader = pageWrapper.default;

    // Update mock to return the data for this test
    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: jest.fn(),
        } as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<TemplateHistory />);
    const subHeading = screen.getByRole('heading', { level: 3, name: 'subHeading' });
    expect(subHeading).toBeInTheDocument();
    expect((mockPageHeader as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({
      title: titleProp,
      description: 'by National Institutes of Health - version: v3.1 - lastUpdated: 01-01-2023'
    }));
  });

  it('should render correct headers for table', async () => {
    // Update mock to return the data for this test
    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: jest.fn(),
        } as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<TemplateHistory />);

    // Check table column headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('tableColumnAction');
    expect(headers[1]).toHaveTextContent('tableColumnUser');
    expect(headers[2]).toHaveTextContent('tableColumnDate');
  });

  it('should render correct content in table', async () => {
    // Update mock to return the data for this test
    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return {
          data: mockData,
          loading: false,
          error: null,
          refetch: jest.fn(),
        } as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<TemplateHistory />);
    const table = screen.getByRole('grid');
    // Get all rows in table body
    const rows = table.querySelectorAll('tbody tr');

    // Second row in table
    const targetRow1 = rows[1];

    const row1Cells = targetRow1.querySelectorAll('td');
    expect(row1Cells[0].textContent).toBe('DRAFT v3changeLog:This is the initial version of our template!');
    expect(row1Cells[1].textContent).toBe('Severus Snape');
    //expect(row1Cells[2].textContent).toBe('16:29 on Jun 25, 2014');
  });

  it('should render "No template history available" when no data is available', () => {
    // Update mock to return empty data
    mockUseQuery.mockImplementation((document) => {
      if (document === TemplateVersionsDocument) {
        return {
          data: { templateVersions: [] },
          loading: false,
          error: null,
          refetch: jest.fn(),
        } as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<TemplateHistory />);
    expect(screen.getByText('notFoundMessage')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    // This test uses the default setupMocks() which already returns mockData
    const { container } = render(<TemplateHistory />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
