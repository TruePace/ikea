'use client'
import { useState,useEffect } from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { auth } from '../firebase/ClientApp';
import { useRouter } from 'next/navigation';
import { getDeviceInfo,getLocation } from '../DeviceInfo';

import { useAuth } from '../AuthContext';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL




const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [finalUsername, setFinalUsername] = useState('');
    const router = useRouter();
    const { fetchUserDetails } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => {
        const minLength = 12;
        const maxLength = 16;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength || password.length > maxLength) {
            return 'Password must be 12-16 characters long';
        }
        if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
            return 'Password must include lowercase, uppercase, number, and special character';
        }
        return 'Strong password';
    };

    useEffect(() => {
        setPasswordStrength(validatePassword(password));
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const deviceInfo = getDeviceInfo();
            const location = await getLocation();
            
            // Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            
            // Register with backend
            const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: username,
                    photoURL: user.photoURL,
                    username: username,
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
                throw new Error(`Failed to save user data to backend`);
            }
    
            const userData = await response.json();
            await fetchUserDetails(user);
            
            if (userData.user.username !== username) {
                setFinalUsername(userData.user.username);
                setRegistrationStatus('success-with-username-change');
            } else {
                setRegistrationStatus('success');
                router.push('/');
            }
        } catch (error) {
            console.error('Error registering user:', error);
            setError(error.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };
    // const handleGoogleSignIn = async () => {
    //     setError('');
    //     setIsLoading(true);
    //     try {
    //         const deviceInfo = getDeviceInfo();
    //         const location = await getLocation();
            
    //         const provider = new GoogleAuthProvider();
    //         const result = await signInWithPopup(auth, provider);
    //         const user = result.user;
    //         const idToken = await user.getIdToken();
            
    //         const response = await fetch(`${API_BASE_URL}/api/users/google-signin`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${idToken}`
    //             },
    //             body: JSON.stringify({
    //                 uid: user.uid,
    //                 email: user.email,
    //                 displayName: user.displayName,
    //                 photoURL: user.photoURL,
    //                 deviceInfo,
    //                 location,
    //                 loginHistory: [{
    //                     timestamp: new Date(),
    //                     deviceInfo,
    //                     location
    //                 }]
    //             }),
    //         });
    
    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             throw new Error(errorData.message || 'Failed to sign in with Google');
    //         }
    
    //         const userData = await response.json();
    //         router.push('/');
    //     } catch (error) {
    //         console.error('Error signing in with Google:', error);
    //         setError(error.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
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

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                {registrationStatus === 'success-with-username-change' && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                        <p className="font-bold">Username Changed</p>
                        <p>&quot;The username &quot;{username}&quot; was already taken. Your account has been created with the username &quot;{finalUsername}&quot;.&quot;
                        </p>
                        <button 
                            onClick={() => router.push('/')} 
                            className="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Continue to Homepage
                        </button>
                    </div>
                )}
                {error && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}
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
                        <div>
                        <label htmlFor="username" className="sr-only">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            maxLength={50}
                            type="text"
                            autoComplete="username"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:text-gray-200 dark:bg-gray-900 "
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10 dark:text-gray-200 dark:bg-gray-900 "
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FaEyeSlash  className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <FaEye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Password strength: {passwordStrength}
                        </div>
                        <div className="relative">
                            <label htmlFor="confirm-password" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10 dark:text-gray-200 dark:bg-gray-900 "
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                 {showPassword ? (
                                    <FaEyeSlash  className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <FaEye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                  
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                'Register'
                            )}
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
                            disabled={isLoading}
                        >
                            <FcGoogle className="h-5 w-5 mr-2" />
                            {isLoading ? 'Processing...' : 'Continue with Google'}
                        </button>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;