import React from 'react';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProfilePage from '../page';
import { useMeQuery, useUpdateUserProfileMutation, useLanguagesQuery } from '@/generated/graphql';
import { handleApolloErrors } from "@/utils/gqlErrorHandler";

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))


// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useMeQuery: jest.fn(),
  useUpdateUserProfileMutation: jest.fn(),
  useLanguagesQuery: jest.fn(),
}));

jest.mock('@/utils/gqlErrorHandler', () => ({
  handleApolloErrors: jest.fn()
}))

// Mock UpdateEmailAddress component
jest.mock('@/components/UpdateEmailAddress', () => ({
  __esModule: true,
  default: () => <div data-testid="update-email-address">Mocked UpdateEmailAddress Component</div>,
}));

// Mock TypeAheadWithOther component
jest.mock('@/components/Form/TypeAheadWithOther', () => ({
  __esModule: true,
  default: () => <div data-testid="type-ahead">Mocked TypeAheadWithOther Component</div>,
}));

const mockUserData = {
  me: {
    givenName: 'John',
    surName: 'Doe',
    affiliation: { name: 'Test Institution', uri: 'test-uri' },
    emails: [{ id: '1', email: 'test@example.com', isPrimary: true, isConfirmed: true }],
    languageId: 'en',
  },
};

const mockLanguagesData = {
  languages: [{ id: 'en', name: 'English', isDefault: true }],
};

// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: false, error: undefined });
  mockHook(useLanguagesQuery).mockReturnValue({ data: mockLanguagesData, loading: false, error: undefined });
  mockHook(useUpdateUserProfileMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
};

describe('ProfilePage', () => {
  beforeEach(() => {
    setupMocks();
    window.scrollTo = jest.fn(); // Called by the wrapping PageWrapper
    const mockUpdateUserProfile = jest.fn();
    mockHook(useUpdateUserProfileMutation).mockReturnValue([mockUpdateUserProfile, { loading: false, error: undefined }]);
  });

  it('should render profile page with user data', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Update profile')).toBeInTheDocument();
    });

    // Check that user data is rendered
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Institution')).toBeInTheDocument();
  });

  it('sets the document title correctly', () => {
    render(<ProfilePage />);
    expect(document.title).toBe('Update profile | DMPTool');
  });

  it('should scroll to the top of the page on render', () => {
    window.scrollTo = jest.fn();
    render(<ProfilePage />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should show form fields when Edit button is clicked', async () => {
    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();

    // Enter an invalid value for first name field
    fireEvent.change(firstNameInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(submitButton);

    // Check if error message is present when fields empty
    const errorMessage = await screen.findByText(/please enter a valid name./i);
    expect(errorMessage).toBeInTheDocument();
  })

  it('should set data back to original when clicking Cancel button', async () => {
    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();

    // Enter an invalid value for first name field
    fireEvent.change(firstNameInput, { target: { value: 'Mary' } });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Check to have original first name 'John' in document
    expect(screen.getByText('John')).toBeInTheDocument();
  })

  it('should load languages', async () => {
    render(<ProfilePage />);

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const hiddenContainer = screen.getByTestId('hidden-select-container');
    const select = within(hiddenContainer).getByDisplayValue('English');
    expect(select).toBeInTheDocument();
  })

  it('should call handleApolloErrors mock when language query returns an error', async () => {
    mockHook(useLanguagesQuery).mockReturnValue({ data: mockLanguagesData, loading: false, error: { graphQlErrors: ['There was an error'], networkError: null } });
    render(<ProfilePage />);
    expect(handleApolloErrors).toHaveBeenCalled();
  })

  it('should call handleApolloErrors mock when meQuery returns an error', async () => {
    mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: false, error: { graphQlErrors: ['There was an error'], networkError: null } });
    render(<ProfilePage />);
    expect(handleApolloErrors).toHaveBeenCalled();
  })

  it('should display Loading message when meQuery returns queryLoading', async () => {
    mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: true, error: null });
    render(<ProfilePage />);
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  })

  it('should pass axe accessibility test', async () => {
    const { container } = render(<ProfilePage />)
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});