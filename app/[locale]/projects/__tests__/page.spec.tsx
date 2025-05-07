import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useMyProjectsQuery } from '@/generated/graphql';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsListPage from '../page';
import { useFormatter, useTranslations } from 'next-intl';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

// Mock the GraphQL query
jest.mock('@/generated/graphql', () => ({
  useMyProjectsQuery: jest.fn(),
}));

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(),
  useTranslations: jest.fn(),
}));

const mockProjectsData = {
  myProjects: {
    items: [
      {
        __typename: 'Project',
        title: 'Project 1',
        id: 1,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        modified: '2023-06-01',
        contributors: [
          {
            __typename: 'ProjectContributor',
            name: 'John Doe',
            orcid: '0000-0001-2345-6789',
            role: 'Researcher',
          },
        ],
        funders: [
          {
            __typename: 'ProjectFunder',
            name: 'NSF',
            grantId: 'http://nsf.gov/award/99999',
          },
        ],
      },
    ],
  }
};

describe('ProjectsListPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    (useMyProjectsQuery as jest.Mock).mockReturnValue({
      data: mockProjectsData,
      loading: false,
      error: null,
    });

    (useFormatter as jest.Mock).mockReturnValue({
      dateTime: jest.fn((date) => date.toLocaleDateString()),
    });

    (useTranslations as jest.Mock).mockImplementation((namespace) => {
      return (key: string) => `${namespace}.${key}`;
    });
  });

  it('should render the ProjectsListPage component', async () => {
    await act(async () => {
      render(
        <ProjectsListPage />
      );
    });

    expect(screen.getByRole('link', { name: /Global.breadcrumbs.home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Global.breadcrumbs.project/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Global.breadcrumbs.projects/i })).toBeInTheDocument();
    expect(screen.getByText('ProjectsListPage.intro')).toBeInTheDocument();
    expect(screen.getByText('ProjectsListPage.buttons.createProject')).toBeInTheDocument();
    expect(screen.getByText('Global.labels.searchByKeyword')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear search/i })).toBeInTheDocument();
    expect(screen.getByText('Global.helpText.searchHelpText') as HTMLElement).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ProjectOverview.project/i })).toBeInTheDocument();
    // Check for the presence of the <h3> element with the link inside it
    const heading = screen.getByRole('heading', { name: /Project 1/i });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Global.buttons.linkExpand')).toBeInTheDocument();
    expect(screen.getByText('ProjectOverview.projectDetails')).toBeInTheDocument();
  });

  it('should display project details after clicking expand, and hide after clicking collapse', async () => {
    await act(async () => {
      render(
        <ProjectsListPage />
      );
    });

    const expandButton = screen.getByRole("button", {
      name: /Global.buttons.linkExpand details for Project 1/i,
    });

    expect(expandButton).toBeInTheDocument();

    // Click on Expand link
    fireEvent.click(expandButton);

    expect(screen.getByRole('heading', { name: /ProjectOverview.projectDetails/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ProjectOverview.dates/i })).toBeInTheDocument();
    const dateText = screen.getByText("1/1/2023 to 12/31/2023", {
      normalizer: (text) => text.replace(/\s+/g, " ").trim(),
    });
    expect(dateText).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ProjectOverview.collaborators/i })).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Researcher\)/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ProjectOverview.funding/i })).toBeInTheDocument();
    expect(screen.getByText('NSF')).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/nsf\.gov\/award\/99999/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ProjectOverview.researchOutputs/i })).toBeInTheDocument();

    // Click on Collapse link
    const collapseButton = screen.getByRole("button", {
      name: /Global.buttons.linkCollapse details for Project 1/i,
    });

    expect(collapseButton).toBeInTheDocument();

    // Click on Expand link
    fireEvent.click(collapseButton);

    // The Project Details heading should no longer be visible
    expect(screen.queryByRole('heading', { name: /ProjectOverview.projectDetails/i })).not.toBeInTheDocument();

  });

  it('should show filtered list when user clicks Search button', async () => {
    await act(async () => {
      render(
        <ProjectsListPage />
      );
    });

    const searchInput = screen.getByLabelText('Global.labels.searchByKeyword');
    fireEvent.change(searchInput, { target: { value: 'Project 1' } });

    const searchButton = screen.getByText('Global.buttons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  })

  it('should display no items found message when search yields no results', async () => {
    await act(async () => {
      render(
        <ProjectsListPage />
      );
    });

    const searchInput = screen.getByLabelText('Global.labels.searchByKeyword');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Project' } });

    const searchButton = screen.getByText('Global.buttons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Global.messaging.noItemsFound')).toBeInTheDocument();
    });
  });

  it('should display loading message when data is loading', async () => {
    (useMyProjectsQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(
        <ProjectsListPage />
      );
    });

    expect(screen.getByText('Global.messaging.loading...')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <ProjectsListPage />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });
});
