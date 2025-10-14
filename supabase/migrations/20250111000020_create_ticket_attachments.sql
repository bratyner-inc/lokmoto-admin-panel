-- Ticket Attachments table
-- Stores file attachments for tickets (1 document + up to 3 photos)

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- File details
    file_type TEXT NOT NULL CHECK (file_type IN ('document', 'photo')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_size INTEGER, -- Size in bytes
    mime_type TEXT,
    
    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_uploaded_by ON ticket_attachments(uploaded_by);
CREATE INDEX idx_ticket_attachments_file_type ON ticket_attachments(file_type);

-- Enable Row Level Security
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view attachments for tickets they have access to
CREATE POLICY "Users can view ticket attachments"
    ON public.ticket_attachments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                t.customer_id = auth.uid()
                OR t.rental_company_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.platform_admins
                    WHERE id = auth.uid()
                )
            )
        )
    );

-- Users can upload attachments to their tickets (with constraints)
CREATE POLICY "Users can upload ticket attachments"
    ON public.ticket_attachments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                t.customer_id = auth.uid()
                OR t.rental_company_id = auth.uid()
            )
        )
        -- Constraint: Max 1 document + 3 photos per ticket
        AND (
            -- Check document limit (max 1)
            (file_type = 'document' AND (
                SELECT COUNT(*) FROM public.ticket_attachments
                WHERE ticket_id = ticket_attachments.ticket_id
                AND file_type = 'document'
            ) < 1)
            OR
            -- Check photo limit (max 3)
            (file_type = 'photo' AND (
                SELECT COUNT(*) FROM public.ticket_attachments
                WHERE ticket_id = ticket_attachments.ticket_id
                AND file_type = 'photo'
            ) < 3)
        )
    );

-- Users can delete their own attachments (only if ticket not closed)
CREATE POLICY "Users can delete their attachments"
    ON public.ticket_attachments
    FOR DELETE
    TO authenticated
    USING (
        uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND t.status != 'closed'
        )
    );

-- Comments
COMMENT ON TABLE ticket_attachments IS 'File attachments for tickets (1 document + max 3 photos per ticket)';
COMMENT ON COLUMN ticket_attachments.file_type IS 'Type of file: document or photo';
COMMENT ON COLUMN ticket_attachments.file_url IS 'Supabase Storage path/URL to the file';

-- Setup Storage Bucket for ticket attachments
DO $$ 
BEGIN
    -- Create bucket if not exists (this requires storage admin role)
    -- This will be done via Supabase Dashboard or CLI
    -- Bucket name: 'ticket-attachments'
    -- Public: false (only authenticated users with RLS)
    NULL;
END $$;

-- Function to validate attachment limits before insert
CREATE OR REPLACE FUNCTION validate_ticket_attachments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    doc_count INTEGER;
    photo_count INTEGER;
BEGIN
    -- Count existing attachments
    SELECT 
        COUNT(*) FILTER (WHERE file_type = 'document'),
        COUNT(*) FILTER (WHERE file_type = 'photo')
    INTO doc_count, photo_count
    FROM ticket_attachments
    WHERE ticket_id = NEW.ticket_id;
    
    -- Validate document limit
    IF NEW.file_type = 'document' AND doc_count >= 1 THEN
        RAISE EXCEPTION 'Maximum of 1 document per ticket allowed';
    END IF;
    
    -- Validate photo limit
    IF NEW.file_type = 'photo' AND photo_count >= 3 THEN
        RAISE EXCEPTION 'Maximum of 3 photos per ticket allowed';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger to enforce attachment limits
CREATE TRIGGER enforce_ticket_attachment_limits
    BEFORE INSERT ON ticket_attachments
    FOR EACH ROW
    EXECUTE FUNCTION validate_ticket_attachments();

COMMENT ON FUNCTION validate_ticket_attachments() IS 'Enforces limit of 1 document and 3 photos per ticket';

