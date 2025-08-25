import { GraphQLResolveInfo, FieldNode } from 'graphql';

export function getDirectFieldSelection(info: GraphQLResolveInfo, path: string[] = []): string[] {
  const selections = info.fieldNodes[0]?.selectionSet?.selections || [];

  function traverseSelections(selections: readonly any[], currentPath: string[]): string[] {
    const result: string[] = [];

    for (const selection of selections) {
      if (selection.kind === 'Field') {
        const fieldNode = selection as FieldNode;
        const fieldName = fieldNode.name.value;

        if (currentPath.length === 0) {
          if (!fieldNode.selectionSet || fieldNode.selectionSet.selections.length === 0) {
            result.push(fieldName);
          }
        } else if (fieldName === currentPath[0] && fieldNode.selectionSet) {
          const nestedFields = traverseSelections(
            fieldNode.selectionSet.selections,
            currentPath.slice(1)
          );
          result.push(...nestedFields);
        }
      }
    }

    return result;
  }

  return traverseSelections(selections, path);
}
