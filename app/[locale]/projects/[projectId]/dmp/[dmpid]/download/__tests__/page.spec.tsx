import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectsProjectPlanDownloadPage from '../page';

// Currently, this page is just a static page. This unit test will be updated
// when the page is implemented with functionality.
describe('ProjectsProjectPlanDownloadPage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
  });

  it('should render the page header with the correct title and description', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    expect(screen.getByText('Download a plan')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You can download your Data Management Plan (DMP) in any of the formats listed below.'
      )
    ).toBeInTheDocument();
  });

  it('should render file format options and allows selection', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    const pdfOption = screen.getByLabelText('PDF');
    const docOption = screen.getByLabelText('DOC');

    expect(pdfOption).toBeInTheDocument();
    expect(docOption).toBeInTheDocument();

    fireEvent.click(docOption);
    expect(docOption).toBeChecked();
  });

  it('should render settings checkboxes', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    const checkboxes = [
      { label: 'Include a project details coversheet', checked: false },
      { label: 'Include the section headings', checked: true },
      { label: 'Include the question text', checked: true },
      { label: 'Include any unanswered questions', checked: false },
      { label: 'Remove HTML tags', checked: false },
    ];

    checkboxes.forEach(({ label, checked }) => {
      const checkboxLabel = screen.getByText(label);
      expect(checkboxLabel).toBeInTheDocument();

      // Query the input element within the label
      const checkboxInput = checkboxLabel.closest('label')?.querySelector('input') as HTMLInputElement;
      expect(checkboxInput).toBeInTheDocument();
      expect(checkboxInput.checked).toBe(checked);

      fireEvent.click(checkboxInput);
      expect(checkboxInput.checked).toBe(!checked);
    });
  });

  it('should render PDF-specific formatting options when PDF is selected', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    const pdfOption = screen.getByLabelText('PDF');
    fireEvent.click(pdfOption);

    expect(screen.getByText('Formatting options (PDF only)')).toBeInTheDocument();
    expect(screen.getByLabelText('Font')).toBeInTheDocument();
    expect(screen.getByLabelText('Font size')).toBeInTheDocument();
    expect(screen.getByLabelText('Top margin')).toBeInTheDocument();
  });

  it('should render the download button with the correct file name and format', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    const downloadButton = screen.getByRole('button', { name: /Download PDF/i });

    expect(downloadButton).toBeInTheDocument();
    expect(screen.getByText(/Download "Coastal Ocean Processes of North Greenland DMP.pdf"/i)).toBeInTheDocument();
  });

  it('should update the file name and format in the download section when format changes', () => {
    render(<ProjectsProjectPlanDownloadPage />);
    const docOption = screen.getByLabelText('DOC');
    fireEvent.click(docOption);

    expect(screen.getByText(/Download "Coastal Ocean Processes of North Greenland DMP.doc"/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download DOC/i })).toBeInTheDocument();
  });
});
