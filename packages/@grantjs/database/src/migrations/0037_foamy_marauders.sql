CREATE TABLE "signing_key_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"signing_key_id" uuid NOT NULL,
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
ALTER TABLE "signing_key_audit_logs" ADD CONSTRAINT "signing_key_audit_logs_signing_key_id_signing_keys_id_fk" FOREIGN KEY ("signing_key_id") REFERENCES "public"."signing_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signing_key_audit_logs" ADD CONSTRAINT "signing_key_audit_logs_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "signing_key_audit_logs_signing_key_id_idx" ON "signing_key_audit_logs" USING btree ("signing_key_id");--> statement-breakpoint
CREATE INDEX "signing_key_audit_logs_action_idx" ON "signing_key_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "signing_key_audit_logs_scope_tenant_idx" ON "signing_key_audit_logs" USING btree ("scope_tenant");