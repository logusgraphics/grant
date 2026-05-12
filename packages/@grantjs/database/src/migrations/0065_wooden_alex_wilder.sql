ALTER TABLE "permissions" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "permissions_metadata_idx" ON "permissions" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "resources_metadata_idx" ON "resources" USING gin ("metadata");