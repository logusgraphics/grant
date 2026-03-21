import { ApolloClient } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { MfaDevice, MyMfaDevicesDocument, MyMfaDevicesQuery } from '@grantjs/schema';

export function useMfaDevices(): {
  devices: MfaDevice[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<ApolloClient.QueryResult<MyMfaDevicesQuery>>;
} {
  const { data, loading, error, refetch } = useQuery<MyMfaDevicesQuery>(MyMfaDevicesDocument, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  return {
    devices: data?.myMfaDevices ?? [],
    loading,
    error: error as Error | undefined,
    refetch: async () => refetch(),
  };
}
