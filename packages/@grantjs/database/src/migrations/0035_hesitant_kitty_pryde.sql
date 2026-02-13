ALTER TABLE "project_signing_keys" RENAME TO "signing_keys";--> statement-breakpoint
DROP INDEX "project_signing_keys_scope_unique";--> statement-breakpoint
DROP INDEX "project_signing_keys_kid_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "signing_keys_scope_unique" ON "signing_keys" USING btree ("scope_tenant","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "signing_keys_kid_unique" ON "signing_keys" USING btree ("kid");