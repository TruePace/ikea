import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DynamicRegisterForm = dynamic(() => import('./page.jsx'), {
  loading: () => <p>Loading registration form...</p>,
  ssr: false
});

const RegisterPage = () => {
  return (
    <div>
      <h1>Register</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicRegisterForm />
      </Suspense>
    </div>
  );
};

export default RegisterPage;