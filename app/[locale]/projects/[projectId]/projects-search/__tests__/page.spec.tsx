import React from 'react';
import { useRouter } from 'next/navigation';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsCreateProjectProjectSearch from '../page';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;


describe('ProjectsCreateProjectProjectSearch', () => {
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
    render(<ProjectsCreateProjectProjectSearch />);
    expect(screen.getByText('Search for Projects')).toBeInTheDocument();
  });

  it('should render the search fields with placeholders', () => {
    render(<ProjectsCreateProjectProjectSearch />);
    expect(screen.getByPlaceholderText('Enter Project or Award ID...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Project Name/Title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter Award Year...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter PI Name or Profile ID...')).toBeInTheDocument();
  });

  it('should execute search and displays results', () => {
    render(<ProjectsCreateProjectProjectSearch />);
    const projectNameInput = screen.getByPlaceholderText('Enter Project Name/Title...');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(projectNameInput, { target: { value: 'Particle' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('2 projects found')).toBeInTheDocument();
    expect(screen.getByText('Particle Physics and Quantum Mechanics (2023)')).toBeInTheDocument();
    expect(screen.getByText('Particle Mechanics (2023)')).toBeInTheDocument();
  });

  it('should display "No projects found" when no results match', () => {
    render(<ProjectsCreateProjectProjectSearch />);
    const projectNameInput = screen.getByPlaceholderText('Enter Project Name/Title...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(projectNameInput, { target: { value: 'Nonexistent Project' } });
    fireEvent.click(searchButton);

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('We couldn’t find any projects matching your search. Try again with different details.')).toBeInTheDocument();
  });

  it('should handle "Select" button click for a project', async () => {
    render(<ProjectsCreateProjectProjectSearch />);
    const projectNameInput = screen.getByPlaceholderText('Enter Project Name/Title...');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(projectNameInput, { target: { value: 'Particle' } });
    fireEvent.click(searchButton);

    const selectButton = screen.getByRole('button', { name: 'Select Particle Physics and Quantum Mechanics' });

    fireEvent.click(selectButton);
    await waitFor(() => {
      // Should redirect to the Feeback page when modal is closed
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/proj_2425new');
    });
  });

  it('should handle "Add Project Manually" button click', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    render(<ProjectsCreateProjectProjectSearch />);
    const projectNameInput = screen.getByPlaceholderText('Enter Project Name/Title...');
    const searchButton = screen.getByRole('button', { name: /Search/i });

    fireEvent.change(projectNameInput, { target: { value: 'Particle' } });
    fireEvent.click(searchButton);

    const addProjectButton = screen.getByRole('button', { name: /Add Project Manually/i });

    fireEvent.click(addProjectButton);
    expect(consoleSpy).toHaveBeenCalledWith('Add project manually clicked');
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsCreateProjectProjectSearch />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
