CREATE TABLE "project_app_tag_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_app_tag_id" uuid,
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
CREATE TABLE "project_app_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_app_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "project_app_tag_audit_logs" ADD CONSTRAINT "project_app_tag_audit_logs_project_app_tag_id_project_app_tags_id_fk" FOREIGN KEY ("project_app_tag_id") REFERENCES "public"."project_app_tags"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_app_tags" ADD CONSTRAINT "project_app_tags_project_app_id_project_apps_id_fk" FOREIGN KEY ("project_app_id") REFERENCES "public"."project_apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_app_tags" ADD CONSTRAINT "project_app_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_app_tag_audit_logs_project_app_tag_id_idx" ON "project_app_tag_audit_logs" USING btree ("project_app_tag_id");--> statement-breakpoint
CREATE INDEX "project_app_tag_audit_logs_action_idx" ON "project_app_tag_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "project_app_tag_audit_logs_scope_tenant_idx" ON "project_app_tag_audit_logs" USING btree ("scope_tenant");--> statement-breakpoint
CREATE UNIQUE INDEX "project_app_tags_project_app_id_tag_id_unique" ON "project_app_tags" USING btree ("project_app_id","tag_id") WHERE "project_app_tags"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "project_app_tags_deleted_at_idx" ON "project_app_tags" USING btree ("deleted_at");