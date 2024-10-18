import dynamic from 'next/dynamic';
import { Suspense } from 'react';


const DynamicRegisterForm = dynamic(() => import('./page.jsx'), {
  loading: () => <p>Loading truepace profile...</p>,
  ssr: false
});

const ProfileDynamics = () => {
  return (
    <div>
      <h1>Profiling</h1>
    
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicRegisterForm />
      </Suspense>
    </div>
  );
};

export default ProfileDynamics;