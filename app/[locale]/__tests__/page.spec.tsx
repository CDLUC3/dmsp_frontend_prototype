import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Home from '../page';

expect.extend(toHaveNoViolations);

describe('Home Page', () => {
  it('renders the Home page with heading and PageLinkCard', () => {
    render(<Home />);

    // Check for the heading
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Home Page');

    // Check for the PageLinkCard sections
    expect(screen.getByText('Create & Manage')).toBeInTheDocument();
    expect(screen.getByText('Account & Administration')).toBeInTheDocument();

    // Check for section descriptions
    expect(screen.getByText('Create new templates and projects')).toBeInTheDocument();
    expect(screen.getByText('Manage your account and access admin features')).toBeInTheDocument();

    // Check for all links to be present
    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(4);

   
    expect(screen.getByText('Template Management')).toBeInTheDocument();
    expect(screen.getByText('Project Management')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin Overview')).toBeInTheDocument();


    expect(screen.getByText('Create and manage templates (Must be Admin to access)')).toBeInTheDocument();
    expect(screen.getByText('Create and manage projects')).toBeInTheDocument();
    expect(screen.getByText('View and manage your account')).toBeInTheDocument();
    expect(screen.getByText('Access administrative functions')).toBeInTheDocument();


    const templateManagementLink = screen.getByText('Template Management').closest('a');
    const projectManagementLink = screen.getByText('Project Management').closest('a');
    const accountSettingsLink = screen.getByText('Account Settings').closest('a');
    const adminOverviewLink = screen.getByText('Admin Overview').closest('a');

    expect(templateManagementLink).toHaveAttribute('href', '/en-US/template');
    expect(projectManagementLink).toHaveAttribute('href', '/en-US/projects');
    expect(accountSettingsLink).toHaveAttribute('href', '/en-US/account');
    expect(adminOverviewLink).toHaveAttribute('href', '/en-US/admin');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(<Home />)
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});
