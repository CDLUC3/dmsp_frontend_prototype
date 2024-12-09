import React, {ReactNode} from 'react';
import {act, render, screen, waitFor} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
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


describe('Connections page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it('should render the component with PageHeader', async () => {
    const titleProp = 'Connections';
    const pageHeader = await import('@/components/PageHeader');
    const mockPageHeader = pageHeader.default;
    const { getByTestId } = render(<ConnectionsPage />);

    expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
    expect(mockPageHeader).toHaveBeenCalledWith(expect.objectContaining({ title: titleProp, }), {})
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
