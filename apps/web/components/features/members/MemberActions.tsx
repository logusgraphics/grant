'use client';

import { OrganizationInvitationStatus } from '@logusgraphics/grant-schema';
import { Ban, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Actions, ActionItem } from '@/components/common';
import { MemberWithInvitation } from '@/hooks/members';

interface MemberActionsProps {
  member: MemberWithInvitation;
  onRevokeInvitation: (id: string, email: string) => void;
}

export function MemberActions({ member, onRevokeInvitation }: MemberActionsProps) {
  const t = useTranslations('members.actions');

  // Only show actions for pending invitations
  if (member.type !== 'invitation' || member.status !== OrganizationInvitationStatus.Pending) {
    return null;
  }

  const handleRevokeClick = () => {
    if (member.email) {
      onRevokeInvitation(member.id, member.email);
    }
  };

  const actions: ActionItem<MemberWithInvitation>[] = [
    {
      key: 'revoke',
      label: t('revoke'),
      icon: <Ban className="mr-2 h-4 w-4" />,
      onClick: handleRevokeClick,
      variant: 'destructive',
    },
  ];

  // TODO: Add resend action for expired invitations when implemented
  // if (member.status === OrganizationInvitationStatus.Expired) {
  //   actions.push({
  //     key: 'resend',
  //     label: t('resend'),
  //     icon: <Mail className="mr-2 h-4 w-4" />,
  //     onClick: handleResendClick,
  //   });
  // }

  return <Actions entity={member} actions={actions} />;
}
