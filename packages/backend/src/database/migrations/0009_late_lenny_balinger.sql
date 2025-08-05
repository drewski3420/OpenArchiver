ALTER TABLE "archived_emails" ADD COLUMN "thread_id" text;--> statement-breakpoint
CREATE INDEX "thread_id_idx" ON "archived_emails" USING btree ("thread_id");