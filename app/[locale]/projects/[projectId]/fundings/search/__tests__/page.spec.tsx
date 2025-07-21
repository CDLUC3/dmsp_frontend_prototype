import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectFundingSearch from '../page';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;


describe('ProjectsProjectFundingSearch', () => {
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
    render(<ProjectsProjectFundingSearch />);
    expect(screen.getByText('Search for Funders')).toBeInTheDocument();
  });

  it('should render the search field with placeholder', () => {
    render(<ProjectsProjectFundingSearch />);
    expect(screen.getByPlaceholderText('Enter funder name...')).toBeInTheDocument();
  });

  it('should render the most popular funders before search', () => {
    render(<ProjectsProjectFundingSearch />);
    expect(screen.getByText('Most popular funders')).toBeInTheDocument();
    expect(screen.getByText('Bill & Melinda Gates Foundation')).toBeInTheDocument();
    expect(screen.getByText('Wellcome Trust')).toBeInTheDocument();
    expect(screen.getByText('National Institutes of Health (NIH)')).toBeInTheDocument();
  });

  it('should execute search and displays results', () => {
    render(<ProjectsProjectFundingSearch />);
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
    render(<ProjectsProjectFundingSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'NSF' } });
    fireEvent.click(searchButton);

    const selectButton = screen.getByRole('button', { name: 'Select National Science Foundation (NSF)' });

    fireEvent.click(selectButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/fundings');
    });
  });

  it('should handle "Add Funding Manually" button click', async () => {
    render(<ProjectsProjectFundingSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'NSF' } });
    fireEvent.click(searchButton);

    const addFunderButton = screen.getByRole('button', { name: 'Add funder manually' });

    fireEvent.click(addFunderButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425/fundings/projFund_6902/edit');
    });
  });

  it('should display no results when search term does not match', () => {
    render(<ProjectsProjectFundingSearch />);
    const input = screen.getByPlaceholderText('Enter funder name...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(input, { target: { value: 'XYZ' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('0 funders found')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectFundingSearch />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
