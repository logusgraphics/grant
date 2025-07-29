'use client';

import { Tags } from '@/components/common';

interface RoleTagSelectorProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
}

export function RoleTagSelector({ selectedTagIds, onTagIdsChange }: RoleTagSelectorProps) {
  return <Tags selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />;
}
