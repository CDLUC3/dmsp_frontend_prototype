import {render, screen} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import VerificationFailed from '../page';

expect.extend(toHaveNoViolations);

describe('VerificationFailed', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  })
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render the component with heading and paragraph', () => {
    render(<VerificationFailed />);

    // Check if the title and text are rendered
    expect(screen.getByRole('heading', { name: /verification failed/i })).toBeInTheDocument();
    expect(screen.getByText(/you.*email verification failed\./i)).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    let container: HTMLElement;

    const renderResult = render(<VerificationFailed />);
    container = renderResult.container;

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  })
});
