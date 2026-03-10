'use client';

import { CardSkeleton } from '@/components/common';

export function SigningKeyCardSkeleton() {
  return <CardSkeleton showMultipleSections={false} showAuditFields={true} />;
}
