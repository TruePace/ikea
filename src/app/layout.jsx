'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navForAll/NavBar";
import { AuthProvider } from "./(auth)/AuthContext";
import { Provider } from "react-redux";
import { store, persistor } from "@/Redux/store";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TruePace News</title>
        <meta name="description" content="Get the latest breaking news and in-depth stories from TruePace News" />
        <meta name="keywords" content="news, headlines, breaking news, current events" />
        <link rel="icon" href="/TruePace.svg" sizes="any" />
        <meta name="robots" content="index, follow" />
        <Script
          id="schema-org-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TruePace News",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://truepace.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                 "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://truepace.com"}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} flex flex-col tablet:flex-row desktop:flex-row min-h-screen bg-white text-black dark:bg-gray-900 dark:text-gray-200`}>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider>
              <NavBar />
              <main className="flex-grow tablet:ml-16 desktop:ml-64 overflow-y-auto bg-inherit">
                {children}
              </main>
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}