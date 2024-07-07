import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import heroImage from '../../../assets/hero.webp';
import { Heading, Text } from '../../typography';
import { AuthContext } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.ts';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

const HeroSection: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const { toast } = useToast();

  const [hideCreateForm, setHideCreateForm] = React.useState<boolean>(true);
  const [roomName, setRoomName] = React.useState<string>('');

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const createRoom = async () => {
    // Get user auth data
    const { auth } = authContext;

    // Check if user is logged in
    if (!auth) {
      toast({
        title: 'Please login to create a room',
      });
      return;
    }

    if (!roomName) {
      toast({
        title: 'Please enter a room name',
      });
      return;
    }

    // Create room
    try {
      const response = await fetch('/api/room-management/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          token: auth.token,
        }),
      });

      if (!response.ok) {
        toast({
          title: 'Failed to create room!',
        });
        return;
      }

      const responseBody = await response.json();
      console.log(responseBody);
      const roomId = responseBody.id;

      // Redirect to room
      navigate('/room/' + roomId, { replace: true });
    } catch (error: any) {
      throw new Error('Failed to create room!');
    }
  };

  return (
    <div className='overflow-hidden relative p-20 text-center text-white bg-gray-800'>
      <img
        src={heroImage}
        alt='Descriptive Alt Text'
        className='object-cover absolute inset-0 z-0 w-full h-full'
      />
      <div className='absolute inset-0 z-10 bg-gradient-to-r from-purple-500 to-blue-500 opacity-75'></div>
      <div className='relative z-20'>
        <Heading>Watch Videos Together</Heading>
        <Text>Create your room, invite friends, and watch videos in sync.</Text>
        <div className='flex flex-col mt-8'>
          {hideCreateForm ? (
            <Button
              className='self-center w-36 font-bold text-white bg-blue-500 hover:bg-blue-700'
              onClick={() => setHideCreateForm(false)}
            >
              Get Started
            </Button>
          ) : (
            <Card className='w-[350px] self-center bg-gray-900 bg-opacity-100'>
              <CardHeader>
                <CardTitle>Create Room</CardTitle>
              </CardHeader>
              <CardContent>
                <form>
                  <div className='grid gap-4 items-center w-full'>
                    <div className='flex flex-col space-y-1.5'>
                      <Label htmlFor='name'>Name</Label>
                      <Input
                        id='name'
                        placeholder='Name of your room'
                        value={roomName}
                        onChange={e => setRoomName(e.target.value)}
                      />
                    </div>
                    {/*<div className='flex flex-col space-y-1.5'>*/}
                    {/*  <Label htmlFor='friends'>Invite Friends</Label>*/}
                    {/*  <Select>*/}
                    {/*    <SelectTrigger id='friends'>*/}
                    {/*      <SelectValue placeholder='Select' />*/}
                    {/*    </SelectTrigger>*/}
                    {/*    <SelectContent position='popper'>*/}
                    {/*      <SelectItem value='next'>Markus</SelectItem>*/}
                    {/*      <SelectItem value='sveltekit'>Tom</SelectItem>*/}
                    {/*    </SelectContent>*/}
                    {/*  </Select>*/}
                    {/*</div>*/}
                  </div>
                </form>
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  variant='outline'
                  onClick={() => setHideCreateForm(true)}
                >
                  Cancel
                </Button>
                <Button onClick={createRoom}>Create</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
