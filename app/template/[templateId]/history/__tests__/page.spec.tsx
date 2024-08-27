import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import TemplateHistory from '../page';
import { useTemplateVersionsQuery } from '@/generated/graphql';
import { MockedProvider } from '@apollo/client/testing';
import { useParams } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import mockData from './mockedResponse.json'

expect.extend(toHaveNoViolations);

jest.mock('@/generated/graphql', () => ({
    useTemplateVersionsQuery: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
}))

jest.mock('@/components/BackButton', () => {
    return {
        __esModule: true,
        default: () => <div>Mocked Back Button</div>,
    };
});

jest.mock('@/components/PageWrapper', () => {
    const mockPageWrapper = jest.fn(({ children }: { children: ReactNode, title: string }) => (
        <div data-testid="mock-page-wrapper">{children}</div>
    ));
    return {
        __esModule: true,
        default: mockPageWrapper
    }
});

describe('TemplateHistory', () => {
    beforeEach(() => {
        const mockTemplateId = 123;
        const mockUseParams = useParams as jest.Mock;

        // Mock the return value of useParams
        mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
    });

    it('should render the component with PageWrapper', async () => {
        const titleProp = 'Template History';
        const pageWrapper = await import('@/components/PageWrapper');
        const mockPageWrapper = pageWrapper.default;

        (useTemplateVersionsQuery as jest.Mock).mockReturnValue(mockData);

        const { getByTestId } = render(<TemplateHistory />);

        expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
        expect(mockPageWrapper).toHaveBeenCalledWith(expect.objectContaining({ title: titleProp, }), {})
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

        expect(useTemplateVersionsQuery).toHaveBeenCalledWith({ "variables": { "templateId": 123 } })
    });

    it('should render loading state correctly', () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({ loading: true });

        render(<TemplateHistory />);
        expect(screen.getByText('Loading publication history...')).toBeInTheDocument();
    });

    it('should render error state correctly', () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({ loading: false, error: new Error('Test Error') });

        render(<TemplateHistory />);
        expect(screen.getByText('There was a problem.')).toBeInTheDocument();
    });

    it('should render page heading and subheader correctly, which includes the title, by, version and date of latest publication', async () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            loading: false,
            data: mockData,
        });

        const { getByTestId } = render(<TemplateHistory />);
        const h1Element = await screen.findByRole('heading', { level: 1 });
        expect(h1Element).toHaveTextContent('NIH-GDS: Genomic Data Sharing');
        expect(getByTestId('author')).toHaveTextContent('by National Institutes of Health')
        expect(getByTestId('latest-version')).toHaveTextContent('3.1')
        expect(getByTestId('publication-date')).toHaveTextContent('Published: Aug 1, 2024')
    });

    it('should render correct headers for table', async () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            loading: false,
            data: mockData,
        });

        render(<TemplateHistory />);

        // Check h2 header above table
        const h2Element = await screen.findByRole('heading', { level: 2 });
        expect(h2Element).toHaveTextContent('History');

        // Check table column headers
        const headers = screen.getAllByRole('columnheader');
        expect(headers[0]).toHaveTextContent('Action');
        expect(headers[1]).toHaveTextContent('User');
        expect(headers[2]).toHaveTextContent('Time and Date');
    })

    it('should render correct content in table', async () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            loading: false,
            data: mockData,
        });

        render(<TemplateHistory />);

        const table = screen.getByRole('table');
        // Get all rows in table body
        const rows = table.querySelectorAll('tbody tr');

        // Second row in table
        const targetRow1 = rows[1];

        const row1Cells = targetRow1.querySelectorAll('td');
        expect(row1Cells[0].textContent).toBe('Published v3Change log:This is the initial version of our template!');
        expect(row1Cells[1].textContent).toBe('Severus Snape');
        expect(row1Cells[2].textContent).toBe('02:03 on Apr 1, 2024');
    })

    it('should render "No template history available" when no data is available', () => {
        (useTemplateVersionsQuery as jest.Mock).mockReturnValue({
            loading: false,
            data: { templateVersions: [] },
        });

        render(<TemplateHistory />);
        expect(screen.getByText('No template history available.')).toBeInTheDocument();
    });

    it('should pass axe accessibility test', async () => {
        const { container } = render(
            <TemplateHistory />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    })
});