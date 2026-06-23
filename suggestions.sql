-- Feature suggestions and bug reports.
-- Run this file once in Supabase Dashboard > SQL Editor.

CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
    category TEXT NOT NULL DEFAULT 'feature'
        CHECK (category IN ('feature', 'bug', 'ui', 'other')),
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1200),
    page_url TEXT CHECK (page_url IS NULL OR char_length(page_url) <= 200),
    admin_marker TEXT
        CHECK (admin_marker IS NULL OR admin_marker IN ('done', 'rejected', 'todo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suggestions_are_publicly_readable" ON public.suggestions;
CREATE POLICY "suggestions_are_publicly_readable" ON public.suggestions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "signed_in_users_can_create_suggestions" ON public.suggestions;
CREATE POLICY "signed_in_users_can_create_suggestions" ON public.suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_can_update_suggestion_status" ON public.suggestions;
CREATE POLICY "admins_can_update_suggestion_status" ON public.suggestions
    FOR UPDATE USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admins_can_delete_suggestions" ON public.suggestions;
CREATE POLICY "admins_can_delete_suggestions" ON public.suggestions
    FOR DELETE USING (public.is_admin());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'suggestions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
    END IF;
END
$$;
