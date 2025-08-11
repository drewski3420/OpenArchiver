ALTER TABLE "archived_emails" ADD COLUMN "path" text;--> statement-breakpoint
ALTER TABLE "archived_emails" ADD COLUMN "tags" jsonb;