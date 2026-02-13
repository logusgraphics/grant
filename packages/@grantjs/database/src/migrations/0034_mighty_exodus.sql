CREATE TABLE "project_signing_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_tenant" varchar(50) NOT NULL,
	"scope_id" varchar(512) NOT NULL,
	"kid" varchar(255) NOT NULL,
	"public_key_pem" text NOT NULL,
	"private_key_pem" text NOT NULL,
	"algorithm" varchar(20) DEFAULT 'RS256' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rotated_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "project_signing_keys_scope_unique" ON "project_signing_keys" USING btree ("scope_tenant","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_signing_keys_kid_unique" ON "project_signing_keys" USING btree ("kid");