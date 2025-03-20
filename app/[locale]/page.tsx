import { UserList } from '@/components/UserList';
import { ThemeExample } from '@/components/ThemeExample';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MessagesProvider } from '@/components/providers/MessagesProvider';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations();
  const messages = (await import(`@/i18n/locales/${locale}.json`)).default;

  return (
    <main className="min-h-screen p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Users className="h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">{t('app.title')}</h1>
        </div>
        <p className="text-lg text-muted-foreground">{t('app.description')}</p>
      </div>
      <div className="max-w-4xl mx-auto space-y-8">
        <MessagesProvider locale={locale} messages={messages}>
          <ThemeExample />
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('users.title')}</h2>
            <CreateUserDialog />
          </div>
          <UserList />
        </MessagesProvider>
      </div>
    </main>
  );
}
