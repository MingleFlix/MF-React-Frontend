import { useEffect, useState } from 'react';
import { UserLoaderData } from '@/pages/User/UserLoader.ts';
import { useLoaderData } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Heading } from '@/components/typography';
import { Edit2, Trash2 } from 'lucide-react';
import { fetchUserDataById } from '@/services/userService.ts';
import { UserWithRoles } from '@/types/user.ts';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

export default function UserPage() {
  const { userId } = useLoaderData() as UserLoaderData;
  const [user, setUser] = useState<UserWithRoles>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await fetchUserDataById(userId);
      setUser(userData);
    };

    fetchData();
  }, [userId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col gap-y-4 items-center w-full'>
      <Card className='bg-white bg-opacity-10'>
        <CardHeader>
          <Heading> Profile</Heading>
        </CardHeader>
        <CardContent>
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                <th className='px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200'>
                  Username
                </th>
                <th className='px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200'>
                  Email
                </th>
                <th className='px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200'>
                  Roles
                </th>
                <th className='px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='px-5 py-5 text-sm border-b border-l border-gray-200'>
                  {user.username}
                </td>
                <td className='px-5 py-5 text-sm border-b border-gray-200'>
                  {user.email}
                </td>
                <td className='px-5 py-5 text-sm border-b border-gray-200'>
                  {user.roles.map(role => role).join(', ')}
                </td>
                <td className='px-5 py-5 text-sm border-r border-b border-gray-200'>
                  <div className='flex items-center'>
                    <Edit2 className='mr-3 cursor-pointer' />
                    <Trash2 className='cursor-pointer' />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
