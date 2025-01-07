import React from 'react';
import {act, fireEvent, render, screen, within} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';
import ProfilePage from '../page';
import {
  useLanguagesQuery,
  useMeQuery,
  useUpdateUserProfileMutation
} from '@/generated/graphql';

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

jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(() => '/about'),
}));

jest.mock('@/components/PageHeader');


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
  languages: [{ id: 'en', name: 'English', isDefault: true }],
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
    window.scrollTo = jest.fn(); // Called by the wrapping PageWrapper
    const mockUpdateUserProfile = jest.fn();
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
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();

    // Wrap state-changing interactions in act()
    await act(async () => {
      // Locate the Edit button and click it
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);

    // Confirm that clicking "Edit" reveals the form input fields
    expect(firstNameInput).toBeInTheDocument();
    expect(lastNameInput).toBeInTheDocument();

    // Enter an invalid value for first name field
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: '' } });
    });

    const submitButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(submitButton);

    // Check if error message is present when fields empty
    const errorMessage = await screen.findByText(/name must be at least 2 characters/i);
    expect(errorMessage).toBeInTheDocument();
  })

  it('should set data back to original when clicking Cancel button', async () => {
    render(<ProfilePage />);

    // Confirm that "FormInput" fields are initially hidden
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();

    // Locate the Edit button and click it
    const editButton = screen.getByRole('button', { name: /edit/i });

    await act(async () => {
      fireEvent.click(editButton);
    })

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);

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

  it('should load languages', async () => {
    render(<ProfilePage />);

    await act(async () => {
      // Locate the Edit button and click it
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
    });

    const hiddenContainer = screen.getByTestId('hidden-select-container');
    const select = within(hiddenContainer).getByDisplayValue('English');
    expect(select).toBeInTheDocument();
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
