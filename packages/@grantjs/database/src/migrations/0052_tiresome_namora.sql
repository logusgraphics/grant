ALTER TABLE "project_apps" ADD COLUMN "sign_up_role_id" uuid;--> statement-breakpoint
ALTER TABLE "project_apps" ADD CONSTRAINT "project_apps_sign_up_role_id_roles_id_fk" FOREIGN KEY ("sign_up_role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "project_apps_sign_up_role_id_idx" ON "project_apps" USING btree ("sign_up_role_id");