'use client';
import Header from '@/components/Beyond_news_comps/beyond-header/Header';


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
 
    <Header/>
    <ProfileContent profile={profile}/>
     
     
     
      {/* Truepace profile for ID: {id} */}


    </>
  );
};

export default TruepaceProfile;