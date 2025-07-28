'use client';

import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ColoredList } from '@/components/ui/colored-list';
import { EmptyState } from '@/components/ui/empty-state';
import { LucideIcon, Clock, Calendar, Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Auditable } from '@/graphql/generated/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CopyToClipboard } from './CopyToClipboard';

// Generic entity interface
export interface BaseEntity extends Auditable {
  name: string;
  description?: string | null;
  [key: string]: any;
}

// Avatar configuration
export interface AvatarConfig<TEntity extends BaseEntity> {
  getInitial: (entity: TEntity) => string;
  getBackgroundClass?: (entity: TEntity) => string;
  defaultBackgroundClass?: string;
}

// List configuration
export interface ListConfig<TEntity extends BaseEntity> {
  items: (entity: TEntity) => any[];
  labelField: string;
  title: string;
  icon: LucideIcon;
  height?: number;
}

// Actions configuration
export interface ActionsConfig<TEntity extends BaseEntity> {
  component: (entity: TEntity) => ReactNode;
}

// Empty state configuration
export interface EmptyStateConfig {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  action?: ReactNode;
}

// Skeleton configuration
export interface SkeletonConfig {
  component: ReactNode;
  count: number;
}

// Audit field configuration
export interface AuditFieldConfig<TEntity extends BaseEntity> {
  key: keyof Auditable;
  icon: LucideIcon;
  translationKey: string;
  getValue: (entity: TEntity) => string;
}

export interface CardGridProps<TEntity extends BaseEntity> {
  // Data
  entities: TEntity[];
  loading: boolean;

  // Configuration
  avatar: AvatarConfig<TEntity>;
  list: ListConfig<TEntity>;
  actions: ActionsConfig<TEntity>;
  emptyState: EmptyStateConfig;
  skeleton: SkeletonConfig;

  // Translation
  translationNamespace: string;

  // Optional customizations
  gridClassName?: string;
  cardClassName?: string;
  renderCustomContent?: (entity: TEntity) => ReactNode;
  getDescription?: (entity: TEntity) => string | null | undefined;
  showAuditFields?: boolean;
  auditFields?: AuditFieldConfig<TEntity>[];
}

export function CardGrid<TEntity extends BaseEntity>({
  entities,
  loading,
  avatar,
  list,
  actions,
  emptyState,
  skeleton,
  translationNamespace,
  gridClassName,
  cardClassName,
  renderCustomContent,
  getDescription,
  showAuditFields = true,
  auditFields,
}: CardGridProps<TEntity>) {
  const t = useTranslations(translationNamespace);
  const commonT = useTranslations('common');

  const getAvatarBackground = (entity: TEntity) => {
    if (avatar.getBackgroundClass) {
      return avatar.getBackgroundClass(entity);
    }
    return avatar.defaultBackgroundClass || 'bg-primary/10';
  };

  const getEntityDescription = (entity: TEntity) => {
    if (getDescription) {
      return getDescription(entity);
    }
    return entity.description;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Default audit fields configuration
  const defaultAuditFields: AuditFieldConfig<TEntity>[] = [
    {
      key: 'id',
      icon: Fingerprint,
      translationKey: 'audit.id',
      getValue: (entity: TEntity) => entity.id,
    },
    {
      key: 'createdAt',
      icon: Calendar,
      translationKey: 'audit.created',
      getValue: (entity: TEntity) => formatTimestamp(entity.createdAt),
    },
    {
      key: 'updatedAt',
      icon: Clock,
      translationKey: 'audit.updated',
      getValue: (entity: TEntity) => formatTimestamp(entity.updatedAt),
    },
  ];

  const auditFieldsToRender = auditFields || defaultAuditFields;

  return (
    <>
      <div className="w-full p-4">
        <div className="space-y-4">
          {entities.length === 0 && !loading ? (
            <EmptyState
              icon={<emptyState.icon className="h-12 w-12" />}
              title={t(emptyState.titleKey)}
              description={t(emptyState.descriptionKey)}
              action={emptyState.action}
            />
          ) : (
            <div
              className={cn(
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
                gridClassName
              )}
            >
              {loading ? (
                <>
                  {Array.from({ length: skeleton.count }).map((_, i) => (
                    <div key={i}>{skeleton.component}</div>
                  ))}
                </>
              ) : (
                entities.map((entity) => (
                  <Card key={entity.id} className={cn('group relative h-full', cardClassName)}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
                      <div className="flex items-start gap-4 min-w-0">
                        <div
                          className={cn(
                            'h-10 w-10 shrink-0 rounded-full flex items-center justify-center',
                            getAvatarBackground(entity)
                          )}
                        >
                          <span className="text-sm font-medium text-primary">
                            {avatar.getInitial(entity)}
                          </span>
                        </div>
                        <div className="min-w-0 space-y-2">
                          <CardTitle className="text-base leading-none truncate">
                            {entity.name}
                          </CardTitle>
                          {getEntityDescription(entity) && (
                            <CardDescription className="text-sm leading-none truncate">
                              {getEntityDescription(entity)}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      {actions.component(entity)}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {renderCustomContent ? (
                        renderCustomContent(entity)
                      ) : (
                        <ColoredList
                          items={list.items(entity)}
                          labelField={list.labelField}
                          title={t(list.title)}
                          icon={<list.icon className="h-3 w-3" />}
                          height={list.height || 80}
                        />
                      )}
                    </CardContent>
                    {showAuditFields && (
                      <CardFooter className="p0 px-6">
                        <TooltipProvider>
                          <div className="w-full flex items-center gap-3 text-xs text-muted-foreground/60">
                            {auditFieldsToRender.map((field) => {
                              const IconComponent = field.icon;
                              const value = field.getValue(entity);

                              return (
                                <Tooltip key={field.key}>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <IconComponent className="h-3 w-3" />
                                      <span>{commonT(field.translationKey)}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="flex items-center gap-2">
                                    <span>{value}</span>
                                    <CopyToClipboard text={value} size="sm" variant="ghost" />
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </TooltipProvider>
                      </CardFooter>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
