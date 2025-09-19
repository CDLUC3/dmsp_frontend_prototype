import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AccountOverviewPage from '../page';

expect.extend(toHaveNoViolations);

// Mock the components
jest.mock('@/components/PageHeader', () => {
  return function MockPageHeader({ title, description }: { title: string; description?: string }) {
    return (
      <div data-testid="page-header">
        {title}
        {description && <div data-testid="page-description">{description}</div>}
      </div>
    );
  };
});

jest.mock('@/components/PageLinkCard', () => {
  return function MockPageLinkCard() {
    return <div data-testid="page-link-card">PageLinkCard Component</div>;
  };
});

jest.mock('@/components/Container', () => ({
  ContentContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="content-container" className={className}>
      {children}
    </div>
  ),
  LayoutWithPanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout-with-panel">{children}</div>
  ),
  SidebarPanel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-panel" className={className}>
      {children}
    </div>
  ),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('AccountOverviewPage', () => {
  it('renders the account page with correct title and description', () => {
    render(<AccountOverviewPage />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument();
  });

  it('renders the page header component', () => {
    render(<AccountOverviewPage />);
    
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('renders the page link card component', () => {
    render(<AccountOverviewPage />);
    
    expect(screen.getByTestId('page-link-card')).toBeInTheDocument();
  });

  it('renders the layout components', () => {
    render(<AccountOverviewPage />);
    
    expect(screen.getByTestId('layout-with-panel')).toBeInTheDocument();
    expect(screen.getByTestId('content-container')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument();
  });

  it('should not have any accessibility violations', async () => {
    const { container } = render(<AccountOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
