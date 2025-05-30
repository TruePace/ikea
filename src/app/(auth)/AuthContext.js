// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase/ClientApp';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserDetails = async (firebaseUser, retryCount = 0) => {
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
        // Check if this is the user's first login
        const isFirstLogin = !localStorage.getItem(`user_${firebaseUser.uid}_has_logged_in`);
        
        setUser({
          ...userData.user,
          uid: firebaseUser.uid,
          isNewUser: isFirstLogin // Add isNewUser flag
        });

        // If this is not the first login, mark it in localStorage
        if (isFirstLogin) {
          localStorage.setItem(`user_${firebaseUser.uid}_has_logged_in`, 'true');
        }
        
        return true;
      } else if (response.status === 404 && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchUserDetails(firebaseUser, retryCount + 1);
      } else {
        console.error('Failed to fetch user details');
        setUser({ 
          ...firebaseUser, 
          uid: firebaseUser.uid,
          isNewUser: !localStorage.getItem(`user_${firebaseUser.uid}_has_logged_in`)
        });
        return false;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser({ 
        ...firebaseUser, 
        uid: firebaseUser.uid,
        isNewUser: !localStorage.getItem(`user_${firebaseUser.uid}_has_logged_in`)
      });
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // console.log("Auth state changed. User:", firebaseUser ? firebaseUser.uid : "null");
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        await fetchUserDetails(firebaseUser);
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      
      setLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      logout,
      fetchUserDetails,
      isInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);