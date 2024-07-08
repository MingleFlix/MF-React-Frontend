import React, { useContext, useEffect, useState } from 'react';
import { UserLoaderData } from '@/pages/User/UserLoader.ts';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Heading } from '@/components/typography';
import { Edit2, Trash2 } from 'lucide-react';
import {
  deleteOwnUser,
  fetchUserDataById,
  updateUser,
} from '@/services/userService.ts';
import { UserWithRoles } from '@/types/user.ts';
import { AuthContext } from '@/context/AuthContext.tsx';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

function EditUserDataForm(props: {
  onSubmit: () => void;
  error: any;
  success: any;
  formData: any;
  onChange: any;
}) {
  return (
    <form className='p-10 bg-[#292929] rounded-lg' onSubmit={props.onSubmit}>
      <h2 className='p-5 pb-10 text-4xl text-white'>Edit user data</h2>
      {props.error && <p className='pb-5 text-red-500'>{props.error}</p>}
      {props.success && (
        <p className='pb-5 text-green-500'>
          <a href='/login'>{props.success}</a>
        </p>
      )}
      <div
        className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
        data-twe-input-wrapper-init
      >
        <input
          type='text'
          className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
          name='username'
          value={props.formData.username}
          onChange={props.onChange}
          placeholder='Username'
        />
      </div>

      <div
        className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
        data-twe-input-wrapper-init
      >
        <input
          type='email'
          className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
          name='email'
          value={props.formData.email}
          onChange={props.onChange}
          placeholder='Email address'
        />
      </div>

      <div
        className='relative mb-6 bg-neutral-900 border-sky-600 hover:border-sky-400 transition duration-400 ease-in-out border-b-[2px] rounded-lg'
        data-twe-input-wrapper-init
      >
        <input
          type='password'
          className='block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none text-white/80'
          name='password'
          value={props.formData.password}
          onChange={props.onChange}
          placeholder='Password'
        />
      </div>

      <button
        type='submit'
        className='inline-block w-full rounded-lg bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal bg-sky-600 text-white shadow-primary-3 transition duration-400 ease-in-out hover:bg-sky-500 hover:shadow-primary-2 focus:bg-sky-500 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-sky-500 active:shadow-primary-2'
      >
        Update
      </button>
    </form>
  );
}

type EditUserDataComponentProps = {
  user: UserWithRoles;
};

function EditUserDataComponent({ user }: EditUserDataComponentProps) {
  const [formData, setFormData] = React.useState({
    username: user.username,
    email: user.email,
    password: '',
  });

  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { username, email, password } = formData;
      await updateUser(username, email, password);
      setSuccess('User updated successfully');
    } catch (error) {
      setError('Error updating user data');
    }
  };

  return (
    <EditUserDataForm
      // @ts-expect-error asynchronus function
      onSubmit={onSubmit}
      error={error}
      success={success}
      formData={formData}
      onChange={onChange}
    />
  );
}

export default function UserPage() {
  const { userId } = useLoaderData() as UserLoaderData;
  const navigate = useNavigate();
  const [user, setUser] = useState<UserWithRoles>(null);
  const [loading, setLoading] = useState(true);
  const [editUserFormVisible, setEditUserFormVisible] = useState(false);
  const { auth, logout } = useContext(AuthContext);

  const isOwnUser = auth?.userId === user?.userId;
  const canView = isOwnUser || user?.roles?.includes('admin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetchUserDataById(userId);
        setUser(userData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleDelete = async () => {
    try {
      await deleteOwnUser();
      logout();
      // Redirect to home page after deleting own user
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!canView) {
    return <div>Access denied.</div>;
  }

  return (
    <div className='flex flex-col w-full items-center gap-y-4'>
      <Card className='bg-opacity-10 bg-white mt-4'>
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
                <th className='px-5 py-3 t  ext-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200'>
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
                    <Edit2
                      className='mr-3 cursor-pointer'
                      onClick={() =>
                        setEditUserFormVisible(!editUserFormVisible)
                      }
                    />
                    <Trash2 className='cursor-pointer' onClick={handleDelete} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
        {editUserFormVisible && (
          <CardContent>{<EditUserDataComponent user={user} />}</CardContent>
        )}
      </Card>
    </div>
  );
}
