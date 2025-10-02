import React from 'react';
import { ApolloError } from '@apollo/client';

import { fireEvent, render, screen, waitFor, act } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TemplateAccessPage from '../page';
import { useParams } from 'next/navigation';
import {
  useAddTemplateCollaboratorMutation,
  useRemoveTemplateCollaboratorMutation,
  useTemplateCollaboratorsQuery
} from '@/generated/graphql';
import logECS from '@/utils/clientLogger';

import { useToast } from '@/context/ToastContext';

import mockData from '../__mocks__/mockData.json';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

//logECS
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useTemplateCollaboratorsQuery: jest.fn(),
  useAddTemplateCollaboratorMutation: jest.fn(),
  useRemoveTemplateCollaboratorMutation: jest.fn()
}));

// Simple mock - we don't care about testing PageHeader here
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

describe('TemplateAccessPage', () => {
  const mockAddToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ add: mockAddToast });

    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    // Mock the GraphQL query hook to return mock data
    (useTemplateCollaboratorsQuery as jest.Mock).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
    });

    (useAddTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { addTemplateCollaborator: { errors: [] } } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { removeTemplateCollaborator: true } }),
      { loading: false, error: undefined },
    ]);
  });

  it('renders the main content', () => {
    render(<TemplateAccessPage />);
    expect(screen.getByText('headings.h3OrgAccess')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara1')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara2')).toBeInTheDocument();
    expect(screen.getByText('headings.externalPeople')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.externalPara1')).toBeInTheDocument();
    expect(screen.getByText('headings.share')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.sharePara1')).toBeInTheDocument();
    expect(screen.getByText('labels.email')).toBeInTheDocument();
    expect(screen.getByText('buttons.invite')).toBeInTheDocument();
    // Collaborators
    expect(screen.getByText((content) => content.trim() === "Harry Potter")).toBeInTheDocument();
    expect(screen.getByText('testUser1@example.com')).toBeInTheDocument();
    const removeButton = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButton.length).toBe(2);
    expect(screen.getByText((content) => content.trim() === "Minerva McGonagall")).toBeInTheDocument();
    expect(screen.getByText('testUser2@example.com')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<TemplateAccessPage />);
    const emailInput = screen.getByLabelText('labels.email');
    const inviteButton = screen.getByText('buttons.invite');

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(useAddTemplateCollaboratorMutation).toHaveBeenCalled();
    });
  });

  it('should handle access revocation', async () => {
    render(<TemplateAccessPage />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(useRemoveTemplateCollaboratorMutation).toHaveBeenCalled();
    });
  });

  it('should display errors when useRemoveTemplateCollaboratorMutation throws an error', async () => {
    const mockRemoveMutation = jest.fn().mockRejectedValueOnce(new Error('Revoke error'));
    (useRemoveTemplateCollaboratorMutation as jest.Mock).mockReturnValue([mockRemoveMutation, { loading: false }]);

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('messages.errors.errorRemovingEmail')).toBeInTheDocument();
    });

    // Ensure the mutation was called
    expect(mockRemoveMutation).toHaveBeenCalledWith({
      variables: { templateId: 123, email: 'testUser1@example.com' },
      refetchQueries: expect.any(Array),
    });
  });

  it('should display error when useRemoveTemplateCollaboratorMutation returns an Apollo error', async () => {

    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'Apollo error occurred',
    });

    // Make the mutation function throw the ApolloError when called
    const mockRemoveMutation = jest.fn().mockRejectedValue(apolloError);

    (useRemoveTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      mockRemoveMutation,
      { loading: false, error: undefined }
    ]);

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Apollo error occurred')).toBeInTheDocument();
    });
  });

  it('should call Toast with success message if data is returned from removeTemplateCollaborator', async () => {

    const mockRemoveMutation = jest.fn().mockResolvedValueOnce({
      data: { removeTemplateCollaborator: true },
    });
    (useRemoveTemplateCollaboratorMutation as jest.Mock).mockReturnValue([mockRemoveMutation, { loading: false }]);

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    // Assert that addToast was called with the success message
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('messages.success.emailSuccessfullyRevoked', { type: 'success' });
    });
  });

  it('should handle invite for adding an email', async () => {
    const mockAddMutation = jest.fn().mockResolvedValueOnce({
      data: {
        addTemplateCollaborator: {
          errors: {
            general: 'email already exists'
          }
        }
      },
    });
    (useAddTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      mockAddMutation,
      { loading: false, error: undefined },
    ]);

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });
    const inviteButton = screen.getByText(/invite/i);
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(screen.getByText('email already exists')).toBeInTheDocument();
    });
  });

  it('should handle errors when addTemplateCollaborator throws an error', async () => {
    const mockAddMutation = jest.fn().mockRejectedValueOnce(new Error('Invite error'));
    (useAddTemplateCollaboratorMutation as jest.Mock).mockReturnValue([mockAddMutation, { loading: false }]);

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });

    const inviteButton = screen.getByText(/invite/i);
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'handleAddingEmail',
        expect.objectContaining({
          error: expect.anything(),
          url: { path: '/template/[templateId]/access' },
        })
      );
    });

  });

  it('should handle errors when addTemplateCollaborator returns an Apollo Error', async () => {
    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'Apollo error occurred',
    });

    // Make the mutation function throw the ApolloError when called
    const mockAddMutation = jest.fn().mockRejectedValue(apolloError);

    (useAddTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      mockAddMutation,
      { loading: false, error: undefined }
    ]);

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });

    const inviteButton = screen.getByText(/invite/i);
    fireEvent.click(inviteButton);

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Apollo error occurred')).toBeInTheDocument();
    });

  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateAccessPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
