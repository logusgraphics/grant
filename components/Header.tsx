'use client';

import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { NavLink } from './NavLink';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth';

export function Header() {
  const t = useTranslations('common');
  const title = t('app.title').split(' ');
  const { isAuthenticated } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-8">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <Zap className="h-4 w-4 text-white fill-current" />
            </div>
            <span className="font-bold uppercase tracking-tight">{title[0]}</span>
            <span className="font-normal uppercase tracking-wider">{title[1]}</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-3">
          {isAuthenticated && <NavLink href="/dashboard">{t('navigation.dashboard')}</NavLink>}
        </nav>

        {/* Utility Controls */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <LanguageSwitcher />
          {!isAuthenticated ? (
            <NavLink href="/auth/login">{t('auth.login')}</NavLink>
          ) : (
            <NavLink href="/auth/login" onClick={handleLogout}>
              {t('auth.logout')}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
