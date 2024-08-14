import React from 'react';
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import TypeAheadWithOther from '..';
import * as apolloClientModule from '@/lib/graphql/client/apollo-client';
import { GET_AFFILIATIONS } from '@/lib/graphql/queries/affiliations';
import logECS from '@/utils/clientLogger';

jest.mock('@/lib/graphql/client/apollo-client');
jest.mock('@/utils/clientLogger', () => ({
    __esModule: true,
    default: jest.fn(),
}));

expect.extend(toHaveNoViolations);
const mockQuery = jest.fn();
const mockSetOtherField = jest.fn();
const mockClient = { query: mockQuery };

describe('TypeAheadWithOther', () => {

    beforeEach(() => {
        (apolloClientModule.createApolloClient as jest.Mock).mockImplementation(() => mockClient);
        jest.useFakeTimers();
    });


    afterEach(() => {
        jest.resetAllMocks();
        jest.useRealTimers();
    })

    it('should render initial state correctly', () => {
        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );

        expect(screen.getByLabelText('Institution')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
        expect(screen.getByText('Search for an institution')).toBeInTheDocument();
    });

    it('should pass axe accessibility test', async () => {
        const { container } = render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );
        jest.useRealTimers();
        const results = await axe(container);
        jest.useFakeTimers();
        expect(results).toHaveNoViolations();
    })

    it('should fetch and display suggestions', async () => {
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: [
                    { id: '1', name: 'Test University' },
                    { id: '2', name: 'Test Institution' }
                ]
            }
        });

        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );

        await waitFor(() => {
            expect(apolloClientModule.createApolloClient).toHaveBeenCalled();
        });

        const input = screen.getByLabelText('Institution');

        act(() => { //make sure all updates related to React are completed
            fireEvent.change(input, { target: { value: 'Test' } });
            jest.advanceTimersByTime(1000);// This is to take the debounce into consideration
        })

        await waitFor(() => {
            expect(mockQuery).toHaveBeenCalledTimes(1);
        })

        await waitFor(() => {
            expect(screen.getByText('Test University')).toBeInTheDocument();
            expect(screen.getByText('Test Institution')).toBeInTheDocument();
        })

    });

    it('should not display suggestions when there are no matching results', async () => {
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: []
            }
        });

        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />);

        act(() => { //make sure all updates related to React are completed
            fireEvent.change(screen.getByLabelText('Institution'), { target: { value: 'Test' } });
            jest.advanceTimersByTime(1000);// This is to take the debounce into consideration
        })
        await waitFor(() => {
            expect(screen.queryByText('Test University')).not.toBeInTheDocument();
        });
    });


    it('should handle keyboard navigation in suggestions list', async () => {
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: [
                    { id: '1', name: 'Test University' },
                    { id: '2', name: 'Test Institution' }
                ]
            }
        });

        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );

        const input = screen.getByLabelText('Institution');

        act(() => {
            fireEvent.change(input, { target: { value: 'Test' } });
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(screen.getByText('Test University')).toBeInTheDocument();
        });

        // Test arrow down
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        await waitFor(() => {
            expect(screen.getByText('Other')).toHaveFocus();
        })

        // Test arrow up
        fireEvent.keyDown(screen.getByText('Test University'), { key: 'ArrowUp' });
        expect(input).toHaveFocus();
    });

    it('should correctly handle use of \'Enter\' key for selecting an item from the dropdown', async () => {
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: [
                    { id: '1', name: 'Test University' },
                    { id: '2', name: 'Test Institution' }
                ]
            }
        });


        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );

        const input = screen.getByLabelText('Institution');

        act(() => {
            fireEvent.change(input, { target: { value: 'Test' } });
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(screen.getByText('Test University')).toBeInTheDocument();
        });

        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        const listItem = await screen.findByText('Test University'); // Use findBy* to handle async rendering

        expect(listItem).toHaveFocus();
        Object.defineProperty(listItem, 'innerText', { value: 'Test University' });

        listItem.focus();
        fireEvent.keyDown(listItem, { key: 'Enter', code: 'Enter' });

        expect(input).toHaveValue('Test University');

    });

    it('should display a "No results found" message when no suggestions match the input', async () => {
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: []
            }
        });

        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );

        const input = screen.getByLabelText('Institution');
        fireEvent.keyDown(input);
        await waitFor(() => {
            expect(screen.getByText('No results found.')).toBeInTheDocument();
        })
    });

    it('should log an error if apollo client is not defined', () => {
        (apolloClientModule.createApolloClient as jest.Mock).mockImplementation(() => { });
        mockClient.query.mockResolvedValueOnce({
            data: {
                affiliations: [
                    { id: '1', name: 'Test University' },
                    { id: '2', name: 'Test Institution' }
                ]
            }
        });
        render(
            <TypeAheadWithOther
                graphqlQuery={GET_AFFILIATIONS}
                label="Institution"
                helpText="Search for an institution"
                setOtherField={mockSetOtherField}
            />
        );
        expect(logECS).toHaveBeenCalledWith('error', 'Apollo client creation failed', {
            source: 'TypeAheadInput component'
        });

    })
});