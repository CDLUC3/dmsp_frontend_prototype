import React, { ReactNode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ConnectionsPage from '../page';

expect.extend(toHaveNoViolations);

jest.mock('@/components/PageHeader', () => {
  const mockPageHeader = jest.fn(({ children }: { children: ReactNode, title: string }) => (
    <div data-testid="mock-page-wrapper">{children}</div>
  ));
  return {
    __esModule: true,
    default: mockPageHeader
  }
});
jest.mock('next-intl', () => {
  const t = (key: string) => key;
  t.markup = (key: string, values: Record<string, (chunks: string) => string>) => {
    // Simulate interpolation of the `link` function
    const chunks = key; // Simplified, in real case you'd simulate how the lib works
    const interpolated = Object.entries(values).reduce((acc, [name, fn]) => {
      return acc.replace(`{${name}}`, fn(chunks));
    }, key);
    return interpolated;
  };
  return {
    useTranslations: jest.fn(() => t)
  };
});

describe('Connections page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it('should render connections page', async () => {

    await act(async () => {
      render(
        <ConnectionsPage />

      );
    });

    const heading4Elements = screen.getAllByRole('heading', { level: 2 });
    expect(heading4Elements.length).toBe(3);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('should pass axe accessibility test', async () => {
    let container: HTMLElement;
    await act(async () => {
      const renderResult = render(

        <ConnectionsPage />

      );
      container = renderResult.container;
    });

    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  })
})
