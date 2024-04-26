import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navForAll/NavBar";




const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TruePace",
  description: "Getting the fast and true breaking news at ease",
  icons: {
    icon: '/TruePace.svg', // /public path
  },
  
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       
      <body className={inter.className}>
     
        {children}
<NavBar/>
        </body>
    
    </html>
  );
}
