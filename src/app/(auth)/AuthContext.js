import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase/ClientApp';
import { onAuthStateChanged, signOut } from 'firebase/auth';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/details`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: firebaseUser.uid }),
          });
          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData.user,
              username: userData.user.username || userData.user.displayName || userData.user.email.split('@')[0],
              uid: firebaseUser.uid
            });
          } else {
            console.error('Failed to fetch user details');
            setUser({ ...firebaseUser, uid: firebaseUser.uid });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          setUser({ ...firebaseUser, uid: firebaseUser.uid });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);