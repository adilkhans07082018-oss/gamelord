import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Catalog",
  description: "Browse the best games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* ========================================== */}
        {/* ?? GLOBAL AD NETWORK SCRIPTS (Pop-unders, Auto-Ads) */}
        {/* ========================================== */}
        {/* Google AdSense Global Script Example: */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}

        {/* Adsterra Pop-under Script Example: */}
        {/* <script data-cfasync="false" src="https://accountut.com/1/98962142a3df93330ef765d34a5c0032"></script> */}
      </head>
      <body className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col antialiased transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <script dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('adult-blur') !== 'false') {
                  document.documentElement.classList.add('adult-blur-enabled');
                }
              } catch (e) {}
            `
          }} />
          <Navbar />
          <main className="flex-grow pt-14">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
