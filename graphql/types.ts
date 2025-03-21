import { ModuleProviders } from './config';

export interface Context {
  providers: ModuleProviders;
  // Add any context properties your resolvers need
  // For example:
  user?: {
    id: string;
    email: string;
    roles: string[];
  } | null;
  // Add other context properties as needed
}
