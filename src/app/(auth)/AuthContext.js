import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase/ClientApp';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);


  

  const fetchUserDetails = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await fetch(`${API_BASE_URL}/api/users/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid: firebaseUser.uid }),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...userData.user,
          username: userData.user.username || userData.user.displayName || userData.user.email.split('@')[0],
          uid: firebaseUser.uid,
        });
      } else {
        console.error('Failed to fetch user details');
        setUser({ ...firebaseUser, uid: firebaseUser.uid });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser({ ...firebaseUser, uid: firebaseUser.uid });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : "null");
      if (user) {
        setFirebaseUser(user);
        await fetchUserDetails(user);
      } else {
        setUser(null);
        setFirebaseUser(null);
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


  // In the onAuthStateChanged callback:


  return (
    <AuthContext.Provider value={{ user,firebaseUser, loading, logout, fetchUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);