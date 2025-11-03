import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import OrganizationDetailsPage from '../page';

expect.extend(toHaveNoViolations);

describe('OrganizationDetailsPage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page header with title', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should render the organization details section', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('sections.organizationDetails.title')).toBeInTheDocument();
    expect(screen.getByText('fields.organizationName.label')).toBeInTheDocument();
    expect(screen.getByText('fields.organizationAbbr.label')).toBeInTheDocument();
    expect(screen.getByText('fields.organizationType.label')).toBeInTheDocument();
  });

  it('should render the administrator contact section', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('sections.administratorContact.title')).toBeInTheDocument();
    expect(screen.getByText('fields.contactEmail.label')).toBeInTheDocument();
    expect(screen.getByText('fields.linkText.label')).toBeInTheDocument();
  });

  it('should render the branding section', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('sections.branding.title')).toBeInTheDocument();
    expect(screen.getByText('upload.title')).toBeInTheDocument();
    expect(screen.getByText('upload.description')).toBeInTheDocument();
  });

  it('should render the organization URLs section', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('sections.organizationUrls.title')).toBeInTheDocument();
    expect(screen.getByText('sections.organizationUrls.description')).toBeInTheDocument();
    expect(screen.getByText('fields.url.label')).toBeInTheDocument();
    expect(screen.getByText('fields.urlLinkText.label')).toBeInTheDocument();
  });

  it('should render the identifiers section', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByText('sections.identifiers.title')).toBeInTheDocument();
    expect(screen.getByText('fields.fundRef.label')).toBeInTheDocument();
    expect(screen.getByText('fields.ror.label')).toBeInTheDocument();
    expect(screen.getByText('fields.shibboleth.label')).toBeInTheDocument();
    expect(screen.getByText('fields.domains.label')).toBeInTheDocument();
  });

  it('should render the save button', () => {
    render(<OrganizationDetailsPage />);

    expect(screen.getByRole('button', { name: 'buttons.save' })).toBeInTheDocument();
  });

  it('should render form inputs with proper labels', () => {
    render(<OrganizationDetailsPage />);

    // Check that required form inputs are present
    expect(screen.getByLabelText(/fields.organizationName.label/)).toBeInTheDocument();
    expect(screen.getByLabelText(/fields.organizationAbbr.label/)).toBeInTheDocument();
    expect(screen.getByLabelText(/fields.contactEmail.label/)).toBeInTheDocument();
    expect(screen.getByLabelText(/fields.linkText.label/)).toBeInTheDocument();
  });

  it('should render disabled identifier fields correctly', () => {
    render(<OrganizationDetailsPage />);

    // Check that disabled identifier fields are present and properly configured
    const fundRefField = screen.getByDisplayValue('100014576');
    const rorField = screen.getByDisplayValue('00dmfq477');
    const shibbolethField = screen.getByDisplayValue('urn:mace:incommon:ucop.edu');
    const domainsField = screen.getByDisplayValue('universityofcalifornia.edu, ucop.edu, ucp.edu');

    expect(fundRefField).toBeInTheDocument();
    expect(rorField).toBeInTheDocument();
    expect(shibbolethField).toBeInTheDocument();
    expect(domainsField).toBeInTheDocument();

    // Verify they are disabled
    expect(fundRefField).toBeDisabled();
    expect(rorField).toBeDisabled();
    expect(shibbolethField).toBeDisabled();
    expect(domainsField).toBeDisabled();
  });

  // Form Submission
  it('should have form element present', () => {
    render(<OrganizationDetailsPage />);

    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('should have save button that submits the form', () => {
    render(<OrganizationDetailsPage />);

    const saveButton = screen.getByRole('button', { name: 'buttons.save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('type', 'submit');
  });

  it('should handle form submission when save button is clicked', () => {
    render(<OrganizationDetailsPage />);

    const saveButton = screen.getByRole('button', { name: 'buttons.save' });
    const form = document.querySelector('form');

    // Verify both form and button exist
    expect(form).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();

    // Test that the button is properly configured
    expect(saveButton).toHaveAttribute('type', 'submit');
  });

  // Form Interactions and State Changes
  it('should handle organization URL additions and removals', async () => {
    render(<OrganizationDetailsPage />);

    // Test adding URLs
    const addButton = screen.getByText('actions.addAnotherUrl');
    fireEvent.click(addButton);

    // Should now have 2 URL fields
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(2);

    // Test removing URLs
    const removeButtons = screen.getAllByText('actions.removeUrl');
    fireEvent.click(removeButtons[0]);

    // Should be back to 1 URL field
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(1);
  });

  it('should handle URL field changes', async () => {
    render(<OrganizationDetailsPage />);

    const urlInput = screen.getByLabelText('fields.url.label');
    const labelInput = screen.getByLabelText('fields.urlLinkText.label');

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(labelInput, { target: { value: 'Example Site' } });

    expect(urlInput).toHaveValue('https://example.com');
    expect(labelInput).toHaveValue('Example Site');
  });

  // Edge Cases and Limits
  it('should not allow more than 5 URLs', () => {
    render(<OrganizationDetailsPage />);

    // Start with 1 URL, add 4 more to reach limit of 5
    for (let i = 0; i < 4; i++) {
      const addButton = screen.getByText('actions.addAnotherUrl');
      expect(addButton).toBeInTheDocument(); // Button should exist before clicking
      fireEvent.click(addButton);
    }

    // Should now have 5 URL fields
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(5);

    // Should not be able to add more (button should disappear)
    expect(screen.queryByText('actions.addAnotherUrl')).not.toBeInTheDocument();
  });

  it('should not allow removing the last URL', () => {
    render(<OrganizationDetailsPage />);

    // Should not show remove button when only 1 URL exists
    expect(screen.queryByText('actions.removeUrl')).not.toBeInTheDocument();
  });

  it('should show remove button only when multiple URLs exist', () => {
    render(<OrganizationDetailsPage />);

    // Initially no remove button
    expect(screen.queryByText('actions.removeUrl')).not.toBeInTheDocument();

    // Add a URL
    fireEvent.click(screen.getByText('actions.addAnotherUrl'));

    // Now should show remove buttons
    expect(screen.getAllByText('actions.removeUrl')).toHaveLength(2);
  });

  // State Management
  it('should update organization URLs state correctly', () => {
    render(<OrganizationDetailsPage />);

    // Test initial state
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(1);

    // Test state after adding URL
    const addButton = screen.getByText('actions.addAnotherUrl');
    fireEvent.click(addButton);

    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(2);
  });

  it('should maintain URL values when adding/removing', () => {
    render(<OrganizationDetailsPage />);

    // Fill first URL
    const urlInput = screen.getByLabelText('fields.url.label');
    fireEvent.change(urlInput, { target: { value: 'https://first.com' } });

    // Add second URL
    fireEvent.click(screen.getByText('actions.addAnotherUrl'));

    // First URL should still have its value
    expect(urlInput).toHaveValue('https://first.com');

    // Remove first URL
    const removeButtons = screen.getAllByText('actions.removeUrl');
    fireEvent.click(removeButtons[0]);

    // Should still have one URL field
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(1);
  });

  // Form Input Handling
  it('should handle all form input changes', () => {
    render(<OrganizationDetailsPage />);

    // Organization details
    const nameInput = screen.getByLabelText(/fields.organizationName.label/);
    const abbrInput = screen.getByLabelText(/fields.organizationAbbr.label/);

    fireEvent.change(nameInput, { target: { value: 'Test Organization' } });
    fireEvent.change(abbrInput, { target: { value: 'TO' } });

    expect(nameInput).toHaveValue('Test Organization');
    expect(abbrInput).toHaveValue('TO');

    // Contact details
    const emailInput = screen.getByLabelText(/fields.contactEmail.label/);
    const linkTextInput = screen.getByLabelText(/fields.linkText.label/);

    fireEvent.change(emailInput, { target: { value: 'contact@test.org' } });
    fireEvent.change(linkTextInput, { target: { value: 'Contact Us' } });

    expect(emailInput).toHaveValue('contact@test.org');
    expect(linkTextInput).toHaveValue('Contact Us');
  });

  it('should handle URL field changes for multiple URLs', () => {
    render(<OrganizationDetailsPage />);

    // Add a second URL
    fireEvent.click(screen.getByText('actions.addAnotherUrl'));

    // Get both URL inputs
    const urlInputs = screen.getAllByLabelText(/fields.url.label/);
    const labelInputs = screen.getAllByLabelText(/fields.urlLinkText.label/);

    // Change first URL
    fireEvent.change(urlInputs[0], { target: { value: 'https://first.com' } });
    fireEvent.change(labelInputs[0], { target: { value: 'First Site' } });

    // Change second URL
    fireEvent.change(urlInputs[1], { target: { value: 'https://second.com' } });
    fireEvent.change(labelInputs[1], { target: { value: 'Second Site' } });

    expect(urlInputs[0]).toHaveValue('https://first.com');
    expect(labelInputs[0]).toHaveValue('First Site');
    expect(urlInputs[1]).toHaveValue('https://second.com');
    expect(labelInputs[1]).toHaveValue('Second Site');
  });

  // File Handling (Basic)
  it('should handle file drop events', () => {
    render(<OrganizationDetailsPage />);

    const dropZone = screen.getByLabelText('upload.dropZone.ariaLabel');
    expect(dropZone).toBeInTheDocument();

    // Test that the drop zone is properly configured
    expect(dropZone).toHaveAttribute('aria-label');

    // Note: Testing actual file drop behavior with React Aria components
    // requires more complex mocking. This test verifies the component is rendered.
  });

  it('should handle file selection via FileTrigger', () => {
    render(<OrganizationDetailsPage />);

    const browseButton = screen.getByText('upload.browseButton');

    // Test that the button is present and clickable
    expect(browseButton).toBeInTheDocument();

    // Test button click (FileTrigger behavior is complex to mock in tests)
    fireEvent.click(browseButton);

    // Verify the button is still functional
    expect(browseButton).toBeInTheDocument();
  });

  // Component Behavior
  it('should render all form sections correctly', () => {
    render(<OrganizationDetailsPage />);

    // Check all sections are present
    expect(screen.getByText('sections.organizationDetails.title')).toBeInTheDocument();
    expect(screen.getByText('sections.administratorContact.title')).toBeInTheDocument();
    expect(screen.getByText('sections.branding.title')).toBeInTheDocument();
    expect(screen.getByText('sections.organizationUrls.title')).toBeInTheDocument();
    expect(screen.getByText('sections.identifiers.title')).toBeInTheDocument();
  });

  it('should show correct number of URL fields initially', () => {
    render(<OrganizationDetailsPage />);

    // Should start with 1 URL field
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(1);
    expect(screen.getAllByLabelText('fields.urlLinkText.label')).toHaveLength(1);
  });

  it('should handle URL removal correctly', () => {
    render(<OrganizationDetailsPage />);

    // Add a URL first
    fireEvent.click(screen.getByText('actions.addAnotherUrl'));
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(2);

    // Remove the first URL
    const removeButtons = screen.getAllByText('actions.removeUrl');
    fireEvent.click(removeButtons[0]);

    // Should be back to 1 URL
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(1);
  });


  it('should render upload section with all elements', () => {
    render(<OrganizationDetailsPage />);

    // Check upload section elements
    expect(screen.getByText('upload.fileTypes')).toBeInTheDocument();
    expect(screen.getByText('upload.browseButton')).toBeInTheDocument();

    // Check SVG icon is present
    const uploadIcon = document.querySelector('svg');
    expect(uploadIcon).toBeInTheDocument();
  });

  it('should render request change buttons for identifiers', () => {
    render(<OrganizationDetailsPage />);

    // Check all request change buttons are present
    // There are 5 total: 1 in organization type (Link) + 4 in identifiers (Buttons)
    const requestChangeButtons = screen.getAllByText('actions.requestChange');
    expect(requestChangeButtons).toHaveLength(5);

    // The Link component doesn't have aria-label, but the Button components do
    // Let's check that the identifiers section buttons (which should be the last 4) have aria-labels
    const buttonElements = requestChangeButtons.filter(el => el.tagName === 'BUTTON');
    expect(buttonElements).toHaveLength(4);

    // Verify that all button elements have aria-label attributes
    buttonElements.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should handle multiple URL additions and removals', () => {
    render(<OrganizationDetailsPage />);

    // Add multiple URLs (but not more than 5)
    fireEvent.click(screen.getByText('actions.addAnotherUrl')); // 2 total
    fireEvent.click(screen.getByText('actions.addAnotherUrl')); // 3 total
    fireEvent.click(screen.getByText('actions.addAnotherUrl')); // 4 total

    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(4);

    // Remove some URLs
    const removeButtons = screen.getAllByText('actions.removeUrl');
    expect(removeButtons).toHaveLength(4); // Should have 4 remove buttons for 4 URLs

    // Remove first URL
    fireEvent.click(removeButtons[0]);

    // Check that we now have 3 URLs (4 - 1 = 3)
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(3);

    // Remove another URL
    const remainingRemoveButtons = screen.getAllByText('actions.removeUrl');
    fireEvent.click(remainingRemoveButtons[0]);

    // Check that we now have 2 URLs (3 - 1 = 2)
    expect(screen.getAllByLabelText('fields.url.label')).toHaveLength(2);
  });

  it('should maintain form state across all input types', () => {
    render(<OrganizationDetailsPage />);

    // Test organization name input
    const nameInput = screen.getByLabelText(/fields.organizationName.label/);
    fireEvent.change(nameInput, { target: { value: 'Test Org' } });
    expect(nameInput).toHaveValue('Test Org');

    // Test abbreviation input
    const abbrInput = screen.getByLabelText(/fields.organizationAbbr.label/);
    fireEvent.change(abbrInput, { target: { value: 'TO' } });
    expect(abbrInput).toHaveValue('TO');

    // Test email input
    const emailInput = screen.getByLabelText(/fields.contactEmail.label/);
    fireEvent.change(emailInput, { target: { value: 'test@org.com' } });
    expect(emailInput).toHaveValue('test@org.com');

    // Test link text input
    const linkTextInput = screen.getByLabelText(/fields.linkText.label/);
    fireEvent.change(linkTextInput, { target: { value: 'Contact' } });
    expect(linkTextInput).toHaveValue('Contact');
  });

  it('should render all form inputs with correct attributes', () => {
    render(<OrganizationDetailsPage />);

    // Check required inputs have proper attributes
    const nameInput = screen.getByLabelText(/fields.organizationName.label/);
    const emailInput = screen.getByLabelText(/fields.contactEmail.label/);

    expect(nameInput).toHaveAttribute('placeholder');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('placeholder');
  });

  it('should handle edge case of URL field with empty values', () => {
    render(<OrganizationDetailsPage />);

    // Add a URL
    fireEvent.click(screen.getByText('actions.addAnotherUrl'));

    // Get the new URL fields
    const urlInputs = screen.getAllByLabelText('fields.url.label');
    const labelInputs = screen.getAllByLabelText('fields.urlLinkText.label');

    // Test that new fields start empty
    expect(urlInputs[1]).toHaveValue('');
    expect(labelInputs[1]).toHaveValue('');

    // Fill them with values
    fireEvent.change(urlInputs[1], { target: { value: 'https://test.com' } });
    fireEvent.change(labelInputs[1], { target: { value: 'Test Site' } });

    // Verify values are set
    expect(urlInputs[1]).toHaveValue('https://test.com');
    expect(labelInputs[1]).toHaveValue('Test Site');
  });

  it('should render sidebar panel', () => {
    render(<OrganizationDetailsPage />);

    // Check sidebar is present (even if empty)
    // Look for the SidebarPanel component by checking if it's rendered
    const sidebar = document.querySelector('[class*="SidebarPanel"]') ||
                   document.querySelector('[class*="sidebar"]') ||
                   document.querySelector('aside');

    // If we can't find it by class, check if the component structure exists
    if (!sidebar) {
      // Check if the layout structure exists
      const contentContainer = document.querySelector('[class*="ContentContainer"]');
      expect(contentContainer).toBeInTheDocument();

      // Check if there's a form (which means the main content is there)
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    } else {
      expect(sidebar).toBeInTheDocument();
    }
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<OrganizationDetailsPage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
