import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string; accountId: string; projectId: string }>;
};

export default async function ProjectAppsRedirectPage({ params }: Props) {
  const { locale, accountId, projectId } = await params;
  permanentRedirect(`/${locale}/dashboard/accounts/${accountId}/projects/${projectId}/apps`);
}
