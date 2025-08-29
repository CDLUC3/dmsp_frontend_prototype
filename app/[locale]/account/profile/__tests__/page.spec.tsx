import React from 'react';
import { act, fireEvent, render, screen, within } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ApolloError } from '@apollo/client';
import ProfilePage from '../page';
import {
  useLanguagesQuery,
  useMeQuery,
  useUpdateUserProfileMutation
} from '@/generated/graphql';

import { mockScrollIntoView, mockScrollTo } from '@/__mocks__/common';
import mocksAffiliations from '@/__mocks__/common/mockAffiliations.json';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn(),
  })
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


// Mock UpdateEmailAddress component
jest.mock('@/components/UpdateEmailAddress', () => ({
  __esModule: true,
  default: () => <div data-testid="update-email-address">Mocked UpdateEmailAddress Component</div>,
}));

jest.mock('@/components/Form/TypeAheadWithOther', () => ({
  __esModule: true,
  TypeAheadWithOther: () => (
    <div data-testid="type-ahead">Mocked Institution Field</div>
  ),
  useAffiliationSearch: jest.fn(() => ({
    suggestions: mocksAffiliations,
    handleSearch: jest.fn(),
  })),
}));

jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(() => '/about'),
}));

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
  useLocale: jest.fn(() => 'en-US'), // Return a default locale
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
  languages: [
    { id: 'en', name: 'English', isDefault: true },
    { id: 'pt', name: 'Portuguese', isDefault: false },
  ],
};

// Helper function to cast to jest.Mock for TypeScript
/* eslint-disable @typescript-eslint/no-explicit-any*/
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: false, error: undefined });
  mockHook(useLanguagesQuery).mockReturnValue({ data: mockLanguagesData, loading: false, error: undefined });
  mockHook(useUpdateUserProfileMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
};

describe('ProfilePage', () => {
  beforeEach(() => {
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockUpdateUserProfile = jest.fn().mockResolvedValue({
      data: {
        updateUserProfile: {
          success: true,
          message: 'Profile updated successfully',
        },
      },
    });
    mockHook(useUpdateUserProfileMutation).mockReturnValue([mockUpdateUserProfile, { loading: false, error: undefined }]);
  });

  it('should render profile page with user data', async () => {
    render(<ProfilePage />);

    // Check that user data is rendered
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Institution')).toBeInTheDocument();
  });

  it('should show form fields when Edit button is clicked', async () => {
    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/givenName/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const firstNameInput = await screen.getByLabelText(/givenName/i);
    const lastNameInput = await screen.getByLabelText(/surName/i);
    const typeAheadInstitutionField = screen.getByText("Mocked Institution Field");
    const languageSelector = screen.getByRole('button', { name: /Language/i });

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();
    expect(typeAheadInstitutionField).toBeInTheDocument();
    expect(languageSelector).toBeInTheDocument();
  })


  it('should display validation error when first name field does not pass validation', async () => {
    render(<ProfilePage />);

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const firstNameInput = screen.getByLabelText(/givenName/i);

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: '' } });
    });

    const submitButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(submitButton);

    // Check if error message is present when fields empty
    within(screen.getByRole('alert')).getByText('messages.errors.givenNameValidation');
  })

  it('should display validation error when last name field does not pass validation', async () => {
    render(<ProfilePage />);

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const lastNameInput = screen.getByLabelText(/surName/i);

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(lastNameInput, { target: { value: '' } });
    });

    const submitButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(submitButton);

    // Check if error message is present when fields empty
    within(screen.getByRole('alert')).getByText('messages.errors.surNameValidation');
  })

  it('should display validation error when affiliationName field does not pass validation', async () => {
    const mockUserData = {
      me: {
        givenName: 'John',
        surName: 'Doe',
        affiliation: { name: '', uri: '' },
        emails: [{ id: '1', email: 'test@example.com', isPrimary: true, isConfirmed: true }],
        languageId: 'en',
      },
    };
    mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: false, error: null });

    render(<ProfilePage />);

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const submitButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(submitButton);

    // Check if error message is present when fields empty
    within(screen.getByRole('alert')).getByText('messages.errors.affiliationValidation');
  })

  it('should render correct language Select dropdown and display options when user clicks it', async () => {
    render(<ProfilePage />);

    await act(async () => {
      // Locate the Edit button and click it
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    const formSelectContainer = screen.getByRole('button', { name: /Language/i });
    expect(formSelectContainer).toBeInTheDocument();

    // Verify the label
    const label = screen.getByText('language');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('id');

    // Verify the help text
    const helpText = screen.getAllByText('helpTextSelectYourLanguage');
    expect(helpText[0]).toBeInTheDocument();
    expect(helpText[0]).toHaveClass('help-text');

    // Verify the dropdown button
    expect(formSelectContainer).toHaveAttribute('aria-expanded', 'false');
    expect(formSelectContainer).toHaveAttribute('aria-haspopup', 'listbox');

    // Verify the dropdown value
    const hiddenContainer = screen.getByTestId('hidden-select-container');

    // Locate the <select> element inside the hidden container
    const selectElement = within(hiddenContainer).getByRole('combobox', { hidden: true });

    // Verify the "English" option exists
    const englishOption = within(selectElement).getByText('English');
    expect(englishOption).toBeInTheDocument();

    // Verify the hidden select container
    const hiddenSelect = screen.getByTestId('hidden-select-container');
    expect(hiddenSelect).toBeInTheDocument();
    expect(hiddenSelect).toHaveAttribute('aria-hidden', 'true');

    // Click the button to open dropdown
    const selectButton = screen.getByRole('button', { name: /english/i });
    await userEvent.click(selectButton);

    // Assert that dropdown is open
    expect(selectButton).toHaveAttribute('aria-expanded', 'true');

    // Check for options in the dropdown
    const englishSelection = await screen.findByRole('option', { name: /english/i });
    const portugueseSelection = await screen.findByRole('option', { name: /portuguese/i });
    expect(portugueseSelection).toBeInTheDocument();
    expect(englishSelection).toBeInTheDocument();
  });


  it('should set data back to original when clicking Cancel button', async () => {
    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/givenName/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const firstNameInput = screen.getByLabelText(/givenName/i);
    const lastNameInput = screen.getByLabelText(/surName/i);

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Mary' } });
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Check to have original first name 'John' in document
    expect(screen.getByText('John')).toBeInTheDocument();
  })

  it('should call updateUserProfile with correct data when form is submitted', async () => {
    const mockUpdateUserProfile = jest.fn().mockResolvedValue({
      data: {
        updateUserProfile: {
          success: true,
          message: 'Profile updated successfully',
        },
      },
    });
    mockHook(useUpdateUserProfileMutation).mockReturnValue([
      mockUpdateUserProfile,
      { loading: false, error: undefined },
    ]);

    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/givenName/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    });

    const firstNameInput = screen.getByLabelText(/givenName/i);
    const lastNameInput = screen.getByLabelText(/surName/i);

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();

    // Enter new values for the form fields
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: 'Mary' } });
      fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    });

    const updateButton = screen.getByRole('button', { name: /btnupdate/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Assert that mockUpdateUserProfile was called with the correct data
    expect(mockUpdateUserProfile).toHaveBeenCalledWith({
      variables: {
        input: {
          givenName: 'Mary',
          surName: 'Smith',
          affiliationId: 'test-uri', // Assuming no affiliation was selected
          otherAffiliationName: '', // Assuming no "Other" affiliation was entered
          languageId: 'en', // Assuming no language was selected
        },
      },
    });
  });

  it('should display Loading message when meQuery returns queryLoading', async () => {
    mockHook(useMeQuery).mockReturnValue({ data: mockUserData, loading: true, error: null });
    render(<ProfilePage />);
    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  })

  it('should display error message when updateProfile mutation returns an error', async () => {
    const mockUpdateUserProfile = jest.fn();
    mockHook(useUpdateUserProfileMutation).mockReturnValue([
      mockUpdateUserProfile,
      { loading: false, error: new Error('Error updating profile') },
    ]);

    render(<ProfilePage />);

    // Trigger the Edit button to enable form editing
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Submit the form to trigger the mutation
    const updateButton = screen.getByRole('button', { name: /update/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // Check if the error message is displayed
    const errorMsg = screen.getByText('messages.errors.errorUpdatingProfile');
    expect(errorMsg).toBeInTheDocument();
  })

  it('should display error message when updateProfile mutation returns an ApolloError', async () => {
    const apolloError = new ApolloError({
      graphQLErrors: [{ message: 'Apollo error occurred' }],
      networkError: null,
      errorMessage: 'Apollo error occurred',
    });

    // Make the mutation function throw the ApolloError when called
    const mockUpdateUserProfile = jest.fn().mockRejectedValue(apolloError);

    mockHook(useUpdateUserProfileMutation).mockReturnValue([
      mockUpdateUserProfile,
      { loading: false, error: null }, // Start with no error in the result
    ]);

    render(<ProfilePage />);

    // Trigger the Edit button to enable form editing
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });

    // Submit the form to trigger the mutation
    const updateButton = screen.getByRole('button', { name: /update/i });
    await act(async () => {
      fireEvent.click(updateButton);
    });

    // The form inputs should no lonber be visible
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  })

  it('should pass axe accessibility test', async () => {
    const { container } = render(<ProfilePage />)
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});

