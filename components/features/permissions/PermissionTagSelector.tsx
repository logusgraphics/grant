'use client';

import { Tags } from '@/components/common';

interface PermissionTagSelectorProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
}

export function PermissionTagSelector({
  selectedTagIds,
  onTagIdsChange,
}: PermissionTagSelectorProps) {
  return <Tags selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />;
}
