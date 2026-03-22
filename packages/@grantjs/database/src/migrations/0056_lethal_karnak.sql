CREATE TABLE "user_mfa_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_mfa_factor_id" uuid,
	"code_hash" varchar(255) NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_mfa_recovery_codes" ADD CONSTRAINT "user_mfa_recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_mfa_recovery_codes" ADD CONSTRAINT "user_mfa_recovery_codes_user_mfa_factor_id_user_mfa_factors_id_fk" FOREIGN KEY ("user_mfa_factor_id") REFERENCES "public"."user_mfa_factors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_mfa_recovery_codes_user_id_idx" ON "user_mfa_recovery_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_mfa_recovery_codes_code_hash_idx" ON "user_mfa_recovery_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "user_mfa_recovery_codes_deleted_at_idx" ON "user_mfa_recovery_codes" USING btree ("deleted_at");