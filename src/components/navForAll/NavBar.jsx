'use client'
import { GiNewspaper } from 'react-icons/gi';
import { RiShieldFlashFill } from 'react-icons/ri';
import { GrDocumentMissing } from 'react-icons/gr';
import { FaHistory } from 'react-icons/fa';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/app/(auth)/AuthContext';

const NavBar = () => {
  const pathName = usePathname();
  const { user } = useAuth();

  const links = [
    {
      title: <GiNewspaper size='1.2em' color='gray' />,
      path: '/beyond_news',
      titleName: 'Beyond Headline',
    },
    {
      title: <RiShieldFlashFill size='1.2em' color='gray' />,
      path: '/',
      titleName: 'Headline News',
    },
    {
      title: <GrDocumentMissing size='1.2em' color='gray' />,
      path: '/missed_just_in',
      titleName: 'Missed Just In',
      protected: true,
    },
    {
      title: <FaHistory size='1.2em' color='gray' />,
      path: '/histories',
      titleName: 'History',
      protected: true,
    },
  ];

  return (
    <div className="bg-white w-full fixed bottom-0 left-0 right-0 py-1.5 flex flex-nowrap justify-evenly">
      {links.map((link) => (
        <div key={link.title} className={`w-1/4 flex flex-col justify-center items-center ${pathName === link.path && 'w-1/5 border border-red-500 bg-opacity-65 rounded-lg shadow-lg shadow-red-700/50 flex flex-col py-1 font-semibold'}`}>
          {!link.protected || user ? (
            <>
              <Link href={link.path}>{link.title}</Link>
              <Link href={link.path} className="text-xs text-center w-2/3 text-gray-600">{link.titleName}</Link>
            </>
          ) : (
            <>
              <Link href="/login">{link.title}</Link>
              <Link href="/login" className="text-xs text-center w-2/3 text-gray-600">{link.titleName}</Link>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default NavBar;