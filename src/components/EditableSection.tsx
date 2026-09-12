import { useState, useCallback } from 'react';
import { Pencil, X, Check, Plus, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Field definition ───────────────────────────────────────────────────

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];          // For 'select' type
  placeholder?: string;
  className?: string;          // Optional width / sizing class
}

// ─── Props ──────────────────────────────────────────────────────────────

interface EditableSectionProps {
  /** Section heading (optional — if blank, no heading is rendered) */
  title?: string;
  /** The current items array for this section */
  items: any[];
  /** Field schema describing each item's editable properties */
  fields: FieldDef[];
  /** Called with the updated items array when the user clicks Save */
  onSave: (items: any[]) => Promise<void>;
  /** Extra class names for the wrapper */
  className?: string;
  /** Render the *view* mode (items are displayed normally). If omitted
   *  the component renders nothing in view mode — you compose it yourself. */
  children?: React.ReactNode;
  /** When true, only the pencil icon is shown (no heading rendered) */
  headless?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────

export default function EditableSection({
  title,
  items,
  fields,
  onSave,
  className = '',
  children,
  headless = false,
}: EditableSectionProps) {
  const { isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const startEditing = useCallback(() => {
    setDraft(JSON.parse(JSON.stringify(items)));
    setEditing(true);
  }, [items]);

  const cancel = () => {
    setEditing(false);
    setDraft([]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (index: number, key: string, value: any) => {
    setDraft((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addItem = () => {
    const blank: Record<string, any> = {};
    fields.forEach((f) => {
      blank[f.key] = f.type === 'number' ? 0 : '';
    });
    setDraft((prev) => [...prev, blank]);
  };

  const removeItem = (index: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= draft.length) return;
    setDraft((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  // ── Edit button (pencil) ────────────────────────────────────────────

  const editButton = isAuthenticated && !editing ? (
    <button
      onClick={startEditing}
      className="edit-pencil-btn"
      title="Edit this section"
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  ) : null;

  // ── VIEW MODE ───────────────────────────────────────────────────────

  if (!editing) {
    if (headless) {
      return (
        <div className={`relative group ${className}`}>
          {children}
          {editButton && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {editButton}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={className}>
        {title && (
          <div className="flex items-center gap-2 group">
            <h2 className="section-heading flex-1">{title}</h2>
            {editButton && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-2">
                {editButton}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }

  // ── EDIT MODE ───────────────────────────────────────────────────────

  return (
    <div className={className}>
      {title && <h2 className="section-heading">{title}</h2>}

      <div className="card p-4 space-y-3 border-primary-200 bg-primary-50/20">
        {/* Edit header */}
        <div className="flex items-center justify-between pb-2 border-b border-primary-100">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            Editing{title ? ` · ${title}` : ''}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={cancel} className="edit-action-btn text-slate-500 hover:text-slate-700" title="Cancel">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="edit-action-btn text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              title="Save"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {draft.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-start gap-2">
                {/* Reorder controls */}
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <button
                    onClick={() => moveItem(index, index - 1)}
                    className="text-slate-300 hover:text-slate-500 text-[10px] leading-none disabled:opacity-30"
                    disabled={index === 0}
                  >
                    ▲
                  </button>
                  <GripVertical className="w-3 h-3 text-slate-300" />
                  <button
                    onClick={() => moveItem(index, index + 1)}
                    className="text-slate-300 hover:text-slate-500 text-[10px] leading-none disabled:opacity-30"
                    disabled={index === draft.length - 1}
                  >
                    ▼
                  </button>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  {fields.length === 1 && fields[0].type === 'textarea' ? (
                    // Single textarea — render without label for cleaner look
                    <textarea
                      value={item[fields[0].key] ?? ''}
                      onChange={(e) => updateField(index, fields[0].key, e.target.value)}
                      placeholder={fields[0].placeholder || fields[0].label}
                      className="editable-textarea"
                      rows={2}
                    />
                  ) : fields.length === 1 && fields[0].type === 'text' ? (
                    // Single text input — render without label
                    <input
                      type="text"
                      value={item[fields[0].key] ?? ''}
                      onChange={(e) => updateField(index, fields[0].key, e.target.value)}
                      placeholder={fields[0].placeholder || fields[0].label}
                      className="editable-input"
                    />
                  ) : (
                    // Multiple fields — render with labels
                    <div className="grid gap-2" style={{
                      gridTemplateColumns: fields.length <= 2 ? '1fr' : `repeat(${Math.min(fields.length, 4)}, 1fr)`,
                    }}>
                      {fields.map((field) => (
                        <div key={field.key} className={field.className || ''}>
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={item[field.key] ?? ''}
                              onChange={(e) => updateField(index, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="editable-textarea"
                              rows={2}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              value={item[field.key] ?? ''}
                              onChange={(e) => updateField(index, field.key, e.target.value)}
                              className="editable-select"
                            >
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'number' ? (
                            <input
                              type="number"
                              value={item[field.key] ?? 0}
                              onChange={(e) => updateField(index, field.key, Number(e.target.value))}
                              className="editable-input"
                            />
                          ) : (
                            <input
                              type="text"
                              value={item[field.key] ?? ''}
                              onChange={(e) => updateField(index, field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="editable-input"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeItem(index)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 mt-0.5"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          onClick={addItem}
          className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/30 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>
    </div>
  );
}
