import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function DashboardPage({ params: { locale } }: PageProps) {
  redirect(`/${locale}/dashboard/users`);
}
