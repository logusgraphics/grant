ALTER TABLE "tags" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "tags_metadata_idx" ON "tags" USING gin ("metadata");