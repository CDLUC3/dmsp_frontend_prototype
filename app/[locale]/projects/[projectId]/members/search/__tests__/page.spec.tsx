import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import '@testing-library/jest-dom';
import { useParams, useRouter } from 'next/navigation';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

import ProjectsProjectMembersSearch from '../page';
import { useCollaboratorSearch } from '../hooks/useCollaboratorSearch';
import { useProjectMemberForm } from '../hooks/useProjectMemberForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock the custom hooks
jest.mock('../hooks/useCollaboratorSearch');
jest.mock('../hooks/useProjectMemberForm');

// Mock react-aria-components Form to avoid requestSubmit issues
jest.mock('react-aria-components', () => ({
  ...jest.requireActual('react-aria-components'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any  
  Form: ({ children, onSubmit, ...props }: any) => (
    < form {...props} onSubmit={(e) => {
      e.preventDefault();
      if (onSubmit) onSubmit(e);
    }}>
      {children}
    </form >
  ),
}));

// Mock data
const mockCollaboratorResult = {
  id: 1,
  givenName: 'John',
  surName: 'Doe',
  email: 'john.doe@example.com',
  orcid: '0000-0000-0000-0001',
  affiliationName: 'Test University',
  affiliationId: 'test-uni-id',
};

const mockMemberRoles = [
  { id: 1, label: 'Principal Investigator', displayOrder: 1, uri: 'http://credit.niso.org/test1/' },
  { id: 2, label: 'Co-Investigator', displayOrder: 2, uri: 'http://credit.niso.org/test2/' },
];

describe('ProjectsProjectMembersSearch Integration Tests', () => {
  const mockUseCollaboratorSearch = useCollaboratorSearch as jest.MockedFunction<typeof useCollaboratorSearch>;
  const mockUseProjectMemberForm = useProjectMemberForm as jest.MockedFunction<typeof useProjectMemberForm>;

  const defaultCollaboratorSearch = {
    term: '',
    results: [],
    isSearching: false,
    loading: false,
    errors: [],
    setSearchTerm: jest.fn(),
    handleMemberSearch: jest.fn(),
    clearSearch: jest.fn(),
  };

  const defaultProjectMemberForm = {
    projectMember: {
      givenName: '',
      surName: '',
      email: '',
      orcid: '',
      affiliationName: '',
      affiliationId: '',
      otherAffiliationName: '',
    },
    setProjectMember: jest.fn(),
    roles: [],
    memberRoles: mockMemberRoles,
    errors: [],
    fieldErrors: {
      givenName: '',
      surName: '',
      affiliationId: '',
      affiliationName: '',
      email: '',
      projectRoles: '',
    },
    handleCheckboxChange: jest.fn(),
    handleFormSubmit: jest.fn(),
    resetErrors: jest.fn(),
    updateAffiliationFormData: jest.fn(),
    clearAllFieldErrors: jest.fn(),
    clearAllFormFields: jest.fn(),
    setErrors: jest.fn(),
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ projectId: '123' });
    (useRouter as jest.Mock).mockReturnValue({
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUseCollaboratorSearch.mockReturnValue(defaultCollaboratorSearch);
    mockUseProjectMemberForm.mockReturnValue(defaultProjectMemberForm);

    // Mock DOM methods
    window.scrollTo = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Integration', () => {
    it('should render main sections and integrates hooks properly', () => {
      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      // Verify main sections are rendered
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // Page title
      expect(screen.getByRole('search')).toBeInTheDocument();

      // Verify form fields are rendered with initial values
      expect(screen.getByRole('textbox', { name: /labels\.givenName/ })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /labels\.surName/ })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /labels\.email/ })).toBeInTheDocument();
    });

    it('should handle search input and calls hook methods correctly', () => {
      const mockSetSearchTerm = jest.fn();
      const mockResetErrors = jest.fn();
      const mockClearAllFormFields = jest.fn();

      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        setSearchTerm: mockSetSearchTerm,
      });

      mockUseProjectMemberForm.mockReturnValue({
        ...defaultProjectMemberForm,
        resetErrors: mockResetErrors,
        clearAllFormFields: mockClearAllFormFields,
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'john doe' } });

      expect(mockSetSearchTerm).toHaveBeenCalledWith('john doe');
      expect(mockResetErrors).toHaveBeenCalled();
      expect(mockClearAllFormFields).toHaveBeenCalled();
    });

    it('should display search results when available', () => {
      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        isSearching: true,
        results: [mockCollaboratorResult],
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Test University')).toBeInTheDocument();
      expect(screen.getByText('0000-0000-0000-0001')).toBeInTheDocument();
      expect(screen.getByTestId('orcidIconSvg')).toBeInTheDocument();
    });

    it('should handle search result selection and populates form', () => {
      const mockSetProjectMember = jest.fn();
      const mockResetErrors = jest.fn();

      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        isSearching: true,
        results: [mockCollaboratorResult],
      });

      mockUseProjectMemberForm.mockReturnValue({
        ...defaultProjectMemberForm,
        setProjectMember: mockSetProjectMember,
        resetErrors: mockResetErrors,
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      const searchResult = screen.getByTestId('result-0');
      fireEvent.click(searchResult);

      expect(mockSetProjectMember).toHaveBeenCalledWith({
        givenName: 'John',
        surName: 'Doe',
        email: 'john.doe@example.com',
        orcid: '0000-0000-0000-0001',
        affiliationName: 'Test University',
        affiliationId: 'test-uni-id',
        otherAffiliationName: '',
      });
      expect(mockResetErrors).toHaveBeenCalled();
    });

    it('should show loading state during search', () => {
      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        isSearching: true,
        loading: true,
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('messaging.loading')).toBeInTheDocument();
    });

    it('should display errors from both hooks', () => {
      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        errors: ['Search failed'],
      });

      mockUseProjectMemberForm.mockReturnValue({
        ...defaultProjectMemberForm,
        errors: ['Form error'],
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      expect(screen.getByText('Search failed')).toBeInTheDocument();
      expect(screen.getByText('Form error')).toBeInTheDocument();
    });

    it('should handle form submission', () => {
      const mockHandleFormSubmit = jest.fn();

      mockUseProjectMemberForm.mockReturnValue({
        ...defaultProjectMemberForm,
        handleFormSubmit: mockHandleFormSubmit,
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      const submitButton = screen.getByRole('button', { name: /buttons.addToProject/ });
      fireEvent.click(submitButton);

      expect(mockHandleFormSubmit).toHaveBeenCalled();
    });

    it('should auto-populate form when search results change', () => {
      const mockSetProjectMember = jest.fn();

      mockUseCollaboratorSearch.mockReturnValue({
        ...defaultCollaboratorSearch,
        results: [mockCollaboratorResult],
      });

      mockUseProjectMemberForm.mockReturnValue({
        ...defaultProjectMemberForm,
        setProjectMember: mockSetProjectMember,
      });

      render(
        <MockedProvider>
          <ProjectsProjectMembersSearch />
        </MockedProvider>
      );

      // The useEffect should trigger auto-population
      expect(mockSetProjectMember).toHaveBeenCalledWith({
        givenName: 'John',
        surName: 'Doe',
        email: 'john.doe@example.com',
        orcid: '0000-0000-0000-0001',
        affiliationName: 'Test University',
        affiliationId: 'test-uni-id',
        otherAffiliationName: '',
      });
    });
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(
      <MockedProvider>
        <ProjectsProjectMembersSearch />
      </MockedProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});