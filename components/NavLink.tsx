'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
}

export function NavLink({ href, children, variant = 'ghost' }: NavLinkProps) {
  const pathname = usePathname();
  // Remove the locale prefix for comparison
  const currentPath = pathname.split('/').slice(2).join('/');
  const targetPath = href === '/' ? '' : href.slice(1);

  const isActive =
    href === '/'
      ? currentPath === ''
      : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

  return (
    <Button
      variant={variant}
      asChild
      className={cn(isActive && 'bg-accent text-accent-foreground')}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
