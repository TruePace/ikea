'use client'
import { useRouter } from 'next/navigation';
import ToggleSearchBar from "@/components/SearchBar/ToggleSearchBar";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from '@/app/(auth)/AuthContext';

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

    // Function to get the first letter of the user's name
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <>
            <div className="navbar bg-base-100">
                <div className="flex-1 ">
                    <Link href='' className="btn btn-ghost text-lg">
                        <Image src='/TruePace.svg' height={25} width={25} />
                        <p>TruePace</p>
                    </Link>
                </div>
                <div className="flex-none gap-7 w-2/6">
                    <span  onClick={handleSearch}>
                    <ToggleSearchBar />
                    </span>
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="avatar placeholder">
                                <div className="bg-red-600 text-neutral-content rounded-full w-9">
                                    <span className="text-sm">{getInitial(user.displayName )}</span>
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                                <li><a>{user.displayName || 'My Profile'}</a></li>
                                <li><a>Settings</a></li>
                                <li><a onClick={handleLogout}>Logout</a></li>
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

export default Header;