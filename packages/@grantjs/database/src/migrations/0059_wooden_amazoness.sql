CREATE TABLE "project_permission_sync_job_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_permission_sync_job_id" uuid,
	"action" varchar(50) NOT NULL,
	"old_values" varchar(1000),
	"new_values" varchar(1000),
	"metadata" varchar(1000),
	"performed_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scope_tenant" varchar(50),
	"scope_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "project_permission_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scope_tenant" varchar(50) NOT NULL,
	"scope_id" varchar(255) NOT NULL,
	"cdm_version" integer NOT NULL,
	"import_id" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error_message" text,
	"error_details" jsonb,
	"cancel_requested_at" timestamp,
	"enqueued_by_id" uuid NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_permission_sync_job_audit_logs" ADD CONSTRAINT "project_permission_sync_job_audit_logs_project_permission_sync_job_id_project_permission_sync_jobs_id_fk" FOREIGN KEY ("project_permission_sync_job_id") REFERENCES "public"."project_permission_sync_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" ADD CONSTRAINT "project_permission_sync_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" ADD CONSTRAINT "project_permission_sync_jobs_enqueued_by_id_users_id_fk" FOREIGN KEY ("enqueued_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_permission_sync_job_audit_logs_job_id_idx" ON "project_permission_sync_job_audit_logs" USING btree ("project_permission_sync_job_id");--> statement-breakpoint
CREATE INDEX "project_permission_sync_job_audit_logs_action_idx" ON "project_permission_sync_job_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "project_permission_sync_job_audit_logs_scope_tenant_idx" ON "project_permission_sync_job_audit_logs" USING btree ("scope_tenant");--> statement-breakpoint
CREATE INDEX "project_permission_sync_jobs_project_id_idx" ON "project_permission_sync_jobs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_permission_sync_jobs_status_idx" ON "project_permission_sync_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_permission_sync_jobs_project_status_idx" ON "project_permission_sync_jobs" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_permission_sync_jobs_project_import_id_unique" ON "project_permission_sync_jobs" USING btree ("project_id","import_id") WHERE "project_permission_sync_jobs"."import_id" IS NOT NULL AND "project_permission_sync_jobs"."deleted_at" IS NULL AND "project_permission_sync_jobs"."status" IN ('pending', 'running', 'completed');--> statement-breakpoint
CREATE POLICY "tenant_isolation_policy" ON "project_permission_sync_jobs" AS RESTRICTIVE FOR SELECT TO public USING (NULLIF(current_setting('app.current_project_id', true), '') IS NULL OR project_id = NULLIF(current_setting('app.current_project_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "tenant_rls_allow" ON "project_permission_sync_jobs" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);