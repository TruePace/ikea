// NOTE: "Metadata" can't be used in a file where there's already 'use client' inputed there
'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/navForAll/NavBar";
import { AuthProvider } from "./(auth)/AuthContext";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store,persistor } from "@/Redux/store";





const inter = Inter({ subsets: ["latin"] });

//  export const metadata = {
//   title: "TruePace -title",
//   description: "Getting the fast and true breaking news at ease-description",
//   icons: {
//     icon: '/TruePace.svg', // /public path
//   },
  
// };

export default function RootLayout({ children }) {
  return (
    <>
    <html lang="en">
    
      <body className={inter.className}>
      <Provider store={store}>
      <PersistGate loading={<div>Loading persisted state...</div>} persistor={persistor}>

      <AuthProvider>
          {children}
          <NavBar />
          </AuthProvider>

          
          </PersistGate>
          </Provider>
        </body>
       
    
    </html>
   
    </>
  );
}
