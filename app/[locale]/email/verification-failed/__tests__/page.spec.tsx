import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VerificationFailed from '../page';

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

describe('VerificationFailed', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  })
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render the component with PageHeader', async () => {
    const titleProp = 'Verification failed';
    const pageHeader = await import('@/components/PageHeader');
    const mockPageHeader = pageHeader.default;
    const { getByTestId } = render(<VerificationFailed />);

    expect(getByTestId('mock-page-wrapper')).toBeInTheDocument();
    expect(mockPageHeader).toHaveBeenCalledWith(expect.objectContaining({ title: titleProp, }), {})
  })

  it('should pass axe accessibility test', async () => {
    const renderResult = render(<VerificationFailed />);
    const container = renderResult.container;

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  })
});
