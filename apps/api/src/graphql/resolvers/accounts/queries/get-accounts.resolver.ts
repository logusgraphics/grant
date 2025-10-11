import { Account, QueryResolvers } from '@logusgraphics/grant-schema';

import { GraphqlContext } from '@/graphql/types';
import { getDirectFieldSelection } from '@/lib/field-selection.lib';

export const getAccountsResolver: QueryResolvers<GraphqlContext>['accounts'] = async (
  _parent,
  { page, limit, sort, search, ids },
  context,
  info
) => {
  const requestedFields = getDirectFieldSelection<keyof Account>(info, ['accounts']);
  const accounts = await context.handlers.accounts.getAccounts({
    page,
    limit,
    sort,
    search,
    ids,
    requestedFields,
  });
  return accounts;
};
