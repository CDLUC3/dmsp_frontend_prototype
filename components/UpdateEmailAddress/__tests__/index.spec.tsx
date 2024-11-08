import React from 'react';
import { ApolloError } from '@apollo/client';
import { render, screen, act, fireEvent, waitFor, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import UpdateEmailAddress from '..';
import { useSetPrimaryUserEmailMutation, useAddUserEmailMutation, useRemoveUserEmailMutation } from '@/generated/graphql';
import { handleApolloErrors } from '@/utils/gqlErrorHandler';

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

  it('should dislay email addresses', async () => {
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