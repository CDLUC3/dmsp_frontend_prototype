import React from 'react';
import { ApolloError } from '@apollo/client';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import UpdateEmailAddress from '..';
import { useSetPrimaryUserEmailMutation, useAddUserEmailMutation, useRemoveUserEmailMutation } from '@/generated/graphql';
import { handleApolloErrors } from '@/utils/gqlErrorHandler';
import logECS from '@/utils/clientLogger';

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

const mockRefetch = () => {
  return console.log("Called refetch");
}
// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook) => hook as jest.Mock;

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
    render(<UpdateEmailAddress
      emailAddresses={mockEmailAddresses}
      setEmailAddresses={jest.fn()}
      refetch={jest.fn()}
    />);

    await waitFor(() => {
      expect(screen.getByText('Email and Authentication')).toBeInTheDocument();
      const headingElement1 = screen.getByRole('heading', { name: 'Primary email address' });
      const headingElement2 = screen.getByRole('heading', { name: 'Alias email addresses' });
      const headingElement3 = screen.getByRole('heading', { name: 'Single sign on activated' })
      const headingElement4 = screen.getByRole('heading', { name: 'Receives notifications' });
      expect(headingElement1).toBeInTheDocument();
      expect(headingElement2).toBeInTheDocument();
      expect(headingElement3).toBeInTheDocument();
      expect(headingElement4).toBeInTheDocument();
      expect(screen.getByText(/This email will be used for your account login. It can also be used for password resets./i)).toBeInTheDocument();
      expect(screen.getByText(/This email address will be used for DMP notifications./i)).toBeInTheDocument();
      expect(screen.getByText(/Alias email addresses may be used to help others find you, for example if they‘d like to share a DMP with you./i)).toBeInTheDocument();
    });
  });

  it('should display email addresses', async () => {
    render(<UpdateEmailAddress
      emailAddresses={mockEmailAddresses}
      setEmailAddresses={jest.fn()}
      refetch={jest.fn()}
    />);

    expect(screen.getByText(/test@test.com/i)).toBeInTheDocument();
    expect(screen.getByText(/me@test.com/i)).toBeInTheDocument();
  });

  it('should call setEmailAddresses when adding a new email alias', async () => {
    const mockSetEmailAddresses = jest.fn();
    render(<UpdateEmailAddress
      emailAddresses={mockEmailAddresses}
      setEmailAddresses={mockSetEmailAddresses}
      refetch={jest.fn()}
    />);

    //Enter a value into the add alias input field
    const addAliasInput = screen.getByLabelText(/add alias email address/i);
    fireEvent.change(addAliasInput, { target: { value: 'msmith@test.com' } });

    // Locate the Add button and click it
    // Select the wrapping div with class "addContainer" and assert it's not null
    const addContainer = document.querySelector('.addContainer') as HTMLElement;
    expect(addContainer).not.toBeNull(); // Ensure addContainer is found

    // Now we can safely use addContainer with `within`
    const addButton = within(addContainer!).getByRole('button', { name: 'Add' });

    await act(async () => {
      fireEvent.click(addButton);
    })

    expect(mockSetEmailAddresses).toHaveBeenCalledTimes(1);
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
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={jest.fn()}
        refetch={mockRefetch}
      />
    );

    // Find and click the delete button for test@test.com
    const deleteTrigger = screen.getByTestId('delete-email');

    screen.debug();
    await act(async () => {
      fireEvent.click(deleteTrigger);
    });

    // Verify the mutation was called with correct parameters
    expect(mockRemoveEmailMutation).toHaveBeenCalledWith({
      variables: {
        email: 'test@test.com'
      }
    });

    // Verify refetch was called after successful deletion
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should call handleApolloErrors when deleting an email', async () => {
    // Create a mock Apollo Error
    const mockGraphQLErrors = [{ message: 'GraphQL Error', path: ['removeUserEmail'] }];
    const mockNetworkError = new Error('Network error');
    const mockApolloError = new ApolloError({
      graphQLErrors: mockGraphQLErrors,
      networkError: mockNetworkError,
    });

    // Mock the mutation to throw an error
    const mockRemoveEmailMutation = jest.fn().mockRejectedValue(mockApolloError);
    (useRemoveUserEmailMutation as jest.Mock).mockReturnValue([
      mockRemoveEmailMutation,
      { loading: false }
    ]);

    // Mock the router
    const mockRouter = { push: jest.fn() };
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock the refetch function
    const mockRefetch = jest.fn();

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={jest.fn()}
        refetch={mockRefetch}
      />
    );

    // Find and click the delete button for test@test.com
    const deleteTrigger = screen.getByTestId('delete-email');

    screen.debug();
    await act(async () => {
      fireEvent.click(deleteTrigger);
    });

    // Verify handleApolloErrors was called with the correct parameters
    await waitFor(() => {
      expect(handleApolloErrors).toHaveBeenCalledWith(
        mockGraphQLErrors,
        mockNetworkError,
        expect.any(Function), // setErrors function
        expect.any(Function), // retry function
        mockRouter
      );
    });

    // Verify refetch was called after error handling
    expect(mockRefetch).toHaveBeenCalled();
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

    const scrollIntoViewSpy = jest.spyOn(window.HTMLElement.prototype, 'scrollIntoView');

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={mockSetEmailAddresses}
        refetch={jest.fn()}
      />
    );

    // Find and click the delete button for test@test.com
    const deleteTrigger = screen.getByTestId('delete-email');

    screen.debug();
    await act(async () => {
      fireEvent.click(deleteTrigger);
    });

    // Verify the error message is displayed
    await waitFor(() => {
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
      'deleteEmail',
      {
        error: generalError,
        url: { path: '/account/profile' }
      }
    );
  });

  it('should call Apollo Error when adding alias', async () => {
    // Create a mock Apollo Error
    const mockGraphQLErrors = [{ message: 'GraphQL Error', path: ['setPrimaryUserEmail'] }];
    const mockNetworkError = new Error('Network error');
    const mockApolloError = new ApolloError({
      graphQLErrors: mockGraphQLErrors,
      networkError: mockNetworkError,
    });

    // Mock the mutation to throw the error
    const mockAddUserEmailMutation = jest.fn().mockRejectedValue(mockApolloError);
    (useAddUserEmailMutation as jest.Mock).mockReturnValue([
      mockAddUserEmailMutation,
      { loading: false }
    ]);

    // Mock the router
    const mockRouter = { push: jest.fn() };
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={jest.fn()}
        refetch={jest.fn()}
      />
    );

    //Enter a value into the add alias input field
    const addAliasInput = screen.getByLabelText(/add alias email address/i);
    fireEvent.change(addAliasInput, { target: { value: 'msmith@test.com' } });

    // Locate the Add button and click it
    // Select the wrapping div with class "addContainer" and assert it's not null
    const addContainer = document.querySelector('.addContainer') as HTMLElement;
    expect(addContainer).not.toBeNull(); // Ensure addContainer is found

    // Now we can safely use addContainer with `within`
    const addButton = within(addContainer!).getByRole('button', { name: 'Add' });

    await act(async () => {
      fireEvent.click(addButton);
    })

    // Verify handleApolloErrors was called with the correct parameters
    await waitFor(() => {
      expect(handleApolloErrors).toHaveBeenCalledWith(
        mockGraphQLErrors,
        mockNetworkError,
        expect.any(Function), // setErrors function
        expect.any(Function), // retry function
        mockRouter
      );
    });
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

    const scrollIntoViewSpy = jest.spyOn(window.HTMLElement.prototype, 'scrollIntoView');

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={mockSetEmailAddresses}
        refetch={jest.fn()}
      />
    );

    //Enter a value into the add alias input field
    const addAliasInput = screen.getByLabelText(/add alias email address/i);
    fireEvent.change(addAliasInput, { target: { value: 'msmith@test.com' } });

    // Locate the Add button and click it
    // Select the wrapping div with class "addContainer" and assert it's not null
    const addContainer = document.querySelector('.addContainer') as HTMLElement;
    expect(addContainer).not.toBeNull(); // Ensure addContainer is found

    // Now we can safely use addContainer with `within`
    const addButton = within(addContainer!).getByRole('button', { name: 'Add' });

    await act(async () => {
      fireEvent.click(addButton);
    })

    // Verify the error message is displayed
    await waitFor(() => {
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
      'handleAddingAlias',
      {
        error: generalError,
        url: { path: '/account/profile' }
      }
    );
  });

  it('should handle Apollo Error when setting primary email', async () => {
    // Create a mock Apollo Error
    const mockGraphQLErrors = [{ message: 'GraphQL Error', path: ['setPrimaryUserEmail'] }];
    const mockNetworkError = new Error('Network error');
    const mockApolloError = new ApolloError({
      graphQLErrors: mockGraphQLErrors,
      networkError: mockNetworkError,
    });

    // Mock the mutation to throw the error
    const mockSetPrimaryMutation = jest.fn().mockRejectedValue(mockApolloError);
    (useSetPrimaryUserEmailMutation as jest.Mock).mockReturnValue([
      mockSetPrimaryMutation,
      { loading: false }
    ]);

    // Mock the router
    const mockRouter = { push: jest.fn() };
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={jest.fn()}
        refetch={jest.fn()}
      />
    );

    // Find the "Make primary email address" button
    const makePrimaryButton = screen.getByRole('button', {
      name: /make primary email address/i
    });

    // Trigger the make primary action
    await act(async () => {
      fireEvent.click(makePrimaryButton);
    });


    // Verify handleApolloErrors was called with the correct parameters
    await waitFor(() => {
      expect(handleApolloErrors).toHaveBeenCalledWith(
        mockGraphQLErrors,
        mockNetworkError,
        expect.any(Function), // setErrors function
        expect.any(Function), // retry function
        mockRouter
      );
    });
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

    const scrollIntoViewSpy = jest.spyOn(window.HTMLElement.prototype, 'scrollIntoView');

    // Render the component
    render(
      <UpdateEmailAddress
        emailAddresses={mockEmailAddresses}
        setEmailAddresses={mockSetEmailAddresses}
        refetch={jest.fn()}
      />
    );

    // Find the "Make primary email address" button
    const makePrimaryButton = screen.getByRole('button', {
      name: /make primary email address/i
    });

    // Trigger the make primary action
    await act(async () => {
      fireEvent.click(makePrimaryButton);
    });

    // Verify the error message is displayed
    await waitFor(() => {
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
    const { container } = render(<UpdateEmailAddress
      emailAddresses={mockEmailAddresses}
      setEmailAddresses={jest.fn()}
      refetch={jest.fn()}
    />);
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});