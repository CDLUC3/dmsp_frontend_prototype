import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@fortawesome/fontawesome-svg-core/styles.css'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubHeader from "@/components/SubHeader";
import { ApolloWrapper } from "@/lib/graphql/apollo-wrapper";
import { AuthProvider } from "@/context/AuthContext";
import { CsrfProvider } from "@/context/CsrfContext";
import "@/styles/globals.scss";

const inter_init = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const poppins_init = Poppins({
  subsets: ["latin"],
  weight: ['400', '600'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "DMP",
  description: "Generated by create next app",
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  // Ensure that the incoming `locale` is valid
  /*eslint-disable @typescript-eslint/no-explicit-any */
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className={[poppins_init.className, inter_init.className].join(' ')}>
        <a href="#mainContent" className="skip-nav">Skip to main content</a>

        <AuthProvider>
          <CsrfProvider>
            <NextIntlClientProvider messages={messages}>
              <Header />
              <SubHeader />

              <div id="App">
                <ApolloWrapper>

                  {children}

                </ApolloWrapper>
              </div>

              <Footer />
            </NextIntlClientProvider>
          </CsrfProvider>
        </AuthProvider>

      </body>
    </html>
  );
}