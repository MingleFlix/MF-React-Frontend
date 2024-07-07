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
