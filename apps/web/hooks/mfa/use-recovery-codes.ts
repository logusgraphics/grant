import { useMutation } from '@apollo/client/react';
import { GenerateMyMfaRecoveryCodesDocument } from '@grantjs/schema';

export function useRecoveryCodes() {
  const [generateCodesMutation] = useMutation(GenerateMyMfaRecoveryCodesDocument);

  return {
    generateCodes: async (factorId?: string) => {
      const result = await generateCodesMutation({
        variables: { input: factorId ? { factorId } : undefined },
      });
      return result.data?.generateMyMfaRecoveryCodes ?? [];
    },
  };
}
