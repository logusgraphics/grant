import { Request } from 'express';

import { AuthenticatedUser } from './auth';
import { RequestContext } from './context';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser | null;
  audience?: string;
}

export interface ContextRequest extends AuthenticatedRequest {
  context: RequestContext;
}
