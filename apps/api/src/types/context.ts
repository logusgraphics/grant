import { Handlers } from '@/handlers';
import { SupportedLocale } from '@/i18n';

import { AuthenticatedUser } from './auth';

export interface RequestContext {
  user: AuthenticatedUser | null;
  handlers: Handlers;
  origin: string;
  locale: SupportedLocale;
}
