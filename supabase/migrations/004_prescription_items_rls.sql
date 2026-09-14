-- Migration 004: RLS for prescription_items

-- Only allow authenticated access
CREATE POLICY "Allow authenticated read access for prescription items"
    ON public.prescription_items
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Service role bypasses RLS so we don't strictly need more insert/update rules,
-- but we'll add basic rules for completeness.
CREATE POLICY "Allow service role all"
    ON public.prescription_items
    FOR ALL
    USING (auth.role() = 'service_role');
