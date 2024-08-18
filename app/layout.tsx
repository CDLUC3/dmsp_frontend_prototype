import type {Metadata} from "next";
import {Inter, Poppins} from "next/font/google";
import '@fortawesome/fontawesome-svg-core/styles.css'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubHeader from "@/components/SubHeader";
import {ApolloWrapper} from "@/lib/graphql/apollo-wrapper";
import {AuthProvider} from "@/context/AuthContext";
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

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
    <body className={[poppins_init.className, inter_init.className].join(' ')}>

    <a href="#mainContent" className="skip-nav">Skip to main content</a>
    <AuthProvider>
      <Header/>
      <SubHeader/>
      <div id="App">
        <main id="mainContent"><ApolloWrapper>{children}</ApolloWrapper></main>
      </div>
      <Footer/>
    </AuthProvider>
    </body>
    </html>
  );
}
