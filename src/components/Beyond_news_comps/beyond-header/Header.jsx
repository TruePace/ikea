'use client'
import { useRouter } from 'next/navigation';
import ToggleSearchBar from "@/components/SearchBar/ToggleSearchBar";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/(auth)/AuthContext';
import { ThemeToggle } from '@/components/ThemeProvider/ThemeToggle';

const Header = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleSearch = async () => {
        if (!user) {
          router.push('/login');
          return;
        }
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <header className="bg-base-100 shadow-md py-2 dark:bg-gray-900 dark:text-gray-200">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href='' className="flex items-center space-x-2">
                    <Image src='/TruePace.svg' height={20} width={20} alt="TruePace Logo" />
                    <span className="text-base font-semibold">TruePace</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <span onClick={handleSearch}>
                        <ToggleSearchBar />
                    </span>
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="avatar placeholder ">
                                <div className="bg-red-600 text-neutral-content rounded-full w-7 h-7 flex items-center justify-center">
                                    <span className="text-xs">{getInitial(user.username)}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-2 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 dark:text-gray-200 dark:bg-gray-700 ">
                                <li><a>{user.username || 'My Profile'}</a></li>
                                <li><a>Settings</a></li>
                                <li><a onClick={handleLogout}>Logout</a></li>
                                <ThemeToggle/>
                            </ul>
                        </div>
                    ) : (
                        <Link href="/login" className="btn btn-primary btn-sm">Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;