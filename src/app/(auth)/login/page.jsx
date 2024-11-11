'use client'
import { useState,useEffect } from 'react';
import Link from 'next/link'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase/ClientApp';
import { FcGoogle } from 'react-icons/fc';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { getDeviceInfo,getLocation } from '../DeviceInfo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const LogIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { user , fetchUserDetails} = useAuth();

    useEffect(() => {
        if (user || isAuthenticated) {
            router.push('/');
        }
    }, [user, isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const deviceInfo = getDeviceInfo();
            const location = await getLocation();
            
            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
        
            // Get ID token
            const idToken = await user.getIdToken();
        
            // Send login details to backend
            const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    deviceInfo,
                    location,
                    loginHistory: [{
                        timestamp: new Date(),
                        deviceInfo,
                        location
                    }]
                }),
            });
        
            if (!response.ok) {
                throw new Error('Failed to verify user with backend');
            }
        
            await fetchUserDetails(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error during sign-in process:', error);
            setError('Authentication failed. Please check your email and password.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            const deviceInfo = getDeviceInfo();
            const location = await getLocation();
            
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
            provider.addScope('https://www.googleapis.com/auth/user.gender.read');
           
            
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();
            
            // Get access token for Google API calls
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;
            
            // Fetch user profile data from Google People API
            const profileResponse = await fetch(
                'https://people.googleapis.com/v1/people/me?personFields=birthdays,genders',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
            
            const profileData = await profileResponse.json();
            
            // Extract birthday and gender
            const birthday = profileData.birthdays?.[0]?.date;
            const gender = profileData.genders?.[0]?.value;
            
            const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    birthday: birthday ? `${birthday.year}-${birthday.month}-${birthday.day}` : null,
                    gender: gender || null,
                    deviceInfo,
                    location,
                    loginHistory: [{
                        timestamp: new Date(),
                        deviceInfo,
                        location
                    }]
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to sign in with Google');
            }
    
            const userData = await response.json();
            router.push('/');
        } catch (error) {
            console.error('Error signing in with Google:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Log in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:text-gray-200 dark:bg-gray-900 "
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10 dark:text-gray-200 dark:bg-gray-900 "
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <FaEye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && !isAuthenticated && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    <div>
                    <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FcGoogle className="h-5 w-5 mr-2" />
                            Sign in with Google
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Don&apos;t have an account? Register
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LogIn;