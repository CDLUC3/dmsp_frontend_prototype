import React from 'react';
import { useRouter } from 'next/navigation';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ProjectsCreateProjectFunding from '../page';
import { useTranslations as OriginalUseTranslations } from 'next-intl';

expect.extend(toHaveNoViolations);


jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

type UseTranslationsType = ReturnType<typeof OriginalUseTranslations>;

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: UseTranslationsType = ((key: string) => key) as UseTranslationsType;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
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
      expect(mockUseRouter().push).toHaveBeenCalledWith('/projects/create-project/funding-search')
    })
  });

  it('should handle form submission with "no" selected', async () => {
    render(<ProjectsCreateProjectFunding />);
    fireEvent.click(screen.getByLabelText('form.noLabel'));
    fireEvent.click(screen.getByText('buttons.continue'));
    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/projects/proj_2425new')
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