import { Controllers } from './controllers';
import { Scope } from './generated/types';

export type GraphqlContext = {
  user: AuthenticatedUser | null;
  controllers: Controllers;
};

export interface AuthenticatedUser {
  id: string;
  scope: Scope;
}
