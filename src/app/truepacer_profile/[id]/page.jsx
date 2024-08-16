'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TruepaceProfile = () => {
  const params = useParams();
  const { id } = params;
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/HeadlineNews/Channel/${id}`);
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
    <div>
      Truepace profile for ID: {id}
      {/* Render profile data here */}
    </div>
  );
};

export default TruepaceProfile;