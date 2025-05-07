'use client'
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import ToggleSearchBar from "../SearchBar/ToggleSearchBar";
import { useAuth } from "@/app/(auth)/AuthContext";
import { ThemeToggle } from "../ThemeProvider/ThemeToggle";

const HistoryHeader = () => {

  const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Function to get the first letter of the user's name
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };


    return (
        <>
  <div className="navbar bg-base-100 dark:bg-gray-900 dark:text-gray-200">
                <div className="flex-1 ">
                    <Link href='' className="btn btn-ghost text-lg">
                        <Image src='/TruePace.svg' height={25} width={25} alt="history" />
                        <p>History</p>
                    </Link>
                </div>
                <div className="flex-none gap-7 w-2/6">
                    <ToggleSearchBar />
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="avatar placeholder">
                                <div className="bg-red-600 text-neutral-content rounded-full w-9">
                                    <span className="text-sm">{getInitial(user.username )}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 dark:text-gray-200 dark:bg-gray-700">
                                <li><a>{user.username || 'My Profile'}</a></li>
                                <li><a>Settings</a></li>
                                <li><a onClick={handleLogout}>Logout</a></li>
                                <ThemeToggle/>
                            </ul>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </>
    );
}

export default HistoryHeader;

