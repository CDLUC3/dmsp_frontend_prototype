import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import TemplateSelectTemplatePage from '../page';

expect.extend(toHaveNoViolations);

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

describe('TemplateSelectTemplatePage', () => {
  it('renders the main content sections', () => {
    render(<TemplateSelectTemplatePage />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('Template search')).toBeInTheDocument();

    expect(screen.getByRole('list', { name: 'Your templates' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Public templates' })).toBeInTheDocument();
  });

  it('renders NSF templates', () => {
    render(<TemplateSelectTemplatePage />);
    expect(screen.getByText('Arctic Data Center: NSF Polar Programs')).toBeInTheDocument();
    expect(screen.getByText('NSF Polar Expeditions')).toBeInTheDocument();
  });

  it('renders public templates', () => {
    render(<TemplateSelectTemplatePage />);
    expect(screen.getByText('General Research DMP')).toBeInTheDocument();
    expect(screen.getByText('Humanities Research DMP')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateSelectTemplatePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
