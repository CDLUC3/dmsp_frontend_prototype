import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ProjectListItem from '../index';
import { ProjectItemProps } from '@/app/types';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)),
}));

const mockProjectItem: ProjectItemProps = {
  title: 'Project 1',
  link: '/projects/1',
  defaultExpanded: false,
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  members: [
    {
      name: 'John Doe',
      roles: 'Researcher',
      orcid: '0000-0001-2345-6789',
    },
  ],
  funding: 'NSF',
  grantId: 'GRANT123',
};

describe('ProjectListItem', () => {

  it('should render the ProjectListItem component', () => {
    render(<ProjectListItem item={mockProjectItem} />);

    expect(screen.getByRole('heading', { level: 2, name: /Project/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Project 1/i })).toBeInTheDocument();
    const updateLinks = screen.getAllByRole('link', { name: /buttons.linkUpdate/i });
    expect(updateLinks.length).toBe(2);
    expect(screen.getByRole('button', { name: /buttons.linkExpand/i })).toBeInTheDocument();
    expect(screen.getByText('projectDetails')).toBeInTheDocument();
  });

  it('should expand and collapse the project details', () => {
    render(<ProjectListItem item={mockProjectItem} />);

    const expandButton = screen.getByRole('button', { name: /buttons.linkExpand/i });
    fireEvent.click(expandButton);

    expect(screen.getByRole('heading', { level: 2, name: /projectDetails/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /dates/i })).toBeInTheDocument();
    expect(screen.getByText('2023-01-01 to 2023-12-31')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /collaborators/i })).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Researcher\)/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /funding/i })).toBeInTheDocument();
    expect(screen.getByText('NSF')).toBeInTheDocument();
    expect(screen.getByText(/grantId: GRANT123/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /researchOutputs/i })).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: /buttons.linkCollapse/i });
    fireEvent.click(collapseButton);

    expect(screen.queryByRole('heading', { name: /projectDetails/i })).not.toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <div role="list">
        <ProjectListItem item={mockProjectItem} />
      </div>
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });
});
