import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '../index';

jest.mock('@/i18n/routing', () => ({
  usePathname: jest.fn(() => '/'),
}));

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
    mockLocales.forEach((locale) => {
      expect(screen.getByRole('menuitem', { name: `Switch to ${locale.name} language` })).toBeInTheDocument();
    });
  });

  it('should call updateLanguages when a button is clicked', () => {
    const { container } = render(<LanguageSelector locales={mockLocales} />);
    const buttons = container.querySelectorAll('button');

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Switch to English language');

    fireEvent.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-label', 'Switch to Portuguese language');
  });
});
