import { useQuery } from '@apollo/client/react';
import { MyMfaRecoveryCodeStatusDocument } from '@grantjs/schema';

export function useMfaRecoveryCodeStatus() {
  return useQuery(MyMfaRecoveryCodeStatusDocument, { fetchPolicy: 'cache-and-network' });
}
