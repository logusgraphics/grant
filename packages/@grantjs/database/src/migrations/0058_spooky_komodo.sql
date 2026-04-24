ALTER TABLE "project_users" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "project_users_metadata_idx" ON "project_users" USING gin ("metadata");