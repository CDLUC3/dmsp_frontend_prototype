import React, { ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsCreateProjectFunding from '../page';
import { RichTranslationValues } from 'next-intl';

expect.extend(toHaveNoViolations);


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));
type MockUseTranslations = {
  (key: string, ...args: unknown[]): string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
};

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: MockUseTranslations = ((key: string) => key) as MockUseTranslations;

    mockUseTranslations.rich = (key, values) => {
      const p = values?.p;
      if (typeof p === 'function') {
        return p(key); // Can return JSX
      }
      return key; // fallback
    };

    return mockUseTranslations;
  }),
}));


const mockUseRouter = useRouter as jest.Mock;

describe('ProjectsCreateProjectFunding', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    })

    const mockUseParams = useParams as jest.Mock;
    mockUseParams.mockReturnValue({ projectId: '123' });
  });

  it('should render the component', async () => {
    await act(async () => {
      render(
        <ProjectsCreateProjectFunding />
      );
    });

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.home')).toBeInTheDocument();
    expect(screen.getByText('breadcrumbs.projects')).toBeInTheDocument();
    expect(screen.getByText('form.radioFundingLabel')).toBeInTheDocument();
    expect(screen.getByText('form.yesLabel')).toBeInTheDocument();
    expect(screen.getByText('form.noLabel')).toBeInTheDocument();
    expect(screen.getByText('buttons.continue')).toBeInTheDocument();
  });

  it('should handle form submission with "yes" selected', async () => {
    render(<ProjectsCreateProjectFunding />);
    fireEvent.click(screen.getByLabelText('form.yesLabel'));
    fireEvent.click(screen.getByText('buttons.continue'));
    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/123/funding-search');
    })
  });

  it('should handle form submission with "no" selected', async () => {
    render(<ProjectsCreateProjectFunding />);
    fireEvent.click(screen.getByLabelText('form.noLabel'));
    fireEvent.click(screen.getByText('buttons.continue'));
    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/projects/123')
    })
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <ProjectsCreateProjectFunding />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
