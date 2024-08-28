import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const withAuthenticatedAction = (WrappedComponent) => {
  return (props) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const handleAuthenticatedAction = (action) => {
      if (isAuthenticated()) {
        action();
      } else {
        // Store the current URL in localStorage
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/login');
      }
    };

    return <WrappedComponent {...props} onAuthenticatedAction={handleAuthenticatedAction} />;
  };
};

export default withAuthenticatedAction;