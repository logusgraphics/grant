import { UserDataProvider } from '../types';
import { getUsers } from './getUsers';
import { createUser } from './createUser';
import { updateUser } from './updateUser';
import { deleteUser } from './deleteUser';

export const fakerProvider: UserDataProvider = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
