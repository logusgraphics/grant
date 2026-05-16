ALTER TABLE "project_permission_sync_jobs" ADD COLUMN "snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" ADD COLUMN "snapshot_taken_at" timestamp;--> statement-breakpoint
ALTER TABLE "project_permission_sync_jobs" ADD COLUMN "snapshot_size_bytes" integer;