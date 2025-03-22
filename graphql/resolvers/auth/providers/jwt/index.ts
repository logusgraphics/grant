import { AuthDataProvider } from '@/graphql/resolvers/auth/providers/types';
import { login } from './login';

export const jwtProvider: AuthDataProvider = {
  login,
};
