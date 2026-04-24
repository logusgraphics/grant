import type { IProjectUserRepository } from '@grantjs/core';
import {
  projectRoles,
  projects,
  ProjectUserModel,
  projectUsers,
  roles,
  userRoles,
} from '@grantjs/database';
import {
  AddProjectUserInput,
  ProjectUser,
  QueryProjectUsersInput,
  RemoveProjectUserInput,
} from '@grantjs/schema';
import { and, eq, isNull } from 'drizzle-orm';

import { mergeCdmImporterMetadata } from '@/constants/cdm-import.constants';
import { NotFoundError } from '@/lib/errors';
import { Transaction } from '@/lib/transaction-manager.lib';
import { PivotRepository } from '@/repositories/common';

export class ProjectUserRepository
  extends PivotRepository<ProjectUserModel, ProjectUser>
  implements IProjectUserRepository
{
  protected table = projectUsers;
  protected uniqueIndexFields: Array<keyof ProjectUserModel> = ['projectId', 'userId'];

  protected toEntity(dbProjectUser: ProjectUserModel): ProjectUser {
    const md = dbProjectUser.metadata;
    const metadata =
      md != null && typeof md === 'object' && !Array.isArray(md)
        ? (md as Record<string, unknown>)
        : {};
    return { ...dbProjectUser, metadata } as ProjectUser;
  }

  public async getProjectUsers(
    params: QueryProjectUsersInput,
    transaction?: Transaction
  ): Promise<ProjectUser[]> {
    return this.query(params, transaction);
  }

  public async addProjectUser(
    params: AddProjectUserInput,
    transaction?: Transaction
  ): Promise<ProjectUser> {
    return this.add(
      {
        projectId: params.projectId,
        userId: params.userId,
        metadata: params.metadata !== undefined && params.metadata !== null ? params.metadata : {},
      },
      transaction
    );
  }

  public async mergeProjectUserCdmMetadata(
    params: {
      projectId: string;
      userId: string;
      importerMetadata: Record<string, unknown> | null | undefined;
    },
    transaction?: Transaction
  ): Promise<ProjectUser> {
    const rows = await this.getProjectUsers(
      { projectId: params.projectId, userId: params.userId },
      transaction
    );
    if (rows.length === 0) {
      throw new NotFoundError('ProjectUser');
    }
    const raw = rows[0].metadata;
    const current =
      raw != null && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
    const merged = mergeCdmImporterMetadata(current, params.importerMetadata);
    return this.update(
      { projectId: params.projectId, userId: params.userId },
      { metadata: merged, updatedAt: new Date() },
      transaction
    );
  }

  public async softDeleteProjectUser(
    params: RemoveProjectUserInput,
    transaction?: Transaction
  ): Promise<ProjectUser> {
    return this.softDelete(params, transaction);
  }

  public async hardDeleteProjectUser(
    params: RemoveProjectUserInput,
    transaction?: Transaction
  ): Promise<ProjectUser> {
    return this.hardDelete(params, transaction);
  }

  public async getProjectUserMemberships(
    userId: string,
    transaction?: Transaction
  ): Promise<
    Array<{
      projectId: string;
      projectName: string;
      role: string;
      joinedAt: Date;
    }>
  > {
    const dbInstance = transaction || this.db;

    const membershipsData = await dbInstance
      .select({
        projectId: projects.id,
        projectName: projects.name,
        roleName: roles.name,
        joinedAt: projectUsers.createdAt,
      })
      .from(projectUsers)
      .innerJoin(projects, eq(projectUsers.projectId, projects.id))
      .leftJoin(userRoles, and(eq(userRoles.userId, userId), isNull(userRoles.deletedAt)))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(
        projectRoles,
        and(
          eq(projectRoles.projectId, projectUsers.projectId),
          eq(projectRoles.roleId, roles.id),
          isNull(projectRoles.deletedAt)
        )
      )
      .where(
        and(
          eq(projectUsers.userId, userId),
          isNull(projectUsers.deletedAt),
          isNull(projects.deletedAt)
        )
      );

    const membershipMap = new Map<
      string,
      { projectId: string; projectName: string; role: string; joinedAt: Date }
    >();

    for (const membership of membershipsData) {
      const roleName = membership.roleName;
      if (roleName && !membershipMap.has(membership.projectId)) {
        membershipMap.set(membership.projectId, {
          projectId: membership.projectId,
          projectName: membership.projectName,
          role: roleName,
          joinedAt: membership.joinedAt,
        });
      }
    }

    return Array.from(membershipMap.values());
  }
}
