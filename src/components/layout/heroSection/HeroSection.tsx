import React, { useContext } from 'react';
import heroImage from '../../../assets/hero.webp';
import { Heading, Text } from '../../typography';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const authContext = useContext(AuthContext);
  let navigate = useNavigate();

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const createRoom = async () => {
    // Get user auth data
    const { auth } = authContext;

    // Check if user is logged in
    if (!auth) {
      alert('Please login to create a room');
      return;
    }

    // Create room
    try {
      const response = await fetch('/api/room-management/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auth.token),
      });

      if (!response.ok) {
        throw new Error('Failed to create room!');
      }

      const responseBody = await response.json();
      const roomId = responseBody.roomID;

      // Redirect to room
      navigate('/watch?room_id=' + roomId, { replace: true });
    } catch (error: any) {
      throw new Error('Failed to create room!');
    }
  };

  return (
    <div className='relative text-center p-20 bg-gray-800 text-white overflow-hidden'>
      <img
        src={heroImage}
        alt='Descriptive Alt Text'
        className='absolute inset-0 w-full h-full object-cover z-0'
      />
      <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-75 z-10'></div>
      <div className='relative z-20'>
        <Heading>Watch Videos Together</Heading>
        <Text>Create your room, invite friends, and watch videos in sync.</Text>
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={createRoom}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
