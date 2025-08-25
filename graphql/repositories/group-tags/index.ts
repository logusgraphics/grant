import { GroupTagRepository } from './repository';

export type { IGroupTagRepository } from './interface';
export * from './schema';

export const groupTagRepository = new GroupTagRepository();
