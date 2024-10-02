'use client';
import Header from '@/components/Beyond_news_comps/beyond-header/Header';


import ProfileContent from '@/components/TruePacerProfileComp/Header/ProfileContent/ProfileContent';
import ProfileSkeletonLoader from '@/components/TruePacerProfileComp/ProfileSkeletonLoader';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const TruepaceProfile = () => {
  const params = useParams();
  const { id } = params;
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel/${id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      } 
    };

    fetchProfile();
  }, [id]);
  useEffect(() => {
    console.log('profile:', profile);
   
  }, [profile]);



  return (
    <>
 
    <Header/>
    {isLoading ? (
        <ProfileSkeletonLoader/>
      ) : (
        <ProfileContent profile={profile} />
      )}
     
     
     
      {/* Truepace profile for ID: {id} */}


    </>
  );
};

export default TruepaceProfile;