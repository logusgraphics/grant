ALTER TABLE "organization_users" ADD COLUMN "role_id" uuid;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Backfill role_id from user_roles ∩ organization_roles; prefer Owner > Admin > Dev > Viewer; fallback to org's Viewer role
UPDATE organization_users ou
SET role_id = COALESCE(
  (
    SELECT ur.role_id
    FROM user_roles ur
    INNER JOIN organization_roles orel ON orel.role_id = ur.role_id AND orel.organization_id = ou.organization_id AND orel.deleted_at IS NULL
    INNER JOIN roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
    WHERE ur.user_id = ou.user_id AND ur.deleted_at IS NULL
    ORDER BY CASE r.name
      WHEN 'Organization Owner' THEN 1
      WHEN 'Organization Admin' THEN 2
      WHEN 'Organization Dev' THEN 3
      WHEN 'Organization Viewer' THEN 4
      ELSE 5
    END
    LIMIT 1
  ),
  (
    SELECT orel2.role_id
    FROM organization_roles orel2
    INNER JOIN roles r2 ON r2.id = orel2.role_id AND r2.name = 'Organization Viewer' AND r2.deleted_at IS NULL
    WHERE orel2.organization_id = ou.organization_id AND orel2.deleted_at IS NULL
    LIMIT 1
  )
)
WHERE ou.deleted_at IS NULL AND ou.role_id IS NULL;--> statement-breakpoint
ALTER TABLE "organization_users" ALTER COLUMN "role_id" SET NOT NULL;--> statement-breakpoint
