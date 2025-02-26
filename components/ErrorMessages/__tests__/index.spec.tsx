import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorMessages from '..';
import { scrollToTop } from '@/utils/general';

expect.extend(toHaveNoViolations);

// Mock the scrollToTop function
jest.mock('@/utils/general', () => ({
  scrollToTop: jest.fn(),
}));

describe('ErrorMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render no errors when errors prop is empty', () => {
    const { container } = render(<ErrorMessages errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error messages from an array', async () => {
    const errors = ['Error 1', 'Error 2'];
    await act(async () => {
      render(
        <ErrorMessages errors={errors} />
      );
    });
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('should render error messages from an object', async () => {
    const errors = {
      error1: 'Error 1',
      error2: 'Error 2',
    };
    await act(async () => {
      render(
        <ErrorMessages errors={errors} />
      );
    });
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('should call scrollToTop when errors are present', async () => {
    const errors = ['Error 1'];
    const ref = { current: document.createElement('div') };
    await act(async () => {
      render(
        <ErrorMessages errors={errors} ref={ref} />
      );
    });
    expect(scrollToTop).toHaveBeenCalledWith(ref);
  });

  it('should not call scrollToTop when no errors are present', async () => {
    const ref = { current: document.createElement('div') };
    await act(async () => {
      render(
        <ErrorMessages errors={[]} ref={ref} />
      );
    });
    expect(scrollToTop).not.toHaveBeenCalled();
  });

  it('should pass accessibility tests', async () => {
    const errors = ['Error 1'];
    const ref = { current: document.createElement('div') };
    const { container } = render(<ErrorMessages errors={errors} ref={ref} />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});