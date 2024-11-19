import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

import ConnectionsPage from '../page';

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

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Connections')

    const heading4Elements = screen.getAllByRole('heading', { level: 2 });
    expect(heading4Elements.length).toBe(3);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
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