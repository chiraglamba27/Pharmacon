import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

/**
 * Hook that fetches editable page content from the backend and provides
 * helpers to update individual sections. Content persists to SQLite via
 * the Supabase-backed content data layer.
 */
export function useEditableContent(page: string) {
  const [sections, setSections] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ sections: Record<string, any[]> }>(`/content/page/${page}`)
      .then((data) => setSections(data.sections))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const updateSection = useCallback(
    async (section: string, items: any[]) => {
      // Optimistically update local state
      setSections((prev) => ({ ...prev, [section]: items }));
      await api.put(`/content/page/${page}/${section}`, { items });
    },
    [page]
  );

  return { sections, loading, updateSection };
}
