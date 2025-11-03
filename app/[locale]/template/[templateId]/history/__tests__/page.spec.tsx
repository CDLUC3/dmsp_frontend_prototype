import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import TemplateHistory from '../page';
import { useTemplateVersionsQuery } from '@/generated/graphql';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import mockData from './mockedResponse.json';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('@/generated/graphql', () => ({
  useTemplateVersionsQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}))

jest.mock('@/utils/gqlErrorHandler', () => ({
  handleApolloErrors: jest.fn()
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

describe('TemplateHistory', () => {
  beforeEach(() => {
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

    (useTemplateVersionsQuery as jest.Mock).mockReturnValue(mockData);

    const { getByTestId } = render(<TemplateHistory />);

    expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
    // Check only the first argument (props) for the title prop
    expect((mockPageHeader as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({ title: titleProp }));
  })

  it('should use the templateId from the param in the call to useTemplateVersionsQuery', () => {
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
    });

    render(<TemplateHistory />);

    expect(useTemplateVersionsQuery).toHaveBeenCalledWith({ variables: { templateId: 123 } })
  });

  it('should render loading state correctly', () => {
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({ loading: true });

    render(<TemplateHistory />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('should handle graphQL error state correctly', async () => {
    const router = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(router);

    // Mock the Apollo error object
    const errorObj = {
      graphQLErrors: [
        {
          message: 'Unauthenticated',
          extensions: { code: 'UNAUTHENTICATED' }
        }
      ],
      networkError: null,
    };

    // Mock handleApolloErrors to simulate calling setErrors
    (handleApolloErrors as jest.Mock).mockImplementation(
      async (graphQLErrors, networkError, setErrorsFn) => {
        setErrorsFn(['There was a problem.']);
      }
    );

    // Mock useTemplateVersionsQuery to simulate the error state
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: errorObj,
      refetch: jest.fn(),
    });

    render(<TemplateHistory />);
    expect(await screen.findByText('There was a problem.')).toBeInTheDocument();
  });

  it('should render subHeading and call mockPageHeader with correct descriptionAdded', async () => {
    const titleProp = 'title';
    const pageWrapper = await import('@/components/PageHeader');
    const mockPageHeader = pageWrapper.default;
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockData,
    });

    render(<TemplateHistory />);
    const subHeading = screen.getByRole('heading', { level: 3, name: 'subHeading' });
    expect(subHeading).toBeInTheDocument();
    expect((mockPageHeader as jest.Mock).mock.calls[0][0]).toEqual(expect.objectContaining({ title: titleProp, description: 'by National Institutes of Health - version: v3.1 - lastUpdated: 01-01-2023' }));
  });

  it('should render correct headers for table', async () => {
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockData,
    });

    render(<TemplateHistory />);

    // Check table column headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Action');
    expect(headers[1]).toHaveTextContent('User');
    expect(headers[2]).toHaveTextContent('tableColumnDate');
  })

  it('should render correct content in table', async () => {
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: mockData,
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
  })

  it('should render "No template history available" when no data is available', () => {
    (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { templateVersions: [] },
    });

    render(<TemplateHistory />);
    expect(screen.getByText('notFoundMessage')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <TemplateHistory />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  })
});
