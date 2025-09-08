/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LocaleLayout from '@/app/[locale]/layout';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation'; // Replace require with import

// Mock next-intl/middleware BEFORE importing middleware
jest.mock('next-intl/middleware', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn(() => null)), // Return a function that returns null
}));

// Mock the routing configuration
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en-US', 'pt-BR'],
    defaultLocale: 'en-US',
  },
}));

// Mock the config
jest.mock('@/config/i18nConfig', () => ({
  locales: ['en-US', 'pt-BR'],
  defaultLocale: 'en-US',
}));


// Mocks
jest.mock('next-intl/server', () => ({
  getMessages: jest.fn().mockResolvedValue({}),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/components/Header', () => {
  const MockHeader = () => <div>Mock Header</div>;
  MockHeader.displayName = 'MockHeader';
  return MockHeader;
});
jest.mock('@/components/Footer', () => {
  const MockFooter = () => <div>Mock Footer</div>;
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});
jest.mock('@/components/SubHeader', () => {
  const MockSubHeader = () => <div>Mock SubHeader</div>;
  MockSubHeader.displayName = 'MockSubHeader';
  return MockSubHeader;
});

jest.mock('@/lib/graphql/apollo-wrapper', () => ({
  ApolloWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/context/CsrfContext', () => ({
  CsrfProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/context/ToastContext', () => ({
  ToastProviderWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LocaleLayout', () => {
  it('renders layout with valid locale', async () => {
    const TestComponent = await LocaleLayout({
      children: <>Main Content</>,
      params: Promise.resolve({ locale: routing.locales[0] }), // Wrap params in a Promise
    });

    const htmlChildren = TestComponent?.props?.children;

    // Extract children to test, since <html>, <head> and <body> tags are invalid to render inside React Testing Library's test
    //const bodyContent = (TestComponent as any).props.children.props.children;
    const bodyNode = Array.isArray(htmlChildren)
      /* eslint-disable @typescript-eslint/no-explicit-any*/
      ? htmlChildren.find((el: any) => el?.type === 'body')
      : null;

    if (!bodyNode) {
      throw new Error('<body> not found in LocaleLayout output');
    }

    const bodyContent = bodyNode.props?.children;

    render(<>{bodyContent}</>);

    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
  });

  it('calls notFound() on invalid locale', async () => {
    const invalidLocale = 'xx';

    await LocaleLayout({
      children: <div>Main Content</div>,
      params: Promise.resolve({ locale: invalidLocale }), // Wrap params in a Promise
    });

    expect(notFound).toHaveBeenCalled();
  });
});
