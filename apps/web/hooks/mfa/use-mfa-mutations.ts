import { useMutation } from '@apollo/client/react';
import {
  CreateMyMfaEnrollmentDocument,
  RemoveMyMfaDeviceDocument,
  SetMyPrimaryMfaDeviceDocument,
  VerifyMyMfaEnrollmentDocument,
} from '@grantjs/schema';

export function useMfaMutations() {
  const [createEnrollmentMutation] = useMutation(CreateMyMfaEnrollmentDocument);
  const [verifyEnrollmentMutation] = useMutation(VerifyMyMfaEnrollmentDocument);
  const [setPrimaryMutation] = useMutation(SetMyPrimaryMfaDeviceDocument);
  const [removeDeviceMutation] = useMutation(RemoveMyMfaDeviceDocument);

  return {
    createEnrollment: async () => {
      const result = await createEnrollmentMutation();
      return result.data?.createMyMfaEnrollment ?? null;
    },
    verifyEnrollment: async (code: string) => {
      const result = await verifyEnrollmentMutation({ variables: { input: { code } } });
      return Boolean(result.data?.verifyMyMfaEnrollment?.success);
    },
    setPrimaryDevice: async (factorId: string) => {
      const result = await setPrimaryMutation({ variables: { input: { factorId } } });
      return result.data?.setMyPrimaryMfaDevice ?? null;
    },
    removeDevice: async (factorId: string) => {
      const result = await removeDeviceMutation({ variables: { input: { factorId } } });
      return Boolean(result.data?.removeMyMfaDevice?.success);
    },
  };
}
