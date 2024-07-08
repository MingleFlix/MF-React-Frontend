import { UserWithRoles } from '@/types/user.ts';

/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

/**
 * Fetches user data by ID.
 * @param userId The ID of the user to fetch.
 * @returns The user data.
 */
export async function fetchUserDataById(
  userId: string,
): Promise<UserWithRoles> {
  try {
    const response = await fetch(`/api/user-management/user/${userId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await response.json();
    return userData as UserWithRoles;
  } catch (error) {
    console.error('There was a problem fetching the user data:', error);
    throw error;
  }
}

/**
 * Deletes own user.
 */
export async function deleteOwnUser(): Promise<void> {
  try {
    const response = await fetch(`/api/user-management/user`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error('There was a problem deleting the user:', error);
    throw error;
  }
}

/**
 * Updates own user.
 * @param username The new username.
 * @param email The new email.
 * @param password The new password.
 * @returns The updated user data.
 */
export async function updateUser(
  username: string,
  email: string,
  password: string,
): Promise<UserWithRoles> {
  try {
    const response = await fetch(`/api/user-management/user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const updatedUserData = await response.json();
    return updatedUserData as UserWithRoles;
  } catch (error) {
    console.error('There was a problem updating the user:', error);
    throw error;
  }
}
