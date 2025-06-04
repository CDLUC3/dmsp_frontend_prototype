import React from 'react';
import { useRouter } from 'next/navigation';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsCreateProjectFunderSearch from '../page';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsCreateProjectFunderSearch', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title', () => {
    render(<ProjectsCreateProjectFunderSearch />);
    expect(screen.getByText('Search for Funders')).toBeInTheDocument();
  });

  it('should render the search field with placeholder', () => {
    render(<ProjectsCreateProjectFunderSearch />);
    expect(screen.getByPlaceholderText('Enter funder name...')).toBeInTheDocument();
  });

  it('should render the most popular funders before search', () => {
    render(<ProjectsCreateProjectFunderSearch />);
    expect(screen.getByText('Most popular funders')).toBeInTheDocument();
    expect(screen.getByText('Bill & Melinda Gates Foundation')).toBeInTheDocument();
    expect(screen.getByText('Wellcome Trust')).toBeInTheDocument();
    expect(screen.getByText('National Institutes of Health (NIH)')).toBeInTheDocument();
  });

  it('should execute search and displays results', () => {
    render(<ProjectsCreateProjectFunderSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'NSF' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('3 funders found')).toBeInTheDocument();
    expect(screen.getByText('National Science Foundation (NSF)')).toBeInTheDocument();
    expect(screen.getByText('National Science Foundation-BSF (NSF-BSF)')).toBeInTheDocument();
    expect(screen.getByText('NSF-AAA')).toBeInTheDocument();
  });

  it('should handle "Select" button click for a funder', async () => {
    render(<ProjectsCreateProjectFunderSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'NSF' } });
    fireEvent.click(searchButton);

    const selectButton = screen.getByRole('button', { name: 'Select National Science Foundation (NSF)' });

    fireEvent.click(selectButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/create-project/projects-search');
    });
  });

  it('should display no results when search term does not match', () => {
    render(<ProjectsCreateProjectFunderSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'XYZ' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('0 funders found')).toBeInTheDocument();
  });

  it('should handle "Add Funder Manually" button click', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<ProjectsCreateProjectFunderSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'NSF' } });
    fireEvent.click(searchButton);

    const addFunderButton = screen.getByRole('button', { name: 'Add funder manually' });

    fireEvent.click(addFunderButton);
    expect(consoleSpy).toHaveBeenCalledWith('Add funder manually clicked');
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsCreateProjectFunderSearch />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
