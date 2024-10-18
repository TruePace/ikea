import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicLoginForm = dynamic(() => import('./page.jsx'), {
  loading: () => <p>Loading login form...</p>,
  ssr: false
});

const LoginPage = () => {
  return (
    <div>
      <h1>Login</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicLoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;