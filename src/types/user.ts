/*
 * Author: Jesse Günzl
 * Matrikelnummer: 2577166
 */

export interface User {
  username: string;
  userId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRoles extends User {
  roles: string[];
}
