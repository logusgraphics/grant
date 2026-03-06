/** Subset of selected fields requested by GraphQL field selection */
export type SelectedFields<T> = { requestedFields?: Array<keyof T> };

/** Optional params for delete operations (e.g. hard vs soft delete) */
export interface DeleteParams {
  hardDelete?: boolean | null;
}
