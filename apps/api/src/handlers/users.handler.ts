import type {
  IFileStorageServicePort,
  IOrganizationUserService,
  IProjectUserService,
  ITransactionalConnection,
  IUserAuthenticationMethodService,
  IUserRoleService,
  IUserService,
  IUserTagService,
} from '@grantjs/core';
import {
  MutationCreateUserArgs,
  MutationDeleteUserArgs,
  MutationUpdateUserArgs,
  QueryUsersArgs,
  Role,
  Scope,
  Tag,
  Tenant,
  UpdateUserInput,
  UploadUserPictureInput,
  User,
  UserPage,
} from '@grantjs/schema';

import { IEntityCacheAdapter } from '@/lib/cache';
import {
  isParentProjectScopeForPivotWrites,
  isProjectScopedUserMetadataTenant,
  isUnsupportedProjectUserMutationLeafTenant,
  mergeEffectiveUserMetadataForProject,
  mergeEffectiveUserProfileForProject,
  toMetadataRecord,
} from '@/lib/effective-project-user-metadata.lib';
import { AuthorizationError, BadRequestError, NotFoundError } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { assertProjectPivotMetadataMutationAllowed } from '@/lib/project-pivot-metadata-auth.lib';
import { Transaction } from '@/lib/transaction-manager.lib';
import { DeleteParams, SelectedFields } from '@/types';

import { CacheHandler, type ScopeServices } from './base/cache-handler';

export type UpdateUserHandlerParams = MutationUpdateUserArgs & { actorUserId: string };

export type UploadUserPictureHandlerParams = UploadUserPictureInput & { actorUserId: string };

export class UserHandler extends CacheHandler {
  protected readonly logger = createLogger('UserHandler');

  constructor(
    private readonly userTags: IUserTagService,
    private readonly users: IUserService,
    private readonly organizationUsers: IOrganizationUserService,
    private readonly projectUsers: IProjectUserService,
    private readonly userRoles: IUserRoleService,
    private readonly userAuthenticationMethods: IUserAuthenticationMethodService,
    private readonly fileStorage: IFileStorageServicePort,
    cache: IEntityCacheAdapter,
    scopeServices: ScopeServices,
    private readonly db: ITransactionalConnection<Transaction>
  ) {
    super(cache, scopeServices);
  }

  /**
   * Users with authentication methods manage their own global/pivot identity.
   * Admin-managed users (no auth methods) may be edited by admins with permission.
   */
  private assertSelfManagedIdentityMutationAllowed(
    actorUserId: string,
    targetUserId: string,
    targetHasAuthenticationMethods: boolean
  ): void {
    if (targetHasAuthenticationMethods && actorUserId !== targetUserId) {
      throw new AuthorizationError('Cannot modify another user identity for self-managed users');
    }
  }

  public async getUsers(params: QueryUsersArgs & SelectedFields<User>): Promise<UserPage> {
    const { scope, page, limit, sort, search, ids, tagIds, requestedFields } = params;

    let userIds = await this.getScopedUserIds(scope);

    if (tagIds && tagIds.length > 0) {
      const userTags = await this.userTags.getUserTagIntersection(userIds, tagIds);
      userIds = userTags
        .filter(({ userId, tagId }) => userIds.includes(userId) && tagIds.includes(tagId))
        .map(({ userId }) => userId);
    }

    if (ids && ids.length > 0) {
      userIds = ids.filter((userId) => userIds.includes(userId));
    }

    if (userIds.length === 0) {
      return {
        users: [],
        totalCount: 0,
        hasNextPage: false,
      };
    }

    const usersResult = await this.users.getUsers({
      ids: userIds,
      page,
      limit,
      sort,
      search,
      requestedFields,
    });

    const fieldList = requestedFields as Array<keyof User> | undefined;
    const wantsMetadata = !fieldList?.length || fieldList.includes('metadata' as keyof User);
    const wantsName = !fieldList?.length || fieldList.includes('name' as keyof User);
    const wantsPicture = !fieldList?.length || fieldList.includes('pictureUrl' as keyof User);

    if (
      isProjectScopedUserMetadataTenant(scope.tenant) &&
      (wantsMetadata || wantsName || wantsPicture)
    ) {
      const projectId = this.extractProjectIdFromScope(scope);
      const pivots = await this.projectUsers.getProjectUsers({ projectId });
      const pivotByUserId = new Map(pivots.map((pu) => [pu.userId, pu]));
      usersResult.users = usersResult.users.map((u) => {
        const pu = pivotByUserId.get(u.id);
        const next: User = { ...u };
        if (wantsMetadata) {
          next.metadata = mergeEffectiveUserMetadataForProject(
            toMetadataRecord(u.metadata),
            toMetadataRecord(pu?.metadata)
          );
        }
        if (wantsName || wantsPicture) {
          const merged = mergeEffectiveUserProfileForProject(
            u.name,
            u.pictureUrl,
            pu?.displayName,
            pu?.pictureUrl
          );
          if (wantsName) {
            next.name = merged.name;
          }
          if (wantsPicture) {
            next.pictureUrl = merged.pictureUrl ?? null;
          }
        }
        return next;
      });
    }

    return usersResult;
  }

  public async createUser(params: MutationCreateUserArgs): Promise<User> {
    return await this.db.withTransaction(async (tx: Transaction) => {
      const { input } = params;
      const { name, scope, tagIds, roleIds, primaryTagId, metadata: inputMetadata } = input;

      const metadataRecord =
        inputMetadata != null && typeof inputMetadata === 'object' && !Array.isArray(inputMetadata)
          ? (inputMetadata as Record<string, unknown>)
          : undefined;

      const user =
        scope.tenant === Tenant.Organization
          ? await this.users.createUser(
              {
                name,
                ...(metadataRecord !== undefined ? { metadata: metadataRecord } : {}),
              },
              tx
            )
          : await this.users.createUser({ name }, tx);
      const { id: userId } = user;

      let invalidatePivotAuth = false;
      switch (scope.tenant) {
        case Tenant.Organization: {
          const roleId = roleIds?.[0];
          if (!roleId) {
            throw new BadRequestError('Organization scope requires at least one role');
          }
          await this.organizationUsers.addOrganizationUser(
            { organizationId: scope.id, userId, roleId },
            tx
          );
          break;
        }
        case Tenant.OrganizationProject:
        case Tenant.AccountProject: {
          const projectId = this.extractProjectIdFromScope(scope);
          await this.projectUsers.addProjectUser(
            {
              projectId,
              userId,
              ...(metadataRecord !== undefined ? { metadata: metadataRecord } : {}),
            },
            tx
          );
          if (metadataRecord !== undefined) {
            invalidatePivotAuth = true;
          }
          break;
        }
      }

      // For non-organization scope, assign roles via user_roles; org role is stored on organization_users.role_id only
      if (roleIds && roleIds.length > 0 && scope.tenant !== Tenant.Organization) {
        await Promise.all(
          roleIds.map((roleId) => this.userRoles.addUserRole({ userId, roleId }, tx))
        );
      }

      if (tagIds && tagIds.length > 0) {
        await Promise.all(
          tagIds.map((tagId) =>
            this.userTags.addUserTag({ userId, tagId, isPrimary: tagId === primaryTagId }, tx)
          )
        );
      }

      this.addUserIdToScopeCache(scope, userId);

      if (invalidatePivotAuth) {
        await this.invalidateAuthorizationResultsForUser(userId);
      }

      return user;
    });
  }

  public async updateUser(params: UpdateUserHandlerParams): Promise<User> {
    const { id: userId, input, actorUserId } = params;
    const { roleIds, tagIds, primaryTagId, scope, metadata, name, pictureUrl } = input;

    await this.db.withTransaction(async (tx: Transaction) => {
      const authMethods = await this.userAuthenticationMethods.getUserAuthenticationMethods(
        { userId },
        tx
      );
      const targetHasAuthenticationMethods = authMethods.length > 0;

      const touchesLeafRestrictedFields =
        metadata !== undefined || name !== undefined || pictureUrl !== undefined;

      const leafUnsupported = isUnsupportedProjectUserMutationLeafTenant(scope.tenant);
      if (leafUnsupported && touchesLeafRestrictedFields) {
        throw new BadRequestError(
          'User profile and metadata updates require an OrganizationProject or AccountProject scope'
        );
      }

      const isParentProject = isParentProjectScopeForPivotWrites(scope.tenant);

      const isProjectPivotMeta =
        isParentProject &&
        metadata !== undefined &&
        metadata !== null &&
        typeof metadata === 'object' &&
        !Array.isArray(metadata);

      const updatingPivotProfile =
        isParentProject && (name !== undefined || pictureUrl !== undefined);

      const touchesProfileIdentity = name !== undefined || pictureUrl !== undefined;
      if (touchesProfileIdentity) {
        this.assertSelfManagedIdentityMutationAllowed(
          actorUserId,
          userId,
          targetHasAuthenticationMethods
        );
      }

      if (isProjectPivotMeta) {
        assertProjectPivotMetadataMutationAllowed(
          actorUserId,
          userId,
          targetHasAuthenticationMethods
        );
      }

      if (metadata !== undefined && !isProjectPivotMeta) {
        this.assertSelfManagedIdentityMutationAllowed(
          actorUserId,
          userId,
          targetHasAuthenticationMethods
        );
      }

      let currentTagIds: string[] = [];
      let currentRoleIds: string[] = [];
      if (Array.isArray(tagIds)) {
        currentTagIds = await this.getUserTagIdsInScope(userId, scope);
      }
      if (Array.isArray(roleIds)) {
        currentRoleIds = await this.getUserRoleIdsInScope(userId, scope);
      }

      let shouldInvalidateAuth = false;

      if (isProjectPivotMeta) {
        const projectId = this.extractProjectIdFromScope(scope);
        await this.projectUsers.updateProjectUserMetadata(
          {
            projectId,
            userId,
            metadata: metadata as Record<string, unknown>,
          },
          tx
        );
        shouldInvalidateAuth = true;
      }

      if (updatingPivotProfile) {
        const projectId = this.extractProjectIdFromScope(scope);
        await this.projectUsers.updateProjectUserProfile(
          {
            projectId,
            userId,
            ...(name !== undefined ? { displayName: name } : {}),
            ...(pictureUrl !== undefined ? { pictureUrl } : {}),
          },
          tx
        );
        shouldInvalidateAuth = true;
      }

      const usersRowPatch: Omit<UpdateUserInput, 'scope'> = {};
      if (!isProjectPivotMeta && metadata !== undefined) {
        usersRowPatch.metadata = metadata;
      }
      if (!isParentProject) {
        if (name !== undefined) {
          usersRowPatch.name = name;
        }
        if (pictureUrl !== undefined) {
          usersRowPatch.pictureUrl = pictureUrl;
        }
      }
      if (roleIds !== undefined) {
        usersRowPatch.roleIds = roleIds;
      }
      if (tagIds !== undefined) {
        usersRowPatch.tagIds = tagIds;
      }
      if (primaryTagId !== undefined) {
        usersRowPatch.primaryTagId = primaryTagId;
      }

      await this.users.updateUser(userId, usersRowPatch, tx);

      if (Array.isArray(tagIds)) {
        const newTagIds = tagIds.filter((tagId) => !currentTagIds.includes(tagId));
        const removedTagIds = currentTagIds.filter((tagId) => !tagIds.includes(tagId));
        const updatedTagIds = tagIds.filter((tagId) => currentTagIds.includes(tagId));
        await Promise.all(
          newTagIds.map((tagId) =>
            this.userTags.addUserTag({ userId, tagId, isPrimary: tagId === primaryTagId }, tx)
          )
        );
        await Promise.all(
          removedTagIds.map((tagId) => this.userTags.removeUserTag({ userId, tagId }, tx))
        );
        await Promise.all(
          updatedTagIds.map((tagId) =>
            this.userTags.updateUserTag({ userId, tagId, isPrimary: tagId === primaryTagId }, tx)
          )
        );
      }
      if (Array.isArray(roleIds)) {
        const newRoleIds = roleIds.filter((roleId) => !currentRoleIds.includes(roleId));
        const removedRoleIds = currentRoleIds.filter((roleId) => !roleIds.includes(roleId));
        await Promise.all(
          newRoleIds.map((roleId) => this.userRoles.addUserRole({ userId, roleId }, tx))
        );
        await Promise.all(
          removedRoleIds.map((roleId) => this.userRoles.removeUserRole({ userId, roleId }, tx))
        );

        if (newRoleIds.length > 0 || removedRoleIds.length > 0) {
          await this.invalidateProjectUserRoleCache(userId);
        }
      }

      if (shouldInvalidateAuth) {
        await this.invalidateAuthorizationResultsForUser(userId);
      }
    });

    const merged = await this.getUsers({
      ids: [userId],
      limit: 1,
      scope,
      page: 1,
      search: null,
    });
    const user = merged.users[0];
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }

  public async deleteUser(params: MutationDeleteUserArgs & DeleteParams): Promise<User> {
    return await this.db.withTransaction(async (tx: Transaction) => {
      const userId = params.id;
      const scope = params.scope;

      switch (scope.tenant) {
        case Tenant.Organization: {
          const [scopedTagIds, scopedRoleIds] = await Promise.all([
            this.getUserTagIdsInScope(userId, scope),
            this.getUserRoleIdsInScope(userId, scope),
          ]);
          await this.organizationUsers.removeOrganizationUser(
            { organizationId: scope.id, userId },
            tx
          );
          await Promise.all([
            ...scopedTagIds.map((tagId) => this.userTags.removeUserTag({ userId, tagId }, tx)),
            ...scopedRoleIds.map((roleId) => this.userRoles.removeUserRole({ userId, roleId }, tx)),
          ]);
          await this.removeUserIdFromScopeCache(scope, userId);
          const page = await this.users.getUsers({ ids: [userId], limit: 1 });
          const removedFromOrg = page.users?.[0];
          if (!removedFromOrg) {
            throw new NotFoundError('User');
          }
          return removedFromOrg;
        }
        case Tenant.OrganizationProject:
        case Tenant.AccountProject: {
          const projectId = this.extractProjectIdFromScope(scope);
          await this.projectUsers.removeProjectUser({ projectId, userId }, tx);
          await this.invalidateProjectUserRoleCache(userId);
          await this.removeUserIdFromScopeCache(scope, userId);
          const page = await this.users.getUsers({ ids: [userId], limit: 1 });
          const user = page.users?.[0];
          if (!user) {
            throw new NotFoundError('User');
          }
          return user;
        }
        default:
          throw new BadRequestError(`Unsupported tenant type: ${scope.tenant}`);
      }
    });
  }

  private async invalidateProjectUserRoleCache(userId: string): Promise<void> {
    const projectUsers = await this.projectUsers.getProjectUsers({ userId });
    const projectIds = projectUsers.map((pu) => pu.projectId);

    await Promise.all(
      projectIds.map(async (projectId) => {
        const scope: Scope = {
          tenant: Tenant.ProjectUser,
          id: `${projectId}:${userId}`,
        };
        await this.invalidateRolesCacheForScope(scope);
      })
    );
  }

  public async getUserTags(params: { userId: string } & SelectedFields<User>): Promise<Array<Tag>> {
    const { userId, requestedFields } = params;
    const usersPage = await this.users.getUsers({ ids: [userId], requestedFields });
    if (Array.isArray(usersPage.users) && usersPage.users.length > 0) {
      return usersPage.users[0].tags || [];
    }
    return [];
  }

  /**
   * Returns role IDs that the user has in the given scope (project or organization).
   * Used by User.roles field resolver to avoid leaking global roles.
   */
  private async getUserTagIdsInScope(userId: string, scope: Scope): Promise<string[]> {
    const [scopedTagIds, userTags] = await Promise.all([
      this.getScopedTagIds(scope),
      this.userTags.getUserTags({ userId }),
    ]);
    const scopeTagIdSet = new Set(scopedTagIds);
    return userTags.map((ut) => ut.tagId).filter((tagId) => scopeTagIdSet.has(tagId));
  }

  public async getUserRoleIdsInScope(userId: string, scope: Scope): Promise<string[]> {
    switch (scope.tenant) {
      case Tenant.Account:
        return [];
      case Tenant.Organization: {
        const orgUsers = await this.scopeServices.organizationUsers.getOrganizationUsers({
          organizationId: scope.id,
          userId,
        });
        return orgUsers.length > 0 && orgUsers[0].roleId ? [orgUsers[0].roleId] : [];
      }
      case Tenant.OrganizationProject:
      case Tenant.AccountProject:
      case Tenant.OrganizationProjectUser:
      case Tenant.AccountProjectUser: {
        const projectId = this.extractProjectIdFromScope(scope);
        const [projectRoles, userRoleRows] = await Promise.all([
          this.scopeServices.projectRoles.getProjectRoles({ projectId }),
          this.scopeServices.userRoles.getUserRoles({ userId }),
        ]);
        const scopeRoleIds = new Set(projectRoles.map((pr) => pr.roleId));
        return userRoleRows.map((ur) => ur.roleId).filter((roleId) => scopeRoleIds.has(roleId));
      }
      default:
        return [];
    }
  }

  public async getUserRoles(
    params: { userId: string } & SelectedFields<User>
  ): Promise<Array<Role>> {
    const { userId, requestedFields } = params;
    const usersPage = await this.users.getUsers({ ids: [userId], requestedFields });
    if (Array.isArray(usersPage.users) && usersPage.users.length > 0) {
      return usersPage.users[0].roles || [];
    }
    return [];
  }

  public async uploadUserPicture(
    params: UploadUserPictureHandlerParams
  ): Promise<{ url: string; path: string }> {
    const { userId, file, contentType, filename, scope, actorUserId } = params;

    if (isUnsupportedProjectUserMutationLeafTenant(scope.tenant)) {
      throw new BadRequestError(
        'Picture upload requires an OrganizationProject or AccountProject scope'
      );
    }

    const authMethods = await this.userAuthenticationMethods.getUserAuthenticationMethods({
      userId,
    });
    const targetHasAuthenticationMethods = authMethods.length > 0;
    this.assertSelfManagedIdentityMutationAllowed(
      actorUserId,
      userId,
      targetHasAuthenticationMethods
    );

    const fileBuffer = this.fileStorage.validateAndDecodeUpload({
      file,
      contentType,
      filename,
    });

    const storagePath = this.fileStorage.sanitizeExtensionAndGeneratePath(
      filename,
      `users/${userId}/picture`
    );

    return await this.db.withTransaction(async (tx: Transaction) => {
      const result = await this.fileStorage.upload(fileBuffer, storagePath, {
        contentType,
        public: true,
      });

      if (isParentProjectScopeForPivotWrites(scope.tenant)) {
        const projectId = this.extractProjectIdFromScope(scope);
        await this.projectUsers.updateProjectUserProfile(
          { projectId, userId, pictureUrl: result.url },
          tx
        );
        await this.invalidateAuthorizationResultsForUser(userId);
      } else {
        await this.users.updateUser(userId, { pictureUrl: result.url }, tx);
      }

      return {
        url: result.url,
        path: result.path,
      };
    });
  }
}
