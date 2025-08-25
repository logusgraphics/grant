#!/usr/bin/env tsx

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface ValidationResult {
  service: string;
  usesCommonSchemas: boolean;
  missingImports: string[];
  duplicateDefinitions: string[];
  issues: string[];
}

const COMMON_SCHEMAS = [
  'idSchema',
  'emailSchema',
  'nameSchema',
  'descriptionSchema',
  'limitSchema',
  'pageSchema',
  'searchSchema',
  'actionSchema',
  'tenantSchema',
  'scopeSchema',
  'sortOrderSchema',
  'colorSchema',
  'slugSchema',
  'createdAtSchema',
  'updatedAtSchema',
  'deletedAtSchema',
  'entityIdSchema',
  'paginationSchema',
  'searchFilterSchema',
  'sortSchema',
  'createInputSchema',
  'updateInputSchema',
  'deleteInputSchema',
  'addRelationshipInputSchema',
  'removeRelationshipInputSchema',
  'baseEntitySchema',
  'namedEntitySchema',
  'paginatedResponseSchema',
  'crudParamsSchema',
  'sortableParamsSchema',
  'nonEmptyStringRefinement',
  'nonEmptyStringMessage',
  'nonEmptyNameSchema',
  'nonEmptyEmailSchema',
  'nonEmptyActionSchema',
];

const COMMON_IMPORT_PATTERN = /from ['"]\.\.\/common\/schemas['"]/;

async function validateServiceSchemas(servicePath: string): Promise<ValidationResult> {
  const serviceName = servicePath.split('/').pop() || 'unknown';
  const schemasPath = join(servicePath, 'schemas.ts');

  try {
    const content = await readFile(schemasPath, 'utf-8');
    const usesCommonSchemas = COMMON_IMPORT_PATTERN.test(content);

    const missingImports: string[] = [];
    const duplicateDefinitions: string[] = [];
    const issues: string[] = [];

    // Check for common patterns that should use common schemas
    if (!usesCommonSchemas) {
      // Look for patterns that suggest common schemas should be used
      if (content.includes('z.string().min(1,') && !content.includes('idSchema')) {
        missingImports.push('idSchema');
      }
      if (
        content.includes('z.string().min(1,') &&
        content.includes('name') &&
        !content.includes('nameSchema')
      ) {
        missingImports.push('nameSchema');
      }
      if (
        content.includes('z.number().min(1)') &&
        content.includes('max(100)') &&
        !content.includes('limitSchema')
      ) {
        missingImports.push('limitSchema');
      }
      if (content.includes("z.enum(['ASC', 'DESC'])") && !content.includes('sortOrderSchema')) {
        missingImports.push('sortOrderSchema');
      }
    }

    // Check for duplicate definitions
    if (content.includes('z.object({') && content.includes('id: z.string()')) {
      duplicateDefinitions.push('baseEntitySchema');
    }

    if (
      content.includes('z.object({') &&
      content.includes('totalCount: z.number()') &&
      content.includes('hasNextPage: z.boolean()')
    ) {
      duplicateDefinitions.push('paginatedResponseSchema');
    }

    return {
      service: serviceName,
      usesCommonSchemas,
      missingImports,
      duplicateDefinitions,
      issues,
    };
  } catch (error) {
    return {
      service: serviceName,
      usesCommonSchemas: false,
      missingImports: [],
      duplicateDefinitions: [],
      issues: [`Could not read schemas file: ${error}`],
    };
  }
}

async function main() {
  const servicesPath = join(process.cwd(), 'graphql', 'services');
  const services = await readdir(servicesPath, { withFileTypes: true });

  const results: ValidationResult[] = [];

  for (const service of services) {
    if (service.isDirectory() && service.name !== 'common') {
      const servicePath = join(servicesPath, service.name);
      const result = await validateServiceSchemas(servicePath);
      results.push(result);
    }
  }

  console.log('🔍 Schema Validation Results\n');

  const compliantServices = results.filter(
    (r) => r.usesCommonSchemas && r.missingImports.length === 0
  );
  const nonCompliantServices = results.filter(
    (r) => !r.usesCommonSchemas || r.missingImports.length > 0
  );

  console.log(`✅ Compliant Services: ${compliantServices.length}/${results.length}`);
  console.log(`❌ Non-Compliant Services: ${nonCompliantServices.length}/${results.length}\n`);

  if (nonCompliantServices.length > 0) {
    console.log('❌ Issues Found:');
    nonCompliantServices.forEach((result) => {
      console.log(`\n📁 ${result.service}:`);
      if (!result.usesCommonSchemas) {
        console.log('  - Not importing from common schemas');
      }
      if (result.missingImports.length > 0) {
        console.log(`  - Missing imports: ${result.missingImports.join(', ')}`);
      }
      if (result.duplicateDefinitions.length > 0) {
        console.log(`  - Duplicate definitions: ${result.duplicateDefinitions.join(', ')}`);
      }
      result.issues.forEach((issue) => console.log(`  - ${issue}`));
    });
  } else {
    console.log('🎉 All services are compliant with common schema usage!');
  }

  console.log('\n📊 Summary:');
  console.log(`- Total services: ${results.length}`);
  console.log(`- Using common schemas: ${results.filter((r) => r.usesCommonSchemas).length}`);
  console.log(
    `- Missing common imports: ${results.reduce((sum, r) => sum + r.missingImports.length, 0)}`
  );
  console.log(
    `- Duplicate definitions: ${results.reduce((sum, r) => sum + r.duplicateDefinitions.length, 0)}`
  );
}

if (require.main === module) {
  main().catch(console.error);
}
