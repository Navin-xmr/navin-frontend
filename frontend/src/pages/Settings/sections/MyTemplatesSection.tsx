import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, GripVertical, Loader2, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../../components/common/Modal/Modal';
import { useShipmentTemplates } from '../../../hooks/useShipmentTemplates';
import type { ShipmentTemplate, ShipmentTemplateFields } from '../../../types/shipmentTemplate';
import { getTemplatePreview } from '../../../types/shipmentTemplate';

const emptyFields: ShipmentTemplateFields = {
  origin: '',
  destination: '',
  itemDescription: '',
  weight: '',
  recipientName: '',
  recipientContact: '',
};

const ORDER_STORAGE_KEY = 'navin_template_order';

function loadStoredOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function persistOrder(order: string[]): void {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore persistence failures
  }
}

const MyTemplatesSection: React.FC = () => {
  const navigate = useNavigate();
  const { templates, isLoading, error, updateTemplate, deleteTemplate } = useShipmentTemplates();
  const [editingTemplate, setEditingTemplate] = useState<ShipmentTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editFields, setEditFields] = useState<ShipmentTemplateFields>(emptyFields);
  const [deleteTarget, setDeleteTarget] = useState<ShipmentTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [order, setOrder] = useState<string[]>(loadStoredOrder);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (templates.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder((prev) => {
      const templateIds = templates.map((t) => t.id);
      const known = prev.filter((id) => templateIds.includes(id));
      const missing = templateIds.filter((id) => !known.includes(id));
      const next = [...known, ...missing];
      const unchanged = next.length === prev.length && next.every((id, i) => id === prev[i]);
      if (unchanged) return prev;
      persistOrder(next);
      return next;
    });
  }, [templates]);

  const orderedTemplates = useMemo(() => {
    const byId = new Map(templates.map((t) => [t.id, t]));
    return order.map((id) => byId.get(id)).filter((t): t is ShipmentTemplate => !!t);
  }, [templates, order]);

  const moveTemplate = (id: string, direction: -1 | 1) => {
    setOrder((prev) => {
      const idx = prev.indexOf(id);
      const swapIdx = idx + direction;
      if (idx === -1 || swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      persistOrder(next);
      return next;
    });
  };

  const reorderByDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setOrder((prev) => {
      const from = prev.indexOf(draggedId);
      const to = prev.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, draggedId);
      persistOrder(next);
      return next;
    });
  };

  const openEdit = (template: ShipmentTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditFields({ ...template.fields });
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate || !editName.trim()) return;
    setIsSaving(true);
    try {
      await updateTemplate(editingTemplate.id, {
        name: editName.trim(),
        fields: editFields,
      });
      setEditingTemplate(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <Loader2 size={16} className="animate-spin" />
        Loading templates…
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#14171e] p-6">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-semibold text-white">My Templates</h2>
        <p className="m-0 mt-1 text-sm text-[#94a3b8]">
          Manage saved shipment templates for faster recurring shipments.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#ef4444]/30 bg-[#1f1f22] p-3 text-sm text-[#fca5a5]">
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <p className="m-0 text-sm text-[#94a3b8]">
          No templates saved yet. Create a shipment and use Save as Template to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {orderedTemplates.map((template, index) => (
            <div
              key={template.id}
              draggable
              onDragStart={() => setDraggedId(template.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                reorderByDrop(template.id);
              }}
              className={`flex flex-col gap-3 rounded-xl border border-[#1e293b] bg-[#0f172a] p-4 sm:flex-row sm:items-center sm:justify-between ${
                draggedId === template.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="hidden shrink-0 cursor-grab items-center text-[#64748b] sm:flex"
                  aria-hidden="true"
                >
                  <GripVertical size={16} />
                </span>
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => moveTemplate(template.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${template.name} up`}
                    className="rounded text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTemplate(template.id, 1)}
                    disabled={index === orderedTemplates.length - 1}
                    aria-label={`Move ${template.name} down`}
                    className="rounded text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-white">{template.name}</p>
                  <p className="m-0 mt-1 truncate text-sm text-[#94a3b8]">
                    {getTemplatePreview(template)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/shipments/create?template=${template.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-[#3b82f6] text-xs font-semibold text-white hover:bg-[#2563eb] transition-colors cursor-pointer"
                >
                  Use Template
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(template)}
                  aria-label={`Edit ${template.name}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1e293b] text-xs text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(template)}
                  aria-label={`Delete ${template.name}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#7f1d1d] text-xs text-[#fca5a5] hover:bg-[#7f1d1d]/20 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        title="Edit Template"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              className="px-4 py-2 rounded-lg border border-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSaveEdit()}
              className="px-4 py-2 rounded-lg bg-[#3b82f6] text-sm font-semibold text-white hover:bg-[#2563eb] transition-colors cursor-pointer disabled:opacity-60"
              disabled={isSaving || !editName.trim()}
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-white">Template name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-sm text-white"
            />
          </div>
          {(
            [
              ['origin', 'Origin'],
              ['destination', 'Destination'],
              ['itemDescription', 'Item description'],
              ['weight', 'Weight (kg)'],
              ['recipientName', 'Recipient name'],
              ['recipientContact', 'Recipient contact'],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === 'itemDescription' ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-sm font-medium text-white">{label}</label>
              {key === 'itemDescription' ? (
                <textarea
                  value={editFields[key]}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, [key]: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-sm text-white"
                />
              ) : (
                <input
                  type="text"
                  value={editFields[key]}
                  onChange={(e) => setEditFields((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 py-2 text-sm text-white"
                />
              )}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Template"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg border border-[#1e293b] text-sm text-[#94a3b8] hover:text-white transition-colors cursor-pointer"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="px-4 py-2 rounded-lg bg-[#ef4444] text-sm font-semibold text-white hover:bg-[#dc2626] transition-colors cursor-pointer disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="m-0 text-sm text-[#cbd5e1]">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">{deleteTarget?.name}</span>? This action cannot
          be undone.
        </p>
      </Modal>
    </section>
  );
};

export default MyTemplatesSection;
