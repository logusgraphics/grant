'use client';

import { Tags } from '@/components/common';

interface GroupTagSelectorProps {
  selectedTagIds: string[];
  onTagIdsChange: (tagIds: string[]) => void;
}

export function GroupTagSelector({ selectedTagIds, onTagIdsChange }: GroupTagSelectorProps) {
  return <Tags selectedTagIds={selectedTagIds} onTagIdsChange={onTagIdsChange} />;
}
