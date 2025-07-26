'use client';

import { useTranslations } from 'next-intl';
import { Logo } from '@/components/common/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('auth');

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-2">
      {/* Left side - Auth forms */}
      <div className="flex items-center justify-center p-6 sm:p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Right side - Image or gradient */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-r from-blue-600/90 to-blue-400/90 p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/identity-central-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-400/90" />
        <div className="max-w-2xl text-white relative z-10">
          <div className="flex items-center">
            <Logo size={250} className="text-white flex-shrink-0" />
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">{t('welcome.title')}</h2>
              <p className="text-lg opacity-90">{t('welcome.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
