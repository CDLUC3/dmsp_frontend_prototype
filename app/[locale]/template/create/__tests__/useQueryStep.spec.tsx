import { renderHook } from '@testing-library/react';
import { useQueryStep } from '../useQueryStep';
import * as nextNavigation from 'next/navigation';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

describe('useQueryStep', () => {
  it('should return the step as an integer when "step" query param exists', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'step' ? '3' : null),
    });

    const { result } = renderHook(() => useQueryStep());
    expect(result.current).toBe(3);
  });

  it('should return 1 when "step" query param does not exist', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    const { result } = renderHook(() => useQueryStep());
    expect(result.current).toBe(1);
  });

  it('should return 1 when "step" query param is not a valid number', () => {
    (nextNavigation.useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => (key === 'step' ? 'invalid' : null),
    });

    const { result } = renderHook(() => useQueryStep());
    expect(result.current).toBe(1);
  });
});
