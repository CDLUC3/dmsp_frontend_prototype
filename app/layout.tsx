import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import '@fortawesome/fontawesome-svg-core/styles.css'
import Header from "@/components/Header";
import Footer from "@/components/footer";
import { ApolloWrapper } from "@/lib/graphql/apollo-wrapper";

import "./globals.scss";


const poppins_init = Poppins({
  subsets: ["latin"],
  weight: ['500', '600'],
  variable: '--font-poppins',
});
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={poppins_init.className}>
        <a href="#maincontent" className="c-skipnav dmpui-skipnav">Skip to main content</a>
        <Header />
        <div id="App">
          <main id="maincontent"><ApolloWrapper>{children}</ApolloWrapper></main>
        </div>
        <Footer />
      </body>
    </html>
  );
}