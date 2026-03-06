import { permanentRedirect } from 'next/navigation';

type Props = {
  params: Promise<{
    locale: string;
    organizationId: string;
    projectId: string;
  }>;
};

export default async function OrgProjectAppsRedirectPage({ params }: Props) {
  const { locale, organizationId, projectId } = await params;
  permanentRedirect(
    `/${locale}/dashboard/organizations/${organizationId}/projects/${projectId}/apps`
  );
}
