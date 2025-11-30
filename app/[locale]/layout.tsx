import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ToastProviderWrapper } from '@/context/ToastContext';

// Components
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubHeader from "@/components/SubHeader";

import { ApolloWrapper } from "@/lib/graphql/apollo-wrapper";
import { AuthProvider } from "@/context/AuthContext";
import { CsrfProvider } from "@/context/CsrfContext";

//Styles
import '@fortawesome/fontawesome-svg-core/styles.css'
import "@/styles/globals.scss";

const font_sans_serif = Poppins({
  subsets: ["latin"],
  weight: ['400', '600'],
  variable: '--font-sans-serif',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Wrap params in a Promise to match the expected type
}) {
  const resolvedParams = await params; // Resolve the promise to access the locale
  const { locale } = resolvedParams;

  // Ensure that the incoming `locale` is valid
  /*eslint-disable @typescript-eslint/no-explicit-any */
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={font_sans_serif.variable}>
      <head></head>
      <body className={font_sans_serif.className}>
        <a href="#mainContent" className="skip-nav">Skip to main content</a>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CsrfProvider>
              <ApolloWrapper>
                <Header />
                <SubHeader />
                <ToastProviderWrapper>
                  <div id="App">
                    {children}
                  </div>
                </ToastProviderWrapper>
                <Footer />
              </ApolloWrapper>
            </CsrfProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
