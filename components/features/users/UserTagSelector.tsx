'use client';

import { Tags } from '@/components/common';

interface UserTagSelectorProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
}

export function UserTagSelector({ selectedTagIds, onTagIdsChange }: UserTagSelectorProps) {
  return <Tags selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />;
}
