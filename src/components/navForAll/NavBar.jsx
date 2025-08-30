import { GiNewspaper } from 'react-icons/gi';
import { RiShieldFlashFill } from 'react-icons/ri';
import { GrDocumentMissing } from 'react-icons/gr';
import { FaHistory } from 'react-icons/fa';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '@/app/(auth)/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { resetMissedContentCount } from '@/Redux/Slices/MissedNotificationSlice';
import Image from "next/image";

const NavBar = () => {
  const pathName = usePathname();
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Get missed content notification state from Redux
  const hasMissedContent = useSelector(state => state.notification?.hasMissedContent || false);
  const missedContentCount = useSelector(state => state.notification?.missedContentCount || 0);

  const handleNavigate = (e, path) => {
    // Only apply special handling for beyond_news navigation
    if (path === '/beyond_news') {
      // Setting navigation type to internal-navigation
      localStorage.setItem('beyondNewsNavigationType', 'internal-navigation');
    }
    
    // Don't immediately clear notification when clicking - let the page handle it
    // This ensures the notification stays visible until user actually views the content
    if (path === '/missed_just_in') {
      console.log('🔔 Navigating to missed content page');
      // The notification will be cleared by the MissedJustIn page after user views content
    }
  };

  const links = [
    {
      title: <GiNewspaper size='1.3em' color='gray' />,
      path: '/beyond_news',
      titleName: 'Beyond Headline',
    },
    {
      title: <RiShieldFlashFill size='1.3em' color='gray' />,
      path: '/',
      titleName: 'Headline News',
    },
    {
      title: <GrDocumentMissing size='1.3em' color='gray' />,
      path: '/missed_just_in',
      titleName: 'Missed Just In',
      protected: true,
      showNotification: true, // Flag to show notification for this link
    },
    {
      title: <FaHistory size='1.3em' color='gray' />,
      path: '/histories',
      titleName: 'History',
      protected: true,
    },
  ];

  return (
    <nav className="bg-white fixed bottom-0 left-0 tablet:left-0 tablet:top-0 desktop:left-0 desktop:top-0 w-full h-14 tablet:h-full desktop:h-full tablet:w-16 desktop:w-64 py-1 tablet:py-4 desktop:py-6 flex flex-nowrap tablet:flex-col desktop:flex-col justify-evenly items-center z-10 dark:bg-gray-900 dark:text-gray-200">
      {links.map((link) => (
        <div
          key={link.title}
          className={`w-1/4 tablet:w-full desktop:w-full flex flex-col justify-center items-center relative
            ${pathName === link.path ?
              'tablet:border-l-4 desktop:border-l-4 border-red-500 bg-opacity-65 rounded-lg shadow-lg shadow-red-700/50 tablet:py-1 desktop:py-1 font-semibold' : ''
            }`}
        >
          {!link.protected || user ? (
            <Link
              href={link.path}
              className="flex flex-col tablet:flex-row desktop:flex-row items-center px-1 py-1.5 tablet:p-2 desktop:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full relative"
              onClick={(e) => handleNavigate(e, link.path)}
            >
              <div className="tablet:mr-2 desktop:mr-4 mb-0.5 tablet:mb-0 relative">
                {link.title}
                {/* Enhanced Notification Badge */}
                {link.showNotification && hasMissedContent && user && missedContentCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-[10px] font-bold">
                      {missedContentCount > 99 ? '99+' : missedContentCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] tablet:text-sm desktop:text-base text-center tablet:text-left desktop:text-left text-gray-600 leading-tight dark:text-gray-200">
                {link.titleName}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex flex-col tablet:flex-row desktop:flex-row items-center px-1 py-1.5 tablet:p-2 desktop:p-2 hover:bg-gray-100 w-full dark:hover:bg-gray-700"
            >
              <div className="tablet:mr-2 desktop:mr-4 mb-0.5 tablet:mb-0">
                {link.title}
              </div>
              <span className="text-[11px] tablet:text-sm desktop:text-base text-center tablet:text-left desktop:text-left text-gray-600 leading-tight">
                {link.titleName}
              </span>
            </Link>
          )}
        </div>
      ))}
      <div className="hidden tablet:flex desktop:flex flex-col items-center justify-center mt-auto mb-4">
        <Image src='/TruePace.svg' height={25} width={25} alt="TruePace Logo" />
        <p className="text-sm mt-2">TruePace</p>
      </div>
    </nav>
  );
};

export default NavBar;