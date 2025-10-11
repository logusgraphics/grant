export * from './validation';
export * from './schemas';
export * from './audit-service';
export * from './dynamic-schemas';

export type DeleteParams = {
  hardDelete?: boolean;
};

export type SelectedFields<T> = {
  requestedFields?: Array<keyof T>;
};
