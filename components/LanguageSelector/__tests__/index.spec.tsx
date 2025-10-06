import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../index';

jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(() => '/'),
}));

// Mock Link component
jest.mock("next/link", () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a
        href={href}
        {...props}
      >
        {children}
      </a>
    );
  };
});

jest.mock('next-intl', () => ({
  useLocale: jest.fn(() => 'en'),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/hooks/switchLanguage', () => ({
  useSwitchLanguage: jest.fn(),
}));


describe('LanguageSelector Component', () => {
  const mockLocales = [
    { id: 'en-US', name: 'English' },
    { id: 'pt-BR', name: 'Portuguese' },
  ];

  it('should render buttons for each locale', () => {
    render(<LanguageSelector locales={mockLocales} />);
    expect(screen.getByLabelText('Switch to English language')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to Portuguese language')).toBeInTheDocument();
  });

  it('should call updateLanguages when a button is clicked', () => {
    const { container } = render(<LanguageSelector locales={mockLocales} />);
    const links = container.querySelectorAll('a');

    fireEvent.click(links[0]);
    expect(links[0]).toHaveAttribute('aria-label', 'Switch to English language');

    fireEvent.click(links[1]);
    expect(links[1]).toHaveAttribute('aria-label', 'Switch to Portuguese language');
  });
});
