import { Limit } from '@/components/common';

interface PermissionLimitProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

export function PermissionLimit({ limit, onLimitChange }: PermissionLimitProps) {
  return (
    <Limit
      limit={limit}
      onLimitChange={onLimitChange}
      namespace="permissions"
      translationKey="limit"
      options={[10, 20, 50, 100]}
    />
  );
}
