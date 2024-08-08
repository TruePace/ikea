// NOTE: "Metadata" can't be used in a file where there's already 'use client' inputed there
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navForAll/NavBar";





const inter = Inter({ subsets: ["latin"] });

 export const metadata = {
  title: "TruePace -title",
  description: "Getting the fast and true breaking news at ease-description",
  icons: {
    icon: '/TruePace.svg', // /public path
  },
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    
      <body className={inter.className}>
          {children}
          <NavBar />
        </body>
       
    
    </html>
  );
}
