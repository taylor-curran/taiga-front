import { useState } from 'react';
import {
  useCustomAttributes,
  useCustomAttributeValues,
  usePatchCustomAttributeValues,
} from '@/services/customAttributes';
import type { CustomAttribute } from '@/types/api';

interface CustomFieldsSectionProps {
  usId: number;
  projectId: number;
}

export function CustomFieldsSection({ usId, projectId }: CustomFieldsSectionProps) {
  const { data: attributes } = useCustomAttributes('userstory', projectId);
  const { data: values } = useCustomAttributeValues('userstory', usId);
  const patchValues = usePatchCustomAttributeValues('userstory');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!attributes || attributes.length === 0) return null;

  const currentValues = values?.attributes_values ?? {};

  const handleSave = (attrId: number) => {
    patchValues.mutate({
      objectId: usId,
      values: { ...currentValues, [String(attrId)]: editValue },
      version: values?.version ?? 1,
    });
    setEditing(null);
  };

  return (
    <section>
      <h2 className="font-semibold text-taiga-text mb-2">Custom Fields</h2>
      <div className="space-y-2">
        {attributes.map((attr: CustomAttribute) => {
          const val = currentValues[String(attr.id)];
          const isEditing = editing === String(attr.id);

          return (
            <div key={attr.id} className="flex items-start gap-2">
              <span className="text-sm text-taiga-grey-light w-32 shrink-0 pt-1">
                {attr.name}
              </span>
              {isEditing ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 border border-taiga-grey-lighter rounded px-2 py-1 text-sm focus:outline-none focus:border-taiga-primary"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(attr.id);
                      if (e.key === 'Escape') setEditing(null);
                    }}
                  />
                  <button
                    onClick={() => handleSave(attr.id)}
                    className="text-xs text-taiga-primary px-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-xs text-taiga-grey-light px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditing(String(attr.id));
                    setEditValue(String(val ?? ''));
                  }}
                  className="text-sm text-taiga-text hover:text-taiga-primary text-left flex-1"
                >
                  {val != null && val !== '' ? String(val) : (
                    <span className="text-taiga-grey-light italic">Not set</span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
