import React from 'react';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import {
  useAddPlanContributorMutation,
  useProjectContributorsQuery,
  useUpdatePlanContributorMutation,
  usePlanContributorsQuery,
  ProjectContributor,
  useRemovePlanContributorMutation,
  PlanContributorErrors
} from '@/generated/graphql';
import { useParams, useRouter } from 'next/navigation';

import ProjectsProjectPlanAdjustMembers from '../page';
import mockProjectContributors from '../__mocks__/projectContributorsMock.json';
import mockPlanContributors from '../__mocks__/planContributorsMock.json'

expect.extend(toHaveNoViolations);

jest.mock("@/generated/graphql", () => ({
  useProjectContributorsQuery: jest.fn(),
  usePlanContributorsQuery: jest.fn(),
  useAddPlanContributorMutation: jest.fn(),
  useUpdatePlanContributorMutation: jest.fn(),
  useRemovePlanContributorMutation: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));


describe('ProjectsProjectPlanAdjustMembers', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ projectId: 1, dmpid: 1 });
    (useProjectContributorsQuery as jest.Mock).mockReturnValue({
      data: mockProjectContributors,
      loading: false,
      error: undefined,
    });

    (usePlanContributorsQuery as jest.Mock).mockReturnValue({
      data: mockPlanContributors,
      loading: false,
      error: null,
      refetch: jest.fn()
    });
    (useAddPlanContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);
    (useRemovePlanContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    (useUpdatePlanContributorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);
  });

  it('should render the loading state when queries are still loading', async () => {
    (useProjectContributorsQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: undefined,
    });

    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });
    expect(screen.getByText('messaging.loading...')).toBeInTheDocument();
  });

  it('should render errors when errors from queries are returned', async () => {
    (useProjectContributorsQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Error'),
    });

    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });
    expect(screen.getByText('messaging.error')).toBeInTheDocument();
  });

  it('should render plan members in the correct section', async () => {
    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });

    // Find the section with the <h2> text 'headings.h2MembersInThePlan'
    const membersInPlanSection = screen.getByRole('region', { name: 'Project members list' });
    const heading = within(membersInPlanSection).getByRole('heading', { level: 2, name: /headings.h2MembersInThePlan/i });

    const jacquesCousteau = within(membersInPlanSection).getByRole('heading', { level: 3, name: /Jacques Cousteau/i });
    const captainNemo = within(membersInPlanSection).getByRole('heading', { level: 3, name: /Captain Nemo/i });
    expect(heading).toBeInTheDocument();
    expect(jacquesCousteau).toBeInTheDocument();
    expect(captainNemo).toBeInTheDocument();
  });

  it('should handle removing a member to the plan', async () => {
    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });

    // Find the first button with the text "labels.removeFromPlan"
    const removeMemberButton = screen.getAllByRole('button', { name: /labels.removeFromPlan/i })[0];

    // Simulate a click on the button
    await act(async () => {
      fireEvent.click(removeMemberButton);
    });
    // Find the section with the <h2> text 'headings.h2MembersNotInThePlan'
    const membersNotInPlanSection = screen.getByRole('region', { name: 'Members not in list' });
    const heading = within(membersNotInPlanSection).getByRole('heading', { level: 2, name: /headings.h2MembersNotInPlan/i });
    expect(heading).toBeInTheDocument();
    const jacquesCousteau = within(membersNotInPlanSection).getByRole('heading', { level: 3, name: /Jacques Cousteau/i });
    expect(jacquesCousteau).toBeInTheDocument();
  });

  it('should handle adding a member to the plan', async () => {
    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });

    // First remove Jacques as a plan member

    // Find the first button with the text "labels.removeFromPlan"
    const removeMemberButton = screen.getAllByRole('button', { name: /labels.removeFromPlan/i })[0];

    // Simulate a click on the button
    await act(async () => {
      fireEvent.click(removeMemberButton);
    });

    // Find the first button with the text "labels.addMemberToPlan"
    const addMemberButton = screen.getAllByRole('button', { name: /labels.addMemberToPlan/i })[0];

    //Simulate a click on the button
    await act(async () => {
      fireEvent.click(addMemberButton);
    });

    // Find the section with the <h2> text 'headings.h2MembersInThePlan'
    const membersInPlanSection = screen.getByRole('region', { name: 'Project members list' });

    const jacquesCousteau = within(membersInPlanSection).getByRole('heading', { level: 3, name: /Jacques Cousteau/i });
    expect(jacquesCousteau).toBeInTheDocument();
  });


  it('should handle updating the primary contact', async () => {
    const mockUpdatePlanContributor = jest.fn().mockResolvedValueOnce({ data: { key: 'value' } });

    (useUpdatePlanContributorMutation as jest.Mock).mockReturnValue([
      mockUpdatePlanContributor, // Use the mock function here
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <ProjectsProjectPlanAdjustMembers />
      );
    });
    const changeButton = screen.getByRole('button', { name: /buttons.change/i });

    // Click the change button to expose the select dropdown
    await act(async () => {
      fireEvent.click(changeButton);
    });

    // Find the dropdown button using its aria-label
    const dropdownButton = screen.getByLabelText(/primary contact selection/i);
    await act(async () => {
      fireEvent.click(dropdownButton);
    });

    // Find the dropdown container (role="listbox")
    const listbox = screen.getByRole('listbox');

    // Find the "Captain Nemo" option (role="option") within the listbox
    const option = within(listbox).getByRole('option', { name: /Captain Nemo/i });

    // Click the "Captain Nemo" option
    await act(async () => {
      fireEvent.click(option);
    });

    const saveButton = screen.getByRole('button', { name: /buttons.save/i });

    // Click the save button
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(mockUpdatePlanContributor).toHaveBeenCalledTimes(1);
    expect(mockUpdatePlanContributor).toHaveBeenCalledWith({
      variables: {
        contributorRoleIds: [2],
        isPrimaryContact: true,
        planContributorId: 21,
        planId: 1
      },
    });
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <ProjectsProjectPlanAdjustMembers />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});