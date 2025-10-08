ALTER TABLE "ingestion_sources" ADD COLUMN "last_archived_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_source_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingestion_sources
  SET last_archived_at = NEW.archived_at
  WHERE id = NEW.ingestion_source_id;
  RETURN NEW;
END;
--> statement-breakpoint
CREATE TRIGGER on_table_insert
AFTER INSERT ON archived_emails
FOR EACH ROW
EXECUTE FUNCTION update_source_archived_at();
--> statement-breakpoint
