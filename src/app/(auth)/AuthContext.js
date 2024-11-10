// AuthProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase/ClientApp';
import { onAuthStateChanged, signOut,  } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [geolocation, setGeolocation] = useState(null);
  const [ipAddress, setIpAddress] = useState(null);

  // Fetch IP address
  const fetchIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP:', error);
      return null;
    }
  };

  // Get geolocation
  const getGeolocation = () => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setGeolocation(locationData);
            resolve(locationData);
          },
          (error) => {
            console.error('Geolocation error:', error);
            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  const fetchUserDetails = async (firebaseUser, retryCount = 0) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const ip = await fetchIPAddress();
      const location = await getGeolocation();
      
      // Get additional Google user data if available
      const googleProvider = firebaseUser.providerData.find(
        (provider) => provider.providerId === 'google.com'
      );
      
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          ipAddress: ip,
          geolocation: location,
          deviceInfo,
          googleData: googleProvider ? {
            email: googleProvider.email,
            displayName: googleProvider.displayName,
            photoURL: googleProvider.photoURL,
            // Note: age and other sensitive data might not be available
            // due to Google's privacy policies
          } : null
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          ...userData.user,
          uid: firebaseUser.uid,
          ipAddress: ip,
          geolocation: location,
          deviceInfo
        });
        return true;
      } else if (response.status === 404 && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchUserDetails(firebaseUser, retryCount + 1);
      } else {
        console.error('Failed to fetch user details');
        setUser({ ...firebaseUser, uid: firebaseUser.uid });
        return false;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUser({ ...firebaseUser, uid: firebaseUser.uid });
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
      isInitialized,
      geolocation,
      ipAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);