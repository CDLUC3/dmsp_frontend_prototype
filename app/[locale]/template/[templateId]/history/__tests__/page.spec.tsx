import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import TemplateHistory from '../page';
import { useTemplateVersionsQuery } from '@/generated/graphql';
import { MockedProvider } from '@apollo/client/testing';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import mockData from './mockedResponse.json'

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
    useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`
}));

jest.mock('@/components/BackButton', () => {
    return {
        __esModule: true,
        default: () => <div>Mocked Back Button</div>,
    };
});

jest.mock('@/components/PageHeader', () => {
    const mockPageHeader = jest.fn(({ children }: { children: ReactNode, title: string }) => (
        <div data-testid="mock-page-wrapper">{children}</div>
    ));
    return {
        __esModule: true,
        default: mockPageHeader
    }
});

const mockUseRouter = useRouter as jest.Mock;
// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();

describe('TemplateHistory', () => {
    beforeEach(() => {
        HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
        window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

        const mockTemplateId = 123;
        const mockUseParams = useParams as jest.Mock;
        mockUseRouter.mockReturnValue({
            push: jest.fn(),
        })

        // Mock the return value of useParams
        mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
    });

    it('should render the component with PageHeader', async () => {
        const titleProp = 'title';
        const pageWrapper = await import('@/components/PageHeader');
        const mockPageHeader = pageWrapper.default;

        (useTemplateVersionsQuery as jest.Mock).mockReturnValue(mockData);

        const { getByTestId } = render(<TemplateHistory />);

        expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
        expect(mockPageHeader).toHaveBeenCalledWith(expect.objectContaining({ title: titleProp, }), {})
    })

    it('should use the templateId from the param in the call to useTemplateVersionsQuery', () => {

        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            data: mockData,
            loading: false,
            error: null,
        });

        render(
            <MockedProvider>
                <TemplateHistory />
            </MockedProvider>
        );

        expect(useTemplateVersionsQuery).toHaveBeenCalledWith({ 'variables': { 'templateId': 123 } })
    });

    it('should render loading state correctly', () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({ loading: true });

        render(<TemplateHistory />);
        screen.debug();
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

    it('should render page heading and subheader correctly, which includes the title, by, version and date of latest publication', async () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            loading: false,
            data: mockData,
        });

        const { getByTestId } = render(<TemplateHistory />);
        const h2Element = await screen.findByRole('heading', { level: 2 });
        expect(h2Element).toHaveTextContent('NIH-GDS: Genomic Data Sharing');
        expect(getByTestId('author')).toHaveTextContent('by National Institutes of Health')
        expect(getByTestId('latest-version')).toHaveTextContent('3.1')
        expect(getByTestId('publication-date')).toHaveTextContent('published: Jun 25, 2014')
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
        screen.debug();
        expect(row1Cells[0].textContent).toBe('published v3changeLog:This is the initial version of our template!');
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
