'use client';

import { ReactNode } from 'react';

// import { DashboardNav } from '@/components/navigation/DashboardNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
