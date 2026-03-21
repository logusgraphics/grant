'use client';

import { useState } from 'react';

import { KeyRound, Shield, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Actions, type ActionItem } from '@/components/common/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMfaDevices, useMfaMutations } from '@/hooks/mfa';

import { SettingCard } from './setting-card';
import { SettingMfaEnrollDialog } from './setting-mfa-enroll-dialog';

export function SettingMfaDevicesCard() {
  const t = useTranslations('settings.security.mfa');
  const { devices, loading, refetch } = useMfaDevices();
  const { removeDevice, setPrimaryDevice } = useMfaMutations();
  const [openEnroll, setOpenEnroll] = useState(false);
  const [removeLastOpen, setRemoveLastOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [removeLastLoading, setRemoveLastLoading] = useState(false);

  const isLastDevice = devices.length <= 1;

  async function runRemove(deviceId: string) {
    await removeDevice(deviceId);
    await refetch();
  }

  return (
    <>
      <SettingCard
        title={t('devices.title')}
        description={t('devices.description')}
        headerActions={
          <Button onClick={() => setOpenEnroll(true)} size="sm">
            {t('devices.addDevice')}
          </Button>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('devices.loading')}</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('devices.empty')}</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.name}</p>
                      {device.isPrimary ? (
                        <Badge variant="default" className="text-xs">
                          {t('devices.primary')}
                        </Badge>
                      ) : null}
                      {device.isEnabled ? (
                        <Badge variant="secondary" className="text-xs">
                          {t('devices.verified')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {t('devices.pendingVerification')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('devices.addedOn', {
                        date: new Date(device.createdAt).toLocaleDateString(),
                      })}
                      {device.lastUsedAt
                        ? ` · ${t('devices.lastUsedOn', {
                            date: new Date(device.lastUsedAt).toLocaleDateString(),
                          })}`
                        : ''}
                    </p>
                  </div>
                </div>
                <Actions
                  entity={{ id: device.id }}
                  actions={[
                    ...(!device.isPrimary
                      ? ([
                          {
                            key: 'setPrimary',
                            label: t('devices.setPrimary'),
                            icon: <KeyRound className="mr-2 h-4 w-4" />,
                            onClick: async () => {
                              await setPrimaryDevice(device.id);
                              await refetch();
                            },
                          },
                        ] satisfies ActionItem<{ id: string }>[])
                      : []),
                    {
                      key: 'remove',
                      label: t('devices.remove'),
                      icon: <Trash2 className="mr-2 h-4 w-4" />,
                      variant: 'destructive',
                      onClick: async () => {
                        if (isLastDevice) {
                          setPendingRemoveId(device.id);
                          setRemoveLastOpen(true);
                          return;
                        }
                        await runRemove(device.id);
                      },
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </SettingCard>
      <SettingMfaEnrollDialog
        open={openEnroll}
        onOpenChange={setOpenEnroll}
        onCompleted={refetch}
      />

      <AlertDialog
        open={removeLastOpen}
        onOpenChange={(open) => {
          setRemoveLastOpen(open);
          if (!open) setPendingRemoveId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('devices.removeLastTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">{t('devices.removeLastDescription')}</span>
              <span className="block">{t('devices.removeLastOrgPolicy')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLastLoading}>
              {t('devices.removeLastCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeLastLoading}
              onClick={async () => {
                if (!pendingRemoveId) return;
                setRemoveLastLoading(true);
                try {
                  await runRemove(pendingRemoveId);
                  setPendingRemoveId(null);
                  setRemoveLastOpen(false);
                } catch {
                  // Toast / global error handling from mutation
                } finally {
                  setRemoveLastLoading(false);
                }
              }}
            >
              {removeLastLoading ? t('devices.removeLastWorking') : t('devices.removeLastConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
