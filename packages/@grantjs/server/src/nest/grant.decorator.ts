import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for Grant options (resource, action) on route handlers.
 * Used by GrantGuard when options are not passed in the constructor.
 */
export const GRANT_OPTIONS_KEY = 'grant:options';

/**
 * Options for the Grant guard (resource, action; resourceResolver only via guard constructor).
 */
export interface GrantOptions {
  /** The resource slug to check (e.g., "Organization", "Project", "Document") */
  resource: string;
  /** The action to check (e.g., "Query", "Create", "Update", "Delete") */
  action: string;
}

/**
 * Decorator to require a Grant permission on a route.
 * Use with GrantGuard (injected) so the guard reads resource/action from this metadata.
 *
 * @example
 * ```ts
 * @Get()
 * @Grant('Document', 'Query')
 * @UseGuards(GrantGuard)
 * list() { ... }
 *
 * @Post()
 * @Grant('Document', 'Create')
 * @UseGuards(GrantGuard)
 * create(@Body() dto: CreateDocumentDto) { ... }
 * ```
 *
 * For dynamic resource resolution (resourceResolver), use the guard with explicit options:
 * `@UseGuards(new GrantGuard(grantClient, { resource: 'Document', action: 'Update', resourceResolver: ... }))`
 */
export function Grant(resource: string, action: string): ReturnType<typeof SetMetadata>;
export function Grant(options: GrantOptions): ReturnType<typeof SetMetadata>;
export function Grant(
  resourceOrOptions: string | GrantOptions,
  action?: string
): ReturnType<typeof SetMetadata> {
  const options: GrantOptions =
    typeof resourceOrOptions === 'string' && action !== undefined
      ? { resource: resourceOrOptions, action }
      : (resourceOrOptions as GrantOptions);
  return SetMetadata(GRANT_OPTIONS_KEY, options);
}
