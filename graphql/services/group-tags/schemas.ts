import { z } from 'zod';

import { idSchema } from '../common/schemas';

export const queryGroupTagsArgsSchema = z.object({
  groupId: idSchema,
  tagId: idSchema.optional(),
});

export const addGroupTagInputSchema = z.object({
  groupId: idSchema.refine((groupId) => groupId.trim().length > 0, 'Group ID is required'),
  tagId: idSchema.refine((tagId) => tagId.trim().length > 0, 'Tag ID is required'),
});

export const removeGroupTagInputSchema = z.object({
  groupId: idSchema.refine((groupId) => groupId.trim().length > 0, 'Group ID is required'),
  tagId: idSchema.refine((tagId) => tagId.trim().length > 0, 'Tag ID is required'),
});

export const addGroupTagArgsSchema = z.object({
  input: addGroupTagInputSchema,
});

export const removeGroupTagArgsSchema = z.object({
  input: removeGroupTagInputSchema,
});

export const groupTagSchema = z.object({
  id: idSchema,
  groupId: idSchema,
  tagId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  group: z.any().nullable().optional(),
  tag: z.any().nullable().optional(),
});

export const getGroupTagsParamsSchema = queryGroupTagsArgsSchema;
export const addGroupTagParamsSchema = addGroupTagArgsSchema;
export const removeGroupTagParamsSchema = removeGroupTagArgsSchema;

export type GetGroupTagsParams = z.infer<typeof getGroupTagsParamsSchema>;
export type AddGroupTagParams = z.infer<typeof addGroupTagParamsSchema>;
export type RemoveGroupTagParams = z.infer<typeof removeGroupTagParamsSchema>;
export type GroupTagSchema = z.infer<typeof groupTagSchema>;
