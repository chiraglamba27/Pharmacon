-- Insert the private-prescriptions bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-prescriptions', 'private-prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the bucket (allow service role full access)
CREATE POLICY "Allow service role all on private-prescriptions"
ON storage.objects FOR ALL
USING (bucket_id = 'private-prescriptions' AND auth.role() = 'service_role');
