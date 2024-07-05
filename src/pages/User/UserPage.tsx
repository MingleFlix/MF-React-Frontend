import { useEffect, useState } from 'react';
import { UserLoaderData } from '@/pages/User/UserLoader.ts';
import { useLoaderData } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Heading } from '@/components/typography';
import { Edit2, Trash2 } from 'lucide-react';
import { fetchUserDataById } from '@/services/userService.ts';
import { UserWithRoles } from '@/types/user.ts';

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
    <div className='flex flex-col w-full items-center gap-y-4'>
      <Card className='bg-opacity-10 bg-white'>
        <CardHeader>
          <Heading> Profile</Heading>
        </CardHeader>
        <CardContent>
          <table className='min-w-full leading-normal'>
            <thead>
              <tr>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Username
                </th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Roles
                </th>
                <th className='px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='px-5 py-5 border-l border-b  border-gray-200  text-sm'>
                  {user.username}
                </td>
                <td className='px-5 py-5 border-b  border-gray-200  text-sm'>
                  {user.email}
                </td>
                <td className='px-5 py-5 border-b border-gray-200  text-sm'>
                  {user.roles.map(role => role).join(', ')}
                </td>
                <td className='px-5 py-5 border-r border-b border-gray-200  text-sm'>
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
