import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AdminOverviewPage from '../page';

expect.extend(toHaveNoViolations);

// Mock the components and hooks
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

describe('AdminOverviewPage', () => {
  it('renders the admin page with header', () => {
    render(<AdminOverviewPage />);
    
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders the organization description in PageHeader', () => {
    render(<AdminOverviewPage />);
    
    expect(screen.getByTestId('page-description')).toBeInTheDocument();
    expect(screen.getByText('University of California, Office of the President (UCOP)')).toBeInTheDocument();
  });

  it('renders the PageLinkCard component', () => {
    render(<AdminOverviewPage />);
    
    expect(screen.getByTestId('page-link-card')).toBeInTheDocument();
  });

  it('renders the layout components', () => {
    render(<AdminOverviewPage />);
    
    expect(screen.getByTestId('layout-with-panel')).toBeInTheDocument();
    expect(screen.getByTestId('content-container')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(<AdminOverviewPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
