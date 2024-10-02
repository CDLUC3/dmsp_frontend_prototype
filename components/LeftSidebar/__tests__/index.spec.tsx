import React from 'react';
import { render, screen } from '@testing-library/react';
import LeftSidebar from '..';
import { usePathname } from 'next/navigation';

// Mock the usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('LeftSidebar component', () => {
  const renderComponent = (pathname: string) => {
    // Mock the return value of usePathname based on the test case
    (usePathname as jest.Mock).mockReturnValue(pathname);

    // Render the LeftSidebar component
    render(<LeftSidebar />);
  };

  it('should render the "Account" section title', () => {
    renderComponent('/account/profile');
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('should highlight "Your Profile" when the pathname is /account/profile', () => {
    renderComponent('/account/profile');
    expect(screen.getByText('Your Profile')).toHaveClass('emphasis');
  });

  it('should highlight "Password" when the pathname is /account/password', () => {
    renderComponent('/account/password');
    expect(screen.getByText('Password')).toHaveClass('emphasis');
  });

  it('should highlight "Connections" when the pathname is /account/connections', () => {
    renderComponent('/account/connections');
    expect(screen.getByText('Connections')).toHaveClass('emphasis');
  });

  it('should highlight "Notifications" when the pathname is /account/notifications', () => {
    renderComponent('/account/notifications');
    expect(screen.getByText('Notifications')).toHaveClass('emphasis');
  });

  it('should highlight "Developer Tools" when the pathname is /account/developerTools', () => {
    renderComponent('/account/developerTools');
    expect(screen.getByText('Developer Tools')).toHaveClass('emphasis');
  });

  it('should not apply "emphasis" class to any item if pathname does not match any route', () => {
    renderComponent('/account/other');
    expect(screen.getByText('Your Profile')).not.toHaveClass('emphasis');
    expect(screen.getByText('Password')).not.toHaveClass('emphasis');
    expect(screen.getByText('Connections')).not.toHaveClass('emphasis');
    expect(screen.getByText('Notifications')).not.toHaveClass('emphasis');
    expect(screen.getByText('Developer Tools')).not.toHaveClass('emphasis');
  });
});