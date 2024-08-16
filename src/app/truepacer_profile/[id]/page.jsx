'use client';

import Header from '@/components/TruePacerProfileComp/Header';
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

  if (!profile) return <div>Loading...</div>;

  return (
    <>
    <Header/>
      Truepace profile for ID: {id}
      {/* Render profile data here */}


    </>
  );
};

export default TruepaceProfile;