DROP INDEX "project_users_deleted_at_idx";--> statement-breakpoint
CREATE INDEX "project_users_deleted_at_idx" ON "project_users" USING btree ("deleted_at");