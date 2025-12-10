import { DbSchema } from '@logusgraphics/grant-database';
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';

import { NotFoundError } from '@/lib/errors';
import { createModuleLogger } from '@/lib/logger';
import { Transaction } from '@/lib/transaction-manager.lib';

export interface BasePivotModel {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | null;
  [key: string]: unknown;
}

export interface BasePivotEntity extends BasePivotModel {
  [key: string]: unknown;
}

export interface BasePivotQueryArgs {
  parentId?: string;
  relatedId?: string;
}

export interface PivotIntersectionQueryArgs {
  parentIds: string[];
  relatedIds: string[];
}

export interface BasePivotAddArgs {
  parentId: string;
  relatedId: string;
  [key: string]: unknown;
}

export interface BasePivotRemoveArgs {
  parentId: string;
  relatedId: string;
}

export abstract class PivotRepository<
  TPivotModel extends BasePivotModel,
  TPivotEntity extends BasePivotEntity,
> {
  protected readonly logger = createModuleLogger('PivotRepository');
  protected abstract table: any;
  protected abstract parentIdField: keyof TPivotModel;
  protected abstract relatedIdField: keyof TPivotModel;

  protected abstract toEntity(dbPivot: TPivotModel): TPivotEntity;

  constructor(protected db: DbSchema) {}

  protected getUniquePivotFields(): Array<keyof TPivotModel> {
    return [this.parentIdField, this.relatedIdField];
  }

  protected whereUnique(
    params: BasePivotAddArgs | BasePivotRemoveArgs | Record<string, unknown>
  ): any {
    const uniqueFields = this.getUniquePivotFields();
    const conditions = uniqueFields.map((field) => {
      const fieldKey = field as string;
      const fieldValue = (params as Record<string, unknown>)[fieldKey];
      return eq(this.table[fieldKey], fieldValue);
    });
    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }

  private where({ parentId, relatedId }: BasePivotQueryArgs): any {
    const conditions = [isNull(this.table.deletedAt)];

    if (relatedId && parentId) {
      const relationCondition = and(
        eq(this.table[this.parentIdField], parentId),
        eq(this.table[this.relatedIdField], relatedId)
      );
      if (relationCondition) {
        conditions.push(relationCondition);
      }
    } else if (parentId) {
      const parentCondition = eq(this.table[this.parentIdField], parentId);
      if (parentCondition) {
        conditions.push(parentCondition);
      }
    } else if (relatedId) {
      const relatedCondition = eq(this.table[this.relatedIdField], relatedId);
      if (relatedCondition) {
        conditions.push(relatedCondition);
      }
    }

    return conditions.length === 1 ? conditions[0] : and(...conditions);
  }

  private insertValues(
    parentIdField: keyof TPivotModel,
    relatedIdField: keyof TPivotModel,
    parentId: string,
    relatedId: string,
    rest: Record<string, unknown>
  ): Record<string, unknown> {
    const uniqueFields = this.getUniquePivotFields();
    const baseValues: Record<string, unknown> = {
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    uniqueFields.forEach((field) => {
      const fieldValue = rest[field as string];
      if (fieldValue !== undefined) {
        baseValues[field as string] = fieldValue;
      }
    });

    baseValues[parentIdField as string] = parentId;
    baseValues[relatedIdField as string] = relatedId;

    return baseValues;
  }

  protected first<T>(result: T | T[]): T {
    return Array.isArray(result) ? result[0] : result;
  }

  protected async query(
    params: BasePivotQueryArgs,
    transaction?: Transaction
  ): Promise<TPivotEntity[]> {
    const dbInstance = transaction || this.db;

    try {
      const whereClause = this.where(params);

      const result = await dbInstance.select().from(this.table).where(whereClause);

      return result.map((item: TPivotModel) => this.toEntity(item));
    } catch (error) {
      this.logger.error({
        msg: 'Error querying pivot table',
        err: error,
      });
      throw error;
    }
  }

  protected async queryIntersection(
    params: PivotIntersectionQueryArgs,
    transaction?: Transaction
  ): Promise<TPivotEntity[]> {
    const dbInstance = transaction || this.db;
    const whereClause = and(
      inArray(this.table[this.parentIdField], params.parentIds),
      inArray(this.table[this.relatedIdField], params.relatedIds),
      isNull(this.table.deletedAt)
    );

    const result = await dbInstance.select().from(this.table).where(whereClause);

    return result.map((item: TPivotModel) => this.toEntity(item));
  }

  protected async add(params: BasePivotAddArgs, transaction?: Transaction): Promise<TPivotEntity> {
    const dbInstance = transaction || this.db;
    const { parentId, relatedId, ...rest } = params;
    try {
      const uniqueWhereClause = this.whereUnique(params);
      const softDeletedWhereClause = and(uniqueWhereClause, isNotNull(this.table.deletedAt));

      const existingSoftDeleted = await dbInstance
        .select()
        .from(this.table)
        .where(softDeletedWhereClause)
        .limit(1);

      if (existingSoftDeleted.length > 0) {
        const result = await dbInstance
          .update(this.table)
          .set({
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(softDeletedWhereClause)
          .returning();

        const reactivatedItem = this.first(result);
        return this.toEntity(reactivatedItem as TPivotModel);
      }

      const activeWhereClause = and(uniqueWhereClause, isNull(this.table.deletedAt));
      const existingPivot = await dbInstance
        .select()
        .from(this.table)
        .where(activeWhereClause)
        .limit(1);

      if (existingPivot.length > 0) {
        return this.toEntity(existingPivot[0]);
      }

      const insertValues = this.insertValues(
        this.parentIdField,
        this.relatedIdField,
        parentId,
        relatedId,
        rest
      );

      const result = await dbInstance.insert(this.table).values(insertValues).returning();
      const insertedItem = this.first(result);
      return this.toEntity(insertedItem as TPivotModel);
    } catch (error) {
      this.logger.error({
        msg: 'Error adding pivot relationship',
        err: error,
      });
      throw error;
    }
  }

  protected async update(
    parentId: string,
    relatedId: string,
    update: Partial<TPivotModel>,
    transaction?: Transaction
  ): Promise<TPivotEntity> {
    const dbInstance = transaction || this.db;
    const uniqueFields = this.getUniquePivotFields();
    const whereConditions = uniqueFields.map((field) => {
      let fieldValue: unknown = update[field];

      if (fieldValue === undefined) {
        if (field === this.parentIdField) {
          fieldValue = parentId;
        } else if (field === this.relatedIdField) {
          fieldValue = relatedId;
        }
      }

      return eq(this.table[field as string], fieldValue);
    });

    const updatedItem = await dbInstance
      .update(this.table)
      .set(update)
      .where(and(...whereConditions))
      .returning();
    return this.toEntity(updatedItem[0] as TPivotModel);
  }

  protected async softDelete(
    params: BasePivotRemoveArgs,
    transaction?: Transaction
  ): Promise<TPivotEntity> {
    const dbInstance = transaction || this.db;

    try {
      const uniqueWhereClause = this.whereUnique(params);
      const whereClause = and(uniqueWhereClause, isNull(this.table.deletedAt));

      const result = await dbInstance
        .update(this.table)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(whereClause)
        .returning();

      const deletedItem = this.first(result);
      if (!deletedItem) {
        throw new NotFoundError('Relationship not found', 'errors:notFound.resource');
      }

      return this.toEntity(deletedItem as TPivotModel);
    } catch (error) {
      this.logger.error({
        msg: 'Error soft deleting pivot relationship',
        err: error,
      });
      throw error;
    }
  }

  protected async hardDelete(
    params: BasePivotRemoveArgs,
    transaction?: Transaction
  ): Promise<TPivotEntity> {
    const dbInstance = transaction || this.db;

    try {
      const uniqueWhereClause = this.whereUnique(params);
      const whereClause = uniqueWhereClause;

      const result = await dbInstance.delete(this.table).where(whereClause).returning();

      const deletedItem = this.first(result);
      if (!deletedItem) {
        throw new NotFoundError('Relationship not found', 'errors:notFound.resource');
      }

      return this.toEntity(deletedItem as TPivotModel);
    } catch (error) {
      this.logger.error({
        msg: 'Error hard deleting pivot relationship',
        err: error,
      });
      throw error;
    }
  }
}
