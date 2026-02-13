DROP INDEX "signing_keys_scope_unique";--> statement-breakpoint
CREATE INDEX "signing_keys_scope_idx" ON "signing_keys" USING btree ("scope_tenant","scope_id");