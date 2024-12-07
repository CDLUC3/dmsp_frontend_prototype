import React from 'react';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import UpdateEmailAddress from '..';
import { useSetPrimaryUserEmailMutation, useAddUserEmailMutation, useRemoveUserEmailMutation } from '@/generated/graphql';
import logECS from '@/utils/clientLogger';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en-US/en-US.json';
import { MeDocument } from '@/generated/graphql';
expect.extend(toHaveNoViolations);

const GET_USER = MeDocument;
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useSetPrimaryUserEmailMutation: jest.fn(),
  useAddUserEmailMutation: jest.fn(),
  useRemoveUserEmailMutation: jest.fn(),
}));

jest.mock('@/utils/gqlErrorHandler', () => ({
  handleApolloErrors: jest.fn()
}))

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

export interface EmailInterface {
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

const mockEmailAddresses = [
  {
    email: 'test@test.com',
    isPrimary: false,
    isConfirmed: true
  },
  {
    email: 'me@test.com',
    isPrimary: true,
    isConfirmed: true
  },
]

const mockEmailData = {
  "id": 15,
  "errors": null,
  "email": "jshin3@test.com",
  "isConfirmed": false,
  "isPrimary": false,
  "userId": 5,
}

// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useSetPrimaryUserEmailMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  mockHook(useAddUserEmailMutation).mockReturnValue([() => mockEmailData, { loading: false, error: undefined }]);
  mockHook(useRemoveUserEmailMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
};

describe('UpdateEmailAddressPage', () => {
  beforeEach(() => {
    setupMocks();
    // Create a mock scrollIntoView function
    const mockScrollIntoView = jest.fn();
    // Add it to the Element prototype
    Element.prototype.scrollIntoView = mockScrollIntoView;
  });

  it('should render UpdateEmailAddress page with expected headings', async () => {
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('UserProfile.emailAndAuth')).toBeInTheDocument();
      const headingElement1 = screen.getByRole('heading', { name: 'UserProfile.headingPrimaryEmail' });
      const headingElement2 = screen.getByRole('heading', { name: 'UserProfile.headingAliasEmailAddr' });
      const headingElement3 = screen.getByRole('heading', { name: 'UserProfile.headingSSO' })
      const headingElement4 = screen.getByRole('heading', { name: 'UserProfile.headingNotifications' });
      expect(headingElement1).toBeInTheDocument();
      expect(headingElement2).toBeInTheDocument();
      expect(headingElement3).toBeInTheDocument();
      expect(headingElement4).toBeInTheDocument();
      expect(screen.getByText(/UserProfile.primaryEmailDesc/i)).toBeInTheDocument();
      expect(screen.getByText(/UserProfile.notificationsDesc/i)).toBeInTheDocument();
      expect(screen.getByText(/UserProfile.aliasEmailDesc/i)).toBeInTheDocument();
    });
  });

  it('should display email addresses', async () => {
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText(/test@test.com/i)).toBeInTheDocument();
    expect(screen.getByText(/me@test.com/i)).toBeInTheDocument();
  });

  it('should call removeUserEmailMutation when deleting an email', async () => {
    // Mock successful mutation response
    const mockRemoveEmailResponse = {
      data: {
        removeUserEmail: {
          errors: null
        }
      }
    };

    // Mock the mutation with a successful response
    const mockRemoveEmailMutation = jest.fn().mockResolvedValue(mockRemoveEmailResponse);
    (useRemoveUserEmailMutation as jest.Mock).mockReturnValue([
      mockRemoveEmailMutation,
      { loading: false }
    ]);

    // Mock the refetch function
    const mockRefetch = jest.fn();

    // Render the component
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    // Find and click the delete button for test@test.com
    const deleteTrigger = document.querySelector('.delete-email') as HTMLElement;
    await act(async () => {
      fireEvent.click(deleteTrigger);
    });

    // Verify the mutation was called with correct parameters
    expect(mockRemoveEmailMutation).toHaveBeenCalledWith({
      variables: {
        email: 'test@test.com'
      },
      refetchQueries: [
        {
          query: GET_USER,
        },
      ],
    });
  });

  it('should handle general error when deleting an email', async () => {
    // Create a general error (not Apollo Error)
    const generalError = new Error('General error occurred');

    // Mock the mutation to throw a general error
    const mockRemoveEmailMutation = jest.fn().mockRejectedValue(generalError);
    (useRemoveUserEmailMutation as jest.Mock).mockReturnValue([
      mockRemoveEmailMutation,
      { loading: false }
    ]);

    // Mock setErrors function to verify it's called
    const mockSetEmailAddresses = jest.fn();

    // Render the component
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    // Find and click the delete button for test@test.com
    const deleteTrigger = document.querySelector('.delete-email') as HTMLElement;

    await act(async () => {
      fireEvent.click(deleteTrigger);
    });

    // Verify the error message is displayed
    await waitFor(() => {
      // Use container.querySelector to find the div with class "error"
      const errorDiv = document.querySelector('.error-message') as HTMLElement;

      // Check that the errorDiv exists
      expect(errorDiv).toBeInTheDocument();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Verify scrollIntoView was called with correct parameters
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });

    // Verify logECS was called with correct parameters
    expect(logECS).toHaveBeenCalledWith(
      'error',
      'deleteEmail',
      {
        error: generalError,
        url: { path: '/account/profile' }
      }
    );
  });

  it('should handle general error when adding alias', async () => {
    // Create a general error (not Apollo Error)
    const generalError = new Error('General error occurred');

    // Mock the mutation to throw a general error
    const mockAddUserEmailMutation = jest.fn().mockRejectedValue(generalError);
    (useAddUserEmailMutation as jest.Mock).mockReturnValue([
      mockAddUserEmailMutation,
      { loading: false }
    ]);

    // Mock setErrors function to verify it's called
    const mockSetEmailAddresses = jest.fn();

    // Render the component
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    //Enter a value into the add alias input field
    const addAliasInput = screen.getByLabelText(/headingAddAliasEmail/i);
    fireEvent.change(addAliasInput, { target: { value: 'msmith@test.com' } });

    // Locate the Add button and click it
    // Select the wrapping div with class "addContainer" and assert it's not null
    const addContainer = document.querySelector('.addContainer') as HTMLElement;
    expect(addContainer).not.toBeNull(); // Ensure addContainer is found

    // Now we can safely use addContainer with `within`
    const addButton = within(addContainer!).getByRole('button', { name: 'UserProfile.btnAdd' });

    await act(async () => {
      fireEvent.click(addButton);
    })

    // Verify the error message is displayed
    await waitFor(() => {
      // Use container.querySelector to find the div with class "error"
      const errorDiv = document.querySelector('.error-message') as HTMLElement;

      // Check that the errorDiv exists
      expect(errorDiv).toBeInTheDocument();
      expect(screen.getByText('Error when adding new email')).toBeInTheDocument();
    });

    // Verify scrollIntoView was called with correct parameters
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });

    // Verify logECS was called with correct parameters
    expect(logECS).toHaveBeenCalledWith(
      'error',
      'handleAddingAlias',
      {
        error: generalError,
        url: { path: '/account/profile' }
      }
    );
  });


  it('should handle general error when setting primary email', async () => {
    // Create a general error (not Apollo Error)
    const generalError = new Error('General error occurred');

    // Mock the mutation to throw a general error
    const mockSetPrimaryMutation = jest.fn().mockRejectedValue(generalError);
    (useSetPrimaryUserEmailMutation as jest.Mock).mockReturnValue([
      mockSetPrimaryMutation,
      { loading: false }
    ]);

    // Mock setErrors function to verify it's called
    const mockSetEmailAddresses = jest.fn();

    // Render the component
    render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );

    // Find the "Make primary email address" button
    const makePrimaryButton = screen.getByRole('button', {
      name: /UserProfile.linkMakePrimary/i
    });

    // Trigger the make primary action
    await act(async () => {
      fireEvent.click(makePrimaryButton);
    });

    // Verify the error message is displayed
    await waitFor(() => {
      // Use container.querySelector to find the div with class "error"
      const errorDiv = document.querySelector('.error-message') as HTMLElement;

      // Check that the errorDiv exists
      expect(errorDiv).toBeInTheDocument();
      expect(screen.getByText('Error when setting primary email')).toBeInTheDocument();
    });
    // Verify scrollIntoView was called with correct parameters
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });

    // Verify logECS was called with correct parameters
    expect(logECS).toHaveBeenCalledWith(
      'error',
      'makePrimaryEmail',
      {
        error: generalError,
        url: { path: '/account/profile' }
      }
    );
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <NextIntlClientProvider
        locale="en"
      >
        <UpdateEmailAddress
          emailAddresses={mockEmailAddresses}
        />
      </NextIntlClientProvider>
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});