'use client'
import { useState,useEffect } from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { auth } from '../firebase/ClientApp';
import { useRouter } from 'next/navigation';
import StatusMessage from './StatusMessage';
import { getIdToken } from 'firebase/auth';
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
    const router = useRouter()

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
        if (passwordStrength !== 'Strong password') {
            alert('Please ensure your password meets the strength requirements.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendUserDataToBackend(user);
            console.log('User registered:', user);
        
            
            setRegistrationStatus('success');
            setTimeout(() => {
                router.push('/');
            }, 3000); // Redirect after 3 seconds
            
        } 
        catch (error) {
            console.error('Error registering user:', error);
            setRegistrationStatus('error');
        }
    };



    const handleGoogleSignIn = async () => {
        setError(''); // Clear any existing errors
        try {
          console.log('Starting Google Sign In');
          const provider = new GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/userinfo.email');
          provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
          console.log('Provider created');
          
          const result = await signInWithPopup(auth, provider);
          console.log('Sign in successful', result);
          
          // Get the user's ID token
          const idToken = await result.user.getIdToken();
          
          // Send the ID token to your backend
          const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to save user data to backend');
          }
      
          console.log('User saved to database');
          router.push('/'); // Redirect to home page after successful login
        } catch (error) {
          console.error('Error signing in with Google', error);
          setError('Error signing in with Google. Please try again.');
        }
      };
    const sendUserDataToBackend = async (user) => {
        try {
          const idToken = await getIdToken(user);
          const response = await fetch(`${API_BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || email.split('@')[0],
              photoURL: user.photoURL,
            }),
          });
          if (!response.ok) {
            throw new Error('Failed to save user data to backend');
          }
          console.log('User data saved to backend');
        } catch (error) {
          console.error('Error saving user data to backend:', error);
          throw error;
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
                <StatusMessage status={registrationStatus} />
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
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
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
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
                        >
                            Register
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
                            Continue with Google
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