import type { GraphqlContext } from '@/graphql/types';

/**
 * GraphQL codegen types field resolvers as a broad union (function vs { resolve }).
 * Tests call the exported async function directly; narrow with this helper.
 */
export function invokeFieldResolver<TResult>(
  resolver: unknown,
  parent: { id: string },
  context: GraphqlContext
): Promise<TResult> {
  const fn = resolver as (
    parent: { id: string },
    args: Record<PropertyKey, never>,
    context: GraphqlContext
  ) => Promise<TResult>;
  return fn(parent, {}, context);
}

/** Root query/mutation resolvers (parent + args + context + info). */
export function invokeRootResolver<TResult, TArgs = unknown>(
  resolver: unknown,
  args: TArgs,
  context: GraphqlContext
): Promise<TResult> {
  const fn = resolver as (
    parent: Record<PropertyKey, never>,
    args: TArgs,
    context: GraphqlContext,
    info: unknown
  ) => Promise<TResult>;
  return fn({}, args, context, {});
}

export function invokeProjectAppTagsResolver<TResult>(
  resolver: unknown,
  parent: { id: string; tags?: unknown },
  context: GraphqlContext
): Promise<TResult> {
  const fn = resolver as (
    parent: { id: string; tags?: unknown },
    args: Record<PropertyKey, never>,
    context: GraphqlContext
  ) => Promise<TResult>;
  return fn(parent, {}, context);
}
