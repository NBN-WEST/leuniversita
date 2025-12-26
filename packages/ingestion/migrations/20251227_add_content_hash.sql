-- Add content_hash column to documents table for idempotency checks
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS content_hash text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON public.documents(content_hash);
