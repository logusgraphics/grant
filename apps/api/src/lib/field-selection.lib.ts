import { GraphQLResolveInfo } from 'graphql';

export function getDirectFieldSelection<T extends string = string>(
  info: GraphQLResolveInfo,
  path?: string[]
): T[] {
  const fieldNode = info.fieldNodes[0];
  if (!fieldNode?.selectionSet) {
    return [];
  }

  let selections = fieldNode.selectionSet.selections;

  if (path && path.length > 0) {
    for (const segment of path) {
      const field = selections.find(
        (s: any) => s.kind === 'Field' && s.name.value === segment
      ) as any;

      if (!field?.selectionSet) {
        return [];
      }

      selections = field.selectionSet.selections;
    }
  }

  return selections
    .filter((selection: any) => selection.kind === 'Field')
    .map((selection: any) => selection.name.value as T);
}

export function parseRelations<TEntity>(
  relations?: string[] | string | null
): Array<keyof TEntity> | undefined {
  if (!relations || (Array.isArray(relations) && relations.length === 0)) {
    return undefined;
  }

  const relationArray = Array.isArray(relations) ? relations : relations.split(',');
  const cleanedRelations = relationArray.map((r) => r.trim()).filter((r) => r.length > 0) as Array<
    keyof TEntity
  >;

  return cleanedRelations.length > 0 ? cleanedRelations : undefined;
}
