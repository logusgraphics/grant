CREATE TABLE "project_app_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_app_id" uuid,
	"action" varchar(50) NOT NULL,
	"old_values" varchar(1000),
	"new_values" varchar(1000),
	"metadata" varchar(1000),
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scope_tenant" varchar(50),
	"scope_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "project_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret_hash" varchar(255),
	"name" varchar(255),
	"redirect_uris" jsonb NOT NULL,
	"scopes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "project_app_audit_logs" ADD CONSTRAINT "project_app_audit_logs_project_app_id_project_apps_id_fk" FOREIGN KEY ("project_app_id") REFERENCES "public"."project_apps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_app_audit_logs" ADD CONSTRAINT "project_app_audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_apps" ADD CONSTRAINT "project_apps_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_app_audit_logs_project_app_id_idx" ON "project_app_audit_logs" USING btree ("project_app_id");--> statement-breakpoint
CREATE INDEX "project_app_audit_logs_action_idx" ON "project_app_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "project_app_audit_logs_scope_tenant_idx" ON "project_app_audit_logs" USING btree ("scope_tenant");--> statement-breakpoint
CREATE UNIQUE INDEX "project_apps_client_id_unique" ON "project_apps" USING btree ("client_id") WHERE "project_apps"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "project_apps_project_id_idx" ON "project_apps" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_apps_deleted_at_idx" ON "project_apps" USING btree ("deleted_at");