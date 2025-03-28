import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectContributorsQuery, useProjectCollaboratorsQuery } from '@/generated/graphql';
import ProjectsProjectMembers from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockProjectContributorsData from '../__mocks__/projectContributorsMock.json';
import mockProjectCollaboratorsData from '../__mocks__/projectCollaboratorsMock.json';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}));

jest.mock('@/generated/graphql', () => ({
  useProjectContributorsQuery: jest.fn(),
  useProjectCollaboratorsQuery: jest.fn()
}));

describe('ProjectsProjectMembers', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockRouter = { push: jest.fn() };
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  const mockUseProjectContributorsQuery = useProjectContributorsQuery as jest.Mock;
  const mockUseProjectCollaboratorsQuery = useProjectCollaboratorsQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });
    mockUseProjectCollaboratorsQuery.mockReturnValue({ data: mockProjectCollaboratorsData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should render loading state', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ loading: true });

    render(<ProjectsProjectMembers />);

    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ error: true });

    render(<ProjectsProjectMembers />);

    expect(screen.getByText('messaging.error')).toBeInTheDocument();
  });

  it('should render project members', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: mockProjectContributorsData });

    render(<ProjectsProjectMembers />);

    expect(screen.getByText('Jacques Cousteau')).toBeInTheDocument();
    expect(screen.getByText('Captain Nemo')).toBeInTheDocument();
    const affiliation = screen.getAllByText('University of California, Davis (ucdavis.edu)');
    expect(affiliation).toHaveLength(2);
    expect(screen.getByText('0000-JACQ-0000-0000')).toBeInTheDocument();
    expect(screen.getByText('0000-NEMO-0000-0000')).toBeInTheDocument();
    expect(screen.getByText('Principal Investigator (PI), Project Administrator')).toBeInTheDocument();
    expect(screen.getByText('Principal Investigator (PI)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.addMembers/i })).toBeInTheDocument();
    const editButton = screen.getByRole('button', { name: "Edit Jacques Cousteau's details" });
    expect(editButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'headings.h2AllowCollaborators' })).toBeInTheDocument();
    expect(screen.getByText('para.para1AllowCollaborators')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.shareWithPeople/i })).toBeInTheDocument();
  });

  it('should handle add collaborator button click', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: { projectContributors: [] } });

    render(<ProjectsProjectMembers />);

    fireEvent.click(screen.getByText('buttons.addMembers'));

    expect(mockRouter.push).toHaveBeenCalledWith('/projects/1/members/search');
  });

  it('should handle share button click', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: mockProjectContributorsData });

    render(<ProjectsProjectMembers />);

  });

  it('should display access level info for the correct member', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: mockProjectContributorsData });

    render(<ProjectsProjectMembers />);

    const memberListItem = screen.getByRole('listitem', {
      name: /Project member: Jacques Cousteau/i,
    });

    const { getByText } = within(memberListItem);

    expect(getByText(/Project comment permission/i)).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: mockProjectContributorsData });

    const { container } = render(
      <ProjectsProjectMembers />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
