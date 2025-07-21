import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import BackButton from '../index';
import { useRouter } from 'next/navigation';
expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('BackButton', () => {
  const mockRouter = { back: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render the back button with correct text and icon', () => {
    render(<BackButton />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('should call router.back when the button is clicked', () => {
    render(<BackButton />);
    const button = screen.getByRole('button', { name: /back/i });
    fireEvent.click(button);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <BackButton />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
