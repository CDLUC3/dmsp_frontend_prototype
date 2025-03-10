import React from 'react';
import {render, screen} from '@testing-library/react';
import {useParams} from 'next/navigation';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useProjectQuery} from '@/generated/graphql';
import ProjectOverviewPage from '../page';
import {mockScrollIntoView, mockScrollTo} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

jest.mock("@/generated/graphql", () => ({
  useProjectQuery: jest.fn(),
}));

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
  useLocale: jest.fn(() => 'en-US'), // Return a default locale
}));

const mockProjectData = {
  title: "Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations",
  startDate: "2025-09-01",
  endDate: "2028-12-31",
  funders: [
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
  contributors: [
    {
      givenName: "Jacques",
      surName: "Cousteau",
      contributorRoles: [
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
      contributorRoles: [
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
      funder: "National Science Foundation",
      id: 1,
      modified: "1740696782000",
      sections: [
        {
          answeredQuestions: 0,
          displayOrder: 1,
          sectionId: 7,
          sectionTitle: "Roles & Responsibilities",
          totalQuestions: 1
        }
      ],
      templateTitle: "NSF DMP Template",
    }
  ]
};


describe('ProjectOverviewPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: '123' });
    // Mock the hook for data state
    (useProjectQuery as jest.Mock).mockReturnValue({
      data: { project: mockProjectData },
      loading: false,
      error: null,
    });
  })

  it('should render the project title', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('project')).toBeInTheDocument();
  });

  it('should render the project funders', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('funders')).toBeInTheDocument();
  });

  it('should render the project members', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('projectMembers')).toBeInTheDocument();
  });

  it('should render the research outputs', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('researchOutputs')).toBeInTheDocument();
  });

  it('should render the plans', () => {
    render(<ProjectOverviewPage />);
    expect(screen.getByText('plans')).toBeInTheDocument();
  });

  it('should display Loading message ', async () => {
    (useProjectQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
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
