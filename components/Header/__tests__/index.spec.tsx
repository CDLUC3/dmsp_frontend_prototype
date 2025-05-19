import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../index';
import '@testing-library/jest-dom';
import { useAuthContext } from '@/context/AuthContext';
import { useCsrf } from '@/context/CsrfContext';

jest.mock('@/context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('@/context/CsrfContext', () => ({
  useCsrf: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/i18n/routing', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: jest.fn(() => '/'),
}));

jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en-US'),
  useTranslations: jest.fn(() => (key: string) => key),
}));

// Mock Apollo Client and gql
jest.mock('@apollo/client', () => ({
  gql: jest.fn(),
  useMutation: jest.fn(() => [jest.fn(), {}]),
  useQuery: jest.fn(() => ({ data: {}, loading: false, error: null })),
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: string }) => (
    <span data-testid="font-awesome-icon">{icon}</span>
  ),
}));


// Header component will be updated, so put in minimal tests for now
describe('Header', () => {
  beforeEach(() => {
    (useAuthContext as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      setIsAuthenticated: jest.fn(),
    });
    (useCsrf as jest.Mock).mockReturnValue({
      csrfToken: 'mock-csrf-token',
    });
  });

  it('should render the header with the logo and navigation links', () => {
    render(<Header />);

    // Check for the logo
    expect(screen.getByAltText('DMP Tool')).toBeInTheDocument();

    // Check for navigation links
    const menuDashboard = screen.getAllByText('menuDashboard');
    const menuUpload = screen.getAllByText('menuUpload');
    const menuCreatePlan = screen.getAllByText('menuCreatePlan');
    const menuPublicPlans = screen.getAllByText('menuPublicPlans');
    const menuFunderRequirements = screen.getAllByText('menuFunderRequirements');
    expect(menuDashboard.length).toBe(2); // Check for both desktop and mobile
    expect(menuUpload.length).toBe(2); // Check for both desktop and mobile
    expect(menuCreatePlan.length).toBe(2); // Check for both desktop and mobile
    expect(menuPublicPlans.length).toBe(2); // Check for both desktop and mobile
    expect(menuFunderRequirements.length).toBe(2); // Check for both desktop and mobile
  });

  it('should handle mobile menu toggle', () => {

    // Simulate a mobile width
    window.innerWidth = 375; // e.g., iPhone size
    window.dispatchEvent(new Event('resize'));

    render(<Header />);

    const mobileMenuButton = screen.getByAltText('Mobile Menu');
    fireEvent.click(mobileMenuButton);

    const closeButton = screen.getByAltText('Close Mobile Menu');
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    // Should hide the menu
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

});
