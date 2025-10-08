import { Controllers } from './controllers';

export type GraphqlContext = {
  user: AuthenticatedUser | null;
  controllers: Controllers;
  origin: string;
};

export interface AuthenticatedUser {
  id: string;
  aud: string;
}
