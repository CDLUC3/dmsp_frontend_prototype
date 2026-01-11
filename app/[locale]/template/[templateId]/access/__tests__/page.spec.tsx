import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TemplateAccessPage from '../page';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AddTemplateCollaboratorDocument,
  RemoveTemplateCollaboratorDocument,
  TemplateCollaboratorsDocument
} from '@/generated/graphql';
import logECS from '@/utils/clientLogger';

import { useToast } from '@/context/ToastContext';

import mockData from '../__mocks__/mockData.json';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import { set } from 'zod';

expect.extend(toHaveNoViolations);

//logECS
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Simple mock - we don't care about testing PageHeader here
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);
const mockUseMutation = jest.mocked(useMutation);

let mockAddCollaboratorFn: jest.Mock;
let mockRemoveCollaboratorFn: jest.Mock;

const setupMocks = () => {
  // Create stable references OUTSIDE mockImplementation
  const stableTemplateCollaboratorsReturn = {
    data: mockData,
    loading: false,
    error: null,
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === TemplateCollaboratorsDocument) {
      return stableTemplateCollaboratorsReturn as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    };
  });

  mockAddCollaboratorFn = jest.fn().mockResolvedValue({
    data: { addTemplateCollaborator: { errors: [] } },
  });

  mockRemoveCollaboratorFn = jest.fn().mockResolvedValue({
    data: { removeTemplateCollaborator: true },
  });

  mockUseMutation.mockImplementation((document) => {
    if (document === AddTemplateCollaboratorDocument) {
      return [mockAddCollaboratorFn, { loading: false, error: undefined }] as any;
    }

    if (document === RemoveTemplateCollaboratorDocument) {
      return [mockRemoveCollaboratorFn, { loading: false, error: undefined }] as any;
    }

    return [jest.fn(), { loading: false, error: undefined }] as any;
  });
};

describe('TemplateAccessPage', () => {
  const mockAddToast = jest.fn();

  beforeEach(() => {
    setupMocks();
    (useToast as jest.Mock).mockReturnValue({ add: mockAddToast });

    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
  });

  it('renders the main content', () => {
    render(<TemplateAccessPage />);
    expect(screen.getByText('headings.h3OrgAccess')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara1')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara2')).toBeInTheDocument();
    expect(screen.getByText('headings.externalPeople')).toBeInTheDocument();
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
    const emailInput = screen.getByLabelText(/labels.email/);
    const inviteButton = screen.getByText('buttons.invite');

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockAddCollaboratorFn).toHaveBeenCalledWith({
        variables: {
          email: 'newuser@example.com',
          templateId: 123
        },
        refetchQueries: expect.arrayContaining([
          expect.objectContaining({
            query: TemplateCollaboratorsDocument,
            variables: { templateId: 123 }
          })
        ])
      });
    });
  });

  it('should handle access revocation', async () => {
    render(<TemplateAccessPage />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /buttons.confirm/i });

    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockRemoveCollaboratorFn).toHaveBeenCalledWith({
        variables: {
          templateId: 123,
          email: 'testUser1@example.com' // First collaborator from mockData
        },
        refetchQueries: expect.arrayContaining([
          expect.objectContaining({
            query: TemplateCollaboratorsDocument,
            variables: { templateId: 123 }
          })
        ])
      });
    });
  });

  it('should display errors when removeTemplateCollaboratorMutation throws an error', async () => {
    // Override the mock for this specific test
    const mockRemoveError = jest.fn().mockRejectedValueOnce(new Error('Revoke error'));

    mockUseMutation.mockImplementation((document) => {
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveError, { loading: false, error: undefined }] as any;
      }
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /buttons.confirm/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('messages.errors.errorRemovingEmail')).toBeInTheDocument();
    });

    // Ensure the mutation was called
    expect(mockRemoveError).toHaveBeenCalledWith({
      variables: { templateId: 123, email: 'testUser1@example.com' },
      refetchQueries: expect.any(Array),
    });
  });

  it('should display error when removeTemplateCollaboratorMutation returns an Apollo error', async () => {

    // Make the mutation function throw the ApolloError when called
    const mockRemoveApolloError = jest.fn().mockRejectedValue(new Error('Apollo error occurred'));

    mockUseMutation.mockImplementation((document) => {
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveApolloError, { loading: false, error: undefined }] as any;
      }
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /buttons.confirm/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('messages.errors.errorRemovingEmail')).toBeInTheDocument();
    });
  });

  it('should call Toast with success message if data is returned from removeTemplateCollaborator', async () => {
    const mockRemoveSuccess = jest.fn().mockResolvedValueOnce({
      data: { removeTemplateCollaborator: true },
    });

    mockUseMutation.mockImplementation((document) => {
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveSuccess, { loading: false, error: undefined }] as any;
      }
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    // Click the "Remove" button to open the modal
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await act(async () => {
      fireEvent.click(removeButtons[0]);
    });

    // Wait for the modal to open and click the confirm button
    const confirmButton = await screen.findByRole('button', { name: /buttons.confirm/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // Assert that addToast was called with the success message
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('messages.success.emailSuccessfullyRevoked', { type: 'success' });
    });
  });

  it('should handle invite for adding an email with error', async () => {
    const mockAddError = jest.fn().mockResolvedValueOnce({
      data: {
        addTemplateCollaborator: {
          errors: {
            general: 'email already exists'
          }
        }
      },
    });

    mockUseMutation.mockImplementation((document) => {
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddError, { loading: false, error: undefined }] as any;
      }
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });

    const inviteButton = screen.getByText(/buttons.invite/i);
    await act(async () => {
      fireEvent.click(inviteButton);
    });

    await waitFor(() => {
      expect(screen.getByText('email already exists')).toBeInTheDocument();
    });
  });

  it('should handle errors when addTemplateCollaborator throws an error', async () => {
    const mockAddThrowError = jest.fn().mockRejectedValueOnce(new Error('Invite error'));

    mockUseMutation.mockImplementation((document) => {
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddThrowError, { loading: false, error: undefined }] as any;
      }
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });

    const inviteButton = screen.getByText(/buttons.invite/i);
    await act(async () => {
      fireEvent.click(inviteButton);
    });

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

    await waitFor(() => {
      expect(screen.getByText('messages.errors.errorAddingCollaborator')).toBeInTheDocument();
    });
  });

  it('should handle errors when addTemplateCollaborator returns an Apollo Error', async () => {

    const mockAddApolloError = jest.fn().mockRejectedValue(new Error('Apollo error occurred'));

    mockUseMutation.mockImplementation((document) => {
      if (document === AddTemplateCollaboratorDocument) {
        return [mockAddApolloError, { loading: false, error: undefined }] as any;
      }
      if (document === RemoveTemplateCollaboratorDocument) {
        return [mockRemoveCollaboratorFn, { loading: false, error: undefined }] as any;
      }
      return [jest.fn(), { loading: false, error: undefined }] as any;
    });

    render(<TemplateAccessPage />);

    const email = screen.getByTestId(/email/i);

    await act(async () => {
      fireEvent.change(email, { target: { value: 'test@example.com' } });
    });

    const inviteButton = screen.getByText(/buttons.invite/i);
    await act(async () => {
      fireEvent.click(inviteButton);
    });

    // Assert that the error message is displayed
    await waitFor(() => {
      expect(screen.getByText('messages.errors.errorAddingCollaborator')).toBeInTheDocument();
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateAccessPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
