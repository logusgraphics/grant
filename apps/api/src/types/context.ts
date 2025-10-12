import { Handlers } from '@/handlers';

import { AuthenticatedUser } from './auth';

export interface RequestContext {
  user: AuthenticatedUser | null;
  handlers: Handlers;
  origin: string;
}
