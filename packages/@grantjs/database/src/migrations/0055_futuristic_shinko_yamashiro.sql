CREATE TABLE "user_mfa_factor_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_mfa_factor_id" uuid,
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
CREATE TABLE "user_mfa_factors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) DEFAULT 'totp' NOT NULL,
	"encrypted_secret" varchar(4000) NOT NULL,
	"secret_iv" varchar(255) NOT NULL,
	"secret_tag" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "require_mfa_for_sensitive_actions" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "email_verified" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "mfa_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_mfa_factor_audit_logs" ADD CONSTRAINT "user_mfa_factor_audit_logs_user_mfa_factor_id_user_mfa_factors_id_fk" FOREIGN KEY ("user_mfa_factor_id") REFERENCES "public"."user_mfa_factors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_factors" ADD CONSTRAINT "user_mfa_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_mfa_factor_audit_logs_user_mfa_factor_id_idx" ON "user_mfa_factor_audit_logs" USING btree ("user_mfa_factor_id");--> statement-breakpoint
CREATE INDEX "user_mfa_factor_audit_logs_action_idx" ON "user_mfa_factor_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "user_mfa_factor_audit_logs_scope_tenant_idx" ON "user_mfa_factor_audit_logs" USING btree ("scope_tenant");--> statement-breakpoint
CREATE INDEX "user_mfa_factors_user_id_idx" ON "user_mfa_factors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_mfa_factors_type_idx" ON "user_mfa_factors" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_mfa_factors_deleted_at_idx" ON "user_mfa_factors" USING btree ("deleted_at");