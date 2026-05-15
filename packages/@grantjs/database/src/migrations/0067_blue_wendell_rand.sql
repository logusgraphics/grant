ALTER TABLE "project_permission_sync_job_audit_logs" RENAME TO "project_sync_job_audit_logs";--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" RENAME TO "project_sync_jobs";--> statement-breakpoint
ALTER TABLE "project_sync_job_audit_logs" RENAME COLUMN "project_permission_sync_job_id" TO "project_sync_job_id";--> statement-breakpoint
ALTER TABLE "project_sync_jobs" RENAME COLUMN "import_id" TO "job_name";--> statement-breakpoint
ALTER TABLE "project_sync_job_audit_logs" DROP CONSTRAINT "project_permission_sync_job_audit_logs_project_permission_sync_job_id_project_permission_sync_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "project_sync_jobs" DROP CONSTRAINT "project_permission_sync_jobs_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "project_sync_jobs" DROP CONSTRAINT "project_permission_sync_jobs_enqueued_by_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "project_permission_sync_job_audit_logs_job_id_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_job_audit_logs_action_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_job_audit_logs_scope_tenant_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_jobs_project_id_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_jobs_status_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_jobs_project_status_idx";--> statement-breakpoint
DROP INDEX "project_permission_sync_jobs_project_operation_job_name_unique";--> statement-breakpoint
ALTER TABLE "project_sync_job_audit_logs" ADD CONSTRAINT "project_sync_job_audit_logs_project_sync_job_id_project_sync_jobs_id_fk" FOREIGN KEY ("project_sync_job_id") REFERENCES "public"."project_sync_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sync_jobs" ADD CONSTRAINT "project_sync_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_sync_jobs" ADD CONSTRAINT "project_sync_jobs_enqueued_by_id_users_id_fk" FOREIGN KEY ("enqueued_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_sync_job_audit_logs_job_id_idx" ON "project_sync_job_audit_logs" USING btree ("project_sync_job_id");--> statement-breakpoint
CREATE INDEX "project_sync_job_audit_logs_action_idx" ON "project_sync_job_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "project_sync_job_audit_logs_scope_tenant_idx" ON "project_sync_job_audit_logs" USING btree ("scope_tenant");--> statement-breakpoint
CREATE INDEX "project_sync_jobs_project_id_idx" ON "project_sync_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_sync_jobs_status_idx" ON "project_sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_sync_jobs_project_status_idx" ON "project_sync_jobs" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_sync_jobs_project_operation_job_name_unique" ON "project_sync_jobs" USING btree ("project_id","operation","job_name") WHERE "project_sync_jobs"."job_name" IS NOT NULL AND "project_sync_jobs"."deleted_at" IS NULL AND "project_sync_jobs"."status" IN ('pending', 'running', 'completed');