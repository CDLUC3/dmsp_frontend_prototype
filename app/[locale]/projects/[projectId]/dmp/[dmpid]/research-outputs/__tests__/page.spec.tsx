import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsProjectPlanAdjustResearchOutputs from '../page';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsProjectPlanAdjustResearchOutputs', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with correct title and description', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    expect(screen.getByText('Research Outputs')).toBeInTheDocument();
    expect(screen.getByText('Manage and document the outputs of your research project.')).toBeInTheDocument();
  });

  it('should render the breadcrumb links', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('should render the list of research outputs', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    expect(screen.getByText('Climate Change Impact on Polar Ecosystems')).toBeInTheDocument();
    expect(screen.getByText('Data Framework for Ecosystem Studies')).toBeInTheDocument();
    expect(screen.getByText('Biodiversity Changes in the Arctic')).toBeInTheDocument();
  });

  it('should render metadata for each research output', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    const metaData1 = screen.getAllByText('Personal Information Included?', { exact: false });
    const metaData2 = screen.getAllByText('Sensitive Data Included?', { exact: false });

    expect(metaData1).toHaveLength(3);
    expect(metaData2).toHaveLength(3);
    const repositoryElement = screen.getByText(/Repository:\s*Arctic Research Repository/i, { exact: false });
    expect(repositoryElement).toBeInTheDocument();
    const journalArticle = screen.getByText(/Type:\s*Journal Article/i, { exact: false });
    expect(journalArticle).toBeInTheDocument();
  });

  it('should render edit and delete buttons for each research output', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    expect(screen.getAllByRole('button', { name: /Edit research output:/ }).length).toBe(3);
    expect(screen.getAllByRole('button', { name: /Delete research output:/ }).length).toBe(3);
  });

  it('should handle edit button click', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    const editButton = screen.getByRole('button', { name: 'Edit research output: Climate Change Impact on Polar Ecosystems' });
    fireEvent.click(editButton);
    // Check console log or redirection logic if mocked
  });

  it('should handle delete button click', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    const deleteButton = screen.getByRole('button', { name: 'Delete research output: Climate Change Impact on Polar Ecosystems' });
    fireEvent.click(deleteButton);
    // Check console log or deletion logic if mocked
  });

  it('should render the add research output button', () => {
    render(<ProjectsProjectPlanAdjustResearchOutputs />);
    const addButton = screen.getByRole('button', { name: 'Add new research output' });
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    // Check redirection logic if mocked
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectsProjectPlanAdjustResearchOutputs />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
