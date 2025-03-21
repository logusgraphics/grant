import { UserDataProvider } from './users/providers/types';
import { AuthDataProvider } from './auth/providers/types';
import { fakerProvider } from './users/providers/faker';
import { jwtProvider } from './auth/providers/jwt';

export interface ModuleProviders {
  users: UserDataProvider;
  auth: AuthDataProvider;
  // Add other modules here as we create them
  // auth: AuthDataProvider;
}

export interface GraphQLConfig {
  providers: ModuleProviders;
}

// Default configuration using faker providers for users and JWT for auth
export const defaultConfig: GraphQLConfig = {
  providers: {
    users: fakerProvider,
    auth: jwtProvider,
  },
};
