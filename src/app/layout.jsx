'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navForAll/NavBar";
import { AuthProvider } from "./(auth)/AuthContext";
import { Provider } from "react-redux";
import { store, persistor } from "@/Redux/store";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
         <head>
         <link rel="icon" href="/TruePace.svg" sizes="any" />
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


