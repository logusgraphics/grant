import { AuthDataProvider } from '../types';
import { login } from './login';

export const jwtProvider: AuthDataProvider = {
  login,
};
