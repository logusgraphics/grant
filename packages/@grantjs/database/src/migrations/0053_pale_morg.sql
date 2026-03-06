DROP INDEX "project_permissions_deleted_at_idx";--> statement-breakpoint
CREATE INDEX "project_permissions_deleted_at_idx" ON "project_permissions" USING btree ("deleted_at");