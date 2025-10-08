ALTER TABLE "ingestion_sources" ADD COLUMN IF NOT EXISTS "last_archived_at" timestamptz DEFAULT now() NOT NULL;
-- statement-breakpoint
CREATE OR REPLACE FUNCTION update_source_archived_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingestion_sources
  SET last_archived_at = NEW.archived_at
  WHERE id = NEW.ingestion_source_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- statement-breakpoint
CREATE TRIGGER on_table_insert
AFTER INSERT ON archived_emails
FOR EACH ROW
EXECUTE FUNCTION update_source_archived_at();
-- statement-breakpoint
