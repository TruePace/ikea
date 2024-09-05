'use client';
// import { store,persistor } from "@/Redux/store";
// import { Provider } from "react-redux";
// import { PersistGate } from 'redux-persist/integration/react';
import Header from '@/components/TruePacerProfileComp/Header/Header/Header';
import ProfileContent from '@/components/TruePacerProfileComp/Header/ProfileContent/ProfileContent';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const TruepaceProfile = () => {
  const params = useParams();
  const { id } = params;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [id]);
  useEffect(() => {
    console.log('profile:', profile);
   
  }, [profile]);

  if (!profile) return <div>Loading...</div>;

  return (
    <>
 {/* <Provider store={store}>
 <PersistGate loading={<div>Loading persisted state...</div>} persistor={persistor}> */}
    <Header/>
    <ProfileContent profile={profile}/>
      Truepace profile for ID: {id}
      {/* Render profile data here */}
      {/* </PersistGate>
      </Provider> */}

    </>
  );
};

export default TruepaceProfile;