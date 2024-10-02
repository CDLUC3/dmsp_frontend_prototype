import React from 'react';
import { render, screen } from '@testing-library/react';
import ConnectionsPage from '../page';

describe('Connections page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it('should render connections page', async () => {

    render(<ConnectionsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Connections')

    const heading4Elements = screen.getAllByRole('heading', { level: 4 });
    expect(heading4Elements.length).toBe(2);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });
})