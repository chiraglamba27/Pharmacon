-- Insert the public-deliverables bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-deliverables', 'public-deliverables', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the bucket
-- Allow public read access to all files in public-deliverables
CREATE POLICY "Allow public read on public-deliverables"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-deliverables');

-- Allow service role full access
CREATE POLICY "Allow service role all on public-deliverables"
ON storage.objects FOR ALL
USING (bucket_id = 'public-deliverables' AND auth.role() = 'service_role');
