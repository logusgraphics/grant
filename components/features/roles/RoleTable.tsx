'use client';

import { Shield, Group } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Role } from '@/graphql/generated/types';
import { CreateRoleDialog } from './CreateRoleDialog';
import { ColoredList } from '@/components/ui/colored-list';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RoleActions } from './RoleActions';

interface RoleTableProps {
  roles: Role[];
  loading: boolean;
  search: string;
  onEditClick: (role: Role) => void;
  onDeleteClick: (role: Role) => void;
}

export function RoleTable({ roles, loading, search, onEditClick, onDeleteClick }: RoleTableProps) {
  const t = useTranslations('roles');

  return (
    <>
      <div className="w-full px-4">
        <div className="space-y-4">
          {roles.length === 0 && !loading ? (
            <EmptyState
              icon={<Shield className="h-12 w-12" />}
              title={search ? t('noSearchResults.title') : t('noRoles.title')}
              description={search ? t('noSearchResults.description') : t('noRoles.description')}
              action={search ? undefined : <CreateRoleDialog />}
            />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.label')}</TableHead>
                    <TableHead>{t('table.description')}</TableHead>
                    <TableHead>{t('groups')}</TableHead>
                    <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {t('table.loading')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || t('noDescription')}</TableCell>
                        <TableCell>
                          <ColoredList
                            items={role.groups}
                            labelField="name"
                            title=""
                            icon={<Group className="h-3 w-3" />}
                            height={60}
                          />
                        </TableCell>
                        <TableCell>
                          <RoleActions
                            role={role}
                            onEditClick={onEditClick}
                            onDeleteClick={onDeleteClick}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
