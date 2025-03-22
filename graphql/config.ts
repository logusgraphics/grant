import { AuthDataProvider } from '@/graphql/resolvers/auth/providers/types';
import { UserDataProvider } from '@/graphql/resolvers/users/providers/types';
import { fakerProvider } from '@/graphql/resolvers/users/providers/faker';
import { jwtProvider } from '@/graphql/resolvers/auth/providers/jwt';

export interface ModuleProviders {
  auth: AuthDataProvider;
  users: UserDataProvider;
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

export const config = {
  auth: {
    provider: jwtProvider,
  },
  users: {
    provider: fakerProvider,
  },
} as const;
