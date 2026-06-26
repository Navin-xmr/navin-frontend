import React, { useCallback, useEffect, useState } from 'react';
import {
  Book,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { addressesApi } from '@services/api/endpoints/addresses';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@services/api/endpoints/addresses';
import Modal from '@components/common/Modal/Modal';

interface AddressForm {
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressForm = {
  label: '',
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  isDefault: false,
};

interface FormErrors {
  [key: string]: string;
}

const AddressBookSection: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await addressesApi.getAll();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setFormErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.label.trim()) errs.label = 'Label is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.street.trim()) errs.street = 'Street is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.country.trim()) errs.country = 'Country is required';
    if (!form.postalCode.trim()) errs.postalCode = 'Postal code is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        const payload: UpdateAddressRequest = { ...form };
        delete (payload as Record<string, unknown>).isDefault;
        if (form.isDefault) payload.isDefault = true;
        await addressesApi.update(editingId, payload);
      } else {
        await addressesApi.create(form as CreateAddressRequest);
      }
      setShowForm(false);
      void fetchAddresses();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await addressesApi.delete(deleteTarget._id);
      setAddresses((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await addressesApi.setDefault(addr._id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === addr._id })),
      );
    } catch {
      // silent
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-[rgba(19,186,186,0.05)] border ${
      formErrors[field] ? 'border-red-500' : 'border-[rgba(98,255,255,0.2)]'
    } rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff]`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book size={18} className="text-[#62ffff]" />
          <h2 className="text-lg font-semibold">Address Book</h2>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8]"
        >
          <Plus size={16} />
          Add Address
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading addresses…</p>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Book size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No saved addresses yet. Add frequently used addresses for faster
            shipment creation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
                        <Star size={10} />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{addr.name}</p>
                  <p className="text-xs text-slate-400">{addr.phone}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {addr.street}, {addr.city}, {addr.state} {addr.postalCode},{' '}
                    {addr.country}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => void handleSetDefault(addr)}
                      className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                      title="Set as default"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-2 text-slate-400 hover:text-[#62ffff] hover:bg-[rgba(19,186,186,0.1)] rounded-lg"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(addr)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Address' : 'Add Address'}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#62ffff] text-black font-semibold text-sm rounded-lg hover:bg-[#4ae8e8] disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add Address'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              value={form.label}
              onChange={(e) => {
                setForm((p) => ({ ...p, label: e.target.value }));
                setFormErrors((p) => ({ ...p, label: '' }));
              }}
              placeholder="e.g. Head Office, Warehouse B"
              className={inputCls('label')}
            />
            {formErrors.label && (
              <p className="text-xs text-red-400 mt-1">{formErrors.label}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Contact Name <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  setFormErrors((p) => ({ ...p, name: '' }));
                }}
                placeholder="John Doe"
                className={inputCls('name')}
              />
              {formErrors.name && (
                <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => {
                  setForm((p) => ({ ...p, phone: e.target.value }));
                  setFormErrors((p) => ({ ...p, phone: '' }));
                }}
                placeholder="+1 555-0123"
                className={inputCls('phone')}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Street Address <span className="text-red-400">*</span>
            </label>
            <input
              value={form.street}
              onChange={(e) => {
                setForm((p) => ({ ...p, street: e.target.value }));
                setFormErrors((p) => ({ ...p, street: '' }));
              }}
              placeholder="123 Main Street, Suite 100"
              className={inputCls('street')}
            />
            {formErrors.street && (
              <p className="text-xs text-red-400 mt-1">{formErrors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                City <span className="text-red-400">*</span>
              </label>
              <input
                value={form.city}
                onChange={(e) => {
                  setForm((p) => ({ ...p, city: e.target.value }));
                  setFormErrors((p) => ({ ...p, city: '' }));
                }}
                placeholder="New York"
                className={inputCls('city')}
              />
              {formErrors.city && (
                <p className="text-xs text-red-400 mt-1">{formErrors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                State <span className="text-red-400">*</span>
              </label>
              <input
                value={form.state}
                onChange={(e) => {
                  setForm((p) => ({ ...p, state: e.target.value }));
                  setFormErrors((p) => ({ ...p, state: '' }));
                }}
                placeholder="NY"
                className={inputCls('state')}
              />
              {formErrors.state && (
                <p className="text-xs text-red-400 mt-1">{formErrors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Country <span className="text-red-400">*</span>
              </label>
              <input
                value={form.country}
                onChange={(e) => {
                  setForm((p) => ({ ...p, country: e.target.value }));
                  setFormErrors((p) => ({ ...p, country: '' }));
                }}
                placeholder="United States"
                className={inputCls('country')}
              />
              {formErrors.country && (
                <p className="text-xs text-red-400 mt-1">
                  {formErrors.country}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Postal Code <span className="text-red-400">*</span>
              </label>
              <input
                value={form.postalCode}
                onChange={(e) => {
                  setForm((p) => ({ ...p, postalCode: e.target.value }));
                  setFormErrors((p) => ({ ...p, postalCode: '' }));
                }}
                placeholder="10001"
                className={inputCls('postalCode')}
              />
              {formErrors.postalCode && (
                <p className="text-xs text-red-400 mt-1">
                  {formErrors.postalCode}
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((p) => ({ ...p, isDefault: e.target.checked }))
              }
              className="w-4 h-4 rounded border-[rgba(98,255,255,0.3)] bg-[rgba(19,186,186,0.05)] text-[#62ffff] focus:ring-[#62ffff]"
            />
            <span className="text-sm text-slate-300">
              Set as default sender address
            </span>
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Address"
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white font-semibold text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-400">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">
                {deleteTarget?.label}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddressBookSection;
