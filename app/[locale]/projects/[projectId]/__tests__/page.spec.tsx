import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useQuery } from '@apollo/client/react';
import ProjectOverviewPage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

// Mock Apollo Client
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = jest.mocked(useQuery);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

const mockProjectData = {
  title: "Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations",
  startDate: "2025-09-01",
  endDate: "2028-12-31",
  fundings: [
    {
      id: 1,
      grantId: "https://example.com/awards/IRL-000000X1",
      affiliation: {
        name: "National Science Foundation",
        displayName: "National Science Foundation (nsf.gov)",
        searchName: "National Science Foundation | nsf.gov | NSF "
      }
    }
  ],
  members: [
    {
      givenName: "Jacques",
      surName: "Cousteau",
      memberRoles: [
        {
          description: "An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.",
          displayOrder: 1,
          label: "Principal Investigator (PI)",
          uri: "https://credit.niso.org/contributor-roles/investigation/"
        },
        {
          description: "An individual with management and coordination responsibility for the research activity planning and execution.",
          displayOrder: 2,
          label: "Project Administrator",
          uri: "https://credit.niso.org/contributor-roles/project-administration/"
        }
      ],
      email: "researcher@ucdavis.edu"
    },
    {
      givenName: "Captain",
      surName: "Nemo",
      memberRoles: [
        {
          description: "An individual conducting a research and investigation process, specifically performing the experiments, or data/evidence collection.",
          displayOrder: 1,
          label: "Principal Investigator (PI)",
          uri: "https://credit.niso.org/contributor-roles/investigation/"
        }
      ],
      email: null
    }
  ],
  outputs: [
    {
      title: "Anguilla anguilla observations"
    },
    {
      title: "Gymnothorax javanicus time-lapse series"
    }
  ],
  plans: [
    {
      created: "1740696782000",
      dmpId: "https://doi.org/10.11111/2A3B4C",
      funding: "National Science Foundation",
      id: 1,
      modified: "1740696782000",
      versionedSections: [
        {
          answeredQuestions: 0,
          displayOrder: 1,
          versionedSectionId: 7,
          title: "Roles & Responsibilities",
          totalQuestions: 1
        }
      ],
      templateTitle: "NSF DMP Template",
    }
  ]
};

const setupMocks = () => {
  mockUseQuery.mockReturnValue({
    data: { project: mockProjectData },
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  } as any);
};


describe('ProjectOverviewPage', () => {
  beforeEach(() => {
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: '123' });
  })

  it('should render the project title', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('project')).toBeInTheDocument();
  });

  it('should not display project start and end dates if one of them is null', () => {
    const mockProjectDataWithoutStartDate = {
      ...mockProjectData,
      startDate: null
    };

    mockUseQuery.mockReturnValue({
      data: { project: mockProjectDataWithoutStartDate },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    render(<ProjectOverviewPage />);
    //Should not see end date
    expect(screen.queryByText('2028-12-31')).not.toBeInTheDocument();
  })

  it('should render the project fundings', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('fundings')).toBeInTheDocument();
  });

  it('should render the project members', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('projectMembers')).toBeInTheDocument();
  });

  it('should render the plans', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('plans')).toBeInTheDocument();
  });

  it('should display Loading message ', async () => {

    mockUseQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      loading: true,
      refetch: jest.fn(),
    } as any);

    render(<ProjectOverviewPage />);
    const loadingText = screen.getByText(/messaging.loading/i);
    expect(loadingText).toBeInTheDocument();
  })

  it('should pass accessibility tests', async () => {
    const { container } = render(<ProjectOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
