import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {useParams, useRouter} from 'next/navigation';
import {useProjectContributorsQuery} from '@/generated/graphql';
import ProjectsProjectMembers from '../page';
import {axe, toHaveNoViolations} from 'jest-axe';
import {mockScrollIntoView, mockScrollTo} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn()
}));

jest.mock('@/generated/graphql', () => ({
  useProjectContributorsQuery: jest.fn(),
}));


const mockProjectContributorsData = {
  projectContributors: [
    {
      id: 1,
      givenName: "Jacques",
      surName: "Cousteau",
      orcid: "0000-JACQ-0000-0000",
      contributorRoles: [
        {
          id: 2,
          label: "Principal Investigator (PI)",
          description: "An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection."
        },
        {
          id: 3,
          label: "Project Administrator",
          description: "An individual with management and coordination responsibility for the research activity planning and execution."
        }
      ],
      affiliation: {
        displayName: "University of California, Davis (ucdavis.edu)"
      },
    },
    {
      id: 2,
      givenName: "Captain",
      surName: "Nemo",
      orcid: "0000-NEMO-0000-0000",
      contributorRoles: [
        {
          id: 2,
          label: "Principal Investigator (PI)",
          description: "An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection."
        }
      ],
      affiliation: {
        displayName: "University of California, Davis (ucdavis.edu)"
      },
    }
  ],
  loading: false,
}

describe('ProjectsProjectMembers', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockRouter = { push: jest.fn() };
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  const mockUseProjectContributorsQuery = useProjectContributorsQuery as jest.Mock;

  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    mockUseParams.mockReturnValue({ projectId: '1' });
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

    expect(screen.getByText('messages.errors.errorGettingContributors')).toBeInTheDocument();
  });

  it('renders project members', () => {
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
    expect(screen.getByRole('button', { name: /buttons.addCollaborators/i })).toBeInTheDocument();
    const editButton = screen.getByRole('button', { name: "Edit Jacques Cousteau's details" });
    expect(editButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'headings.h2AllowCollaborators' })).toBeInTheDocument();
    expect(screen.getByText('para.para1AllowCollaborators')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buttons.shareWithPeople/i })).toBeInTheDocument();
  });

  it('should handle add collaborator button click', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: { projectContributors: [] } });

    render(<ProjectsProjectMembers />);

    fireEvent.click(screen.getByText('buttons.addCollaborators'));

    expect(mockRouter.push).toHaveBeenCalledWith('/projects/1/members/search');
  });

  it('should handle share button click', () => {
    mockUseProjectContributorsQuery.mockReturnValue({ data: { projectContributors: [] } });

    render(<ProjectsProjectMembers />);

    fireEvent.click(screen.getByText('buttons.shareWithPeople'));

    expect(mockRouter.push).toHaveBeenCalledWith('/projects/1/share');
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
