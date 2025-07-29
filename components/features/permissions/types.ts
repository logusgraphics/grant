import { z } from 'zod';

import { Permission } from '@/graphql/generated/types';

// Form schemas
export const createPermissionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  action: z.string().min(1, 'Action must be at least 1 character'),
  description: z.string().optional(),
});

export const editPermissionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  action: z.string().min(1, 'Action must be at least 1 character'),
  description: z.string().optional(),
});

// Form types
export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;
export type EditPermissionFormValues = z.infer<typeof editPermissionSchema>;

// Component props
export interface CreatePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EditPermissionDialogProps {
  permission: Permission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Query result types
export interface PermissionsQueryResult {
  permissions: {
    permissions: Permission[];
    totalCount: number;
    hasNextPage: boolean;
  };
}
