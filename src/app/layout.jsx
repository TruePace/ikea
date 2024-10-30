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
    <html lang="en">
      <body className={`${inter.className} flex flex-col tablet:flex-row desktop:flex-row min-h-screen dark:bg-gray-900`}>
        <Provider store={store}>
          <AuthProvider>
            <ThemeProvider>
            <NavBar />
            <main className="flex-grow tablet:ml-16 desktop:ml-64 overflow-y-auto">
              {children}
            </main>
            </ThemeProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}