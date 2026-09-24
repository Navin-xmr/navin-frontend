import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowLeft, Loader2, History, Book } from 'lucide-react';
import { shipmentApi, type CreateShipmentRequest } from '@services/api/endpoints/shipments';
import { addressesApi } from '@services/api/endpoints/addresses';
import type { Address } from '@services/api/endpoints/addresses';
import { useToast } from '@context/ToastContext';
import { useShipmentTemplates } from '@hooks/useShipmentTemplates';
import { useFormDraft } from '@hooks/useFormDraft';
import SaveTemplateModal from '@components/shipment/SaveTemplateModal';
import AddressBookPickerModal from '@components/address-book/AddressBookPickerModal';
import { getTemplatePreview, toTemplateFields } from '../../../../types/shipmentTemplate';
import type { AxiosError } from 'axios';
import Combobox from '@components/ui/Combobox';
import type { ComboboxOption } from '@components/ui/Combobox';
import CostBreakdown from '@components/shipment/CostBreakdown';
import { formatAddress as formatLocalizedAddress } from '@utils/localeFormat';
import type { CostBreakdownData } from '@components/shipment/CostBreakdown';

interface FormData {
    origin: string;
    destination: string;
    itemDescription: string;
    weight: string;
    recipientName: string;
    recipientContact: string;
    expectedDeliveryDate: string;
}

interface FormErrors {
    [key: string]: string;
}

const EMPTY_FORM: FormData = {
    origin: '',
    destination: '',
    itemDescription: '',
    weight: '',
    recipientName: '',
    recipientContact: '',
    expectedDeliveryDate: '',
};

const DRAFT_STORAGE_KEY = 'navin_draft_create_shipment';

const isFormEmpty = (data: FormData): boolean =>
    Object.values(data).every((value) => !value.trim());

const inputClasses = (hasError: boolean) =>
    `w-full bg-[#0b0e14] border rounded-lg px-4 py-3 text-slate-100 text-sm font-sans transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600 ${
        hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500'
    }`;

const CreateShipment: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToast } = useToast();
    const { templates, isLoading: templatesLoading, createTemplate } = useShipmentTemplates();
    const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shipmentId, setShipmentId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [addressBookTarget, setAddressBookTarget] = useState<'origin' | 'destination' | null>(null);
    const [costEstimate, setCostEstimate] = useState<CostBreakdownData | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const { draft, lastSavedAt, restoreDraft, discardDraft, clearDraft } = useFormDraft<FormData>(
        DRAFT_STORAGE_KEY,
        formData,
        isFormEmpty,
        { disabled: loading || success },
    );

    const handleRestoreDraft = () => {
        const restored = restoreDraft();
        if (!restored) return;
        setFormData({ ...EMPTY_FORM, ...restored });
        setErrors({});
        addToast('Draft restored.', 'success');
    };

    const handleDiscardDraft = () => {
        discardDraft();
        addToast('Draft discarded.', 'info');
    };

    const templateOptions = useMemo(
        () =>
            templates.map((template) => ({
                id: template.id,
                label: `${template.name} — ${getTemplatePreview(template)}`,
            })),
        [templates],
    );

    const applyTemplate = (templateId: string) => {
        const template = templates.find((item) => item.id === templateId);
        if (!template) return;

        setFormData((prev) => ({
            ...prev,
            ...template.fields,
            expectedDeliveryDate: prev.expectedDeliveryDate,
        }));
        setSelectedTemplateId(templateId);
        setErrors({});
        addToast(`Loaded template "${template.name}"`, 'success');
    };

    const formatAddress = (addr: Address): string =>
        formatLocalizedAddress({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
        });

    useEffect(() => {
        const templateId = searchParams.get('template');
        if (!templateId || templatesLoading || templates.length === 0) return;
        if (selectedTemplateId === templateId) return;
        const timer = setTimeout(() => { applyTemplate(templateId); }, 0);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, templates, templatesLoading]);
    const [addressOptions, setAddressOptions] = useState<ComboboxOption[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(false);

    // Load addresses for typeahead suggestions
    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag for async fetch
        setAddressesLoading(true);
        addressesApi.getAll().then((addrs) => {
            if (cancelled) return;
            const opts: ComboboxOption[] = addrs.map((addr) => ({
                value: addr._id,
                label: addr.label,
                sublabel: `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}`,
                metadata: { address: addr },
            }));
            setAddressOptions(opts);

            const def = addrs.find((a) => a.isDefault);
            if (def) {
                setFormData((prev) => ({ ...prev, origin: formatAddress(def) }));
            }
        }).catch(() => {}).finally(() => {
            if (!cancelled) setAddressesLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    const handleAddressSelect = (field: 'origin' | 'destination') => (option: ComboboxOption) => {
        const addr = option.metadata?.address as Address | undefined;
        if (addr) {
            const formatted = formatAddress(addr);
            setFormData((prev) => ({ ...prev, [field]: formatted }));
        }
    };

    const handleAddressBookSelect = (address: Address) => {
        if (!addressBookTarget) return;
        const field = addressBookTarget;
        const formatted = formatAddress(address);
        setFormData((prev) => ({ ...prev, [field]: formatted }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    // Auto-fetch cost estimate when required fields are filled
useEffect(() => {
    const { origin, destination, weight } = formData;
    const hasRequired = origin.trim() && destination.trim() && Number(weight) > 0;
    if (!hasRequired) {
        const timer = setTimeout(() => { setCostEstimate(null); }, 0);
        return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
        setIsEstimating(true);
        const weightKg = Number(weight);
        const baseRate = 250 + weightKg * 8;
        const weightSurcharge = weightKg > 50 ? weightKg * 1.5 : weightKg * 0.8;
        const fuelSurcharge = baseRate * 0.075;
        const insuranceFee = baseRate * 0.03;
        const total = baseRate + weightSurcharge + fuelSurcharge + insuranceFee;

        setTimeout(() => {
            setCostEstimate({
                baseRate: parseFloat(baseRate.toFixed(2)),
                weightSurcharge: parseFloat(weightSurcharge.toFixed(2)),
                fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
                insuranceFee: parseFloat(insuranceFee.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                currency: 'USD',
            });
            setIsEstimating(false);
        }, 900);
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [formData.origin, formData.destination, formData.weight]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: FormData) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev: FormErrors) => ({ ...prev, [name]: '' }));
        }
    };

    const FIELD_ORDER = [
        'origin',
        'destination',
        'itemDescription',
        'weight',
        'expectedDeliveryDate',
        'recipientName',
        'recipientContact',
    ] as const;

    const validateField = (name: keyof FormData, data: FormData = formData): string => {
        switch (name) {
            case 'origin':
                return data.origin.trim() ? '' : 'Origin address is required';
            case 'destination':
                return data.destination.trim() ? '' : 'Destination address is required';
            case 'itemDescription':
                return data.itemDescription.trim() ? '' : 'Item description is required';
            case 'weight':
                return data.weight && Number(data.weight) > 0 ? '' : 'Valid weight is required';
            case 'recipientName':
                return data.recipientName.trim() ? '' : 'Recipient name is required';
            case 'recipientContact':
                return data.recipientContact.trim() ? '' : 'Recipient contact is required';
            case 'expectedDeliveryDate':
                return data.expectedDeliveryDate ? '' : 'Expected delivery date is required';
            default:
                return '';
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const message = validateField(name as keyof FormData);
        setErrors((prev: FormErrors) => ({ ...prev, [name]: message }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        FIELD_ORDER.forEach((field) => {
            const message = validateField(field);
            if (message) newErrors[field] = message;
        });

        setErrors(newErrors);

        const firstInvalidField = FIELD_ORDER.find((field) => newErrors[field]);
        if (firstInvalidField) {
            document.getElementById(firstInvalidField)?.focus();
            addToast('Please fix the highlighted fields before submitting.', 'error');
        }

        return Object.keys(newErrors).length === 0;
    };

    const validateTemplateFields = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.origin.trim()) newErrors.origin = 'Origin address is required';
        if (!formData.destination.trim()) newErrors.destination = 'Destination address is required';
        if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Item description is required';
        if (!formData.weight || Number(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!formData.recipientContact.trim()) newErrors.recipientContact = 'Recipient contact is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getErrorMessage = (error: AxiosError<{ message?: string }>): string => {
        if (error.response?.data?.message) return error.response.data.message;
        if (error.message) return error.message;
        return 'Failed to create shipment. Please try again.';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            const payload: CreateShipmentRequest = {
                origin: formData.origin.trim(),
                destination: formData.destination.trim(),
                enterpriseId: '',
                logisticsId: '',
                offChainMetadata: {
                    itemDescription: formData.itemDescription.trim(),
                    weight: formData.weight,
                    recipientName: formData.recipientName.trim(),
                    recipientContact: formData.recipientContact.trim(),
                    expectedDeliveryDate: formData.expectedDeliveryDate,
                },
            };

            const shipment = await shipmentApi.create(payload);
            setShipmentId(shipment.id ?? shipment._id);
            setSuccess(true);
            clearDraft();
            addToast('Shipment created successfully!', 'success');
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            addToast(getErrorMessage(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async (name: string) => {
        if (!validateTemplateFields()) {
            throw new Error('Fill in all reusable shipment fields before saving a template.');
        }

        const duplicate = templates.some(
            (template) => template.name.toLowerCase() === name.trim().toLowerCase(),
        );
        if (duplicate) {
            throw new Error('A template with this name already exists.');
        }

        await createTemplate({
            name,
            fields: toTemplateFields(formData),
        });
        addToast('Template saved successfully!', 'success');
    };

    const handleOpenSaveModal = () => {
        if (!validateTemplateFields()) {
            addToast('Fill in all reusable shipment fields before saving a template.', 'error');
            return;
        }
        setIsSaveModalOpen(true);
    };

    if (success) {
        return (
            <div className="px-6 py-8 bg-[#050505] text-slate-100 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center sm:p-4">
                <div className="bg-[#14171E] border border-slate-800 rounded-xl p-12 max-w-[500px] w-full text-center shadow-lg sm:px-5 sm:py-8">
                    <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" color="#22c55e" />
                    <h2 className="text-2xl font-semibold text-slate-100 mb-2">Shipment Created Successfully!</h2>
                    <p className="text-slate-400 text-[15px] mb-8">Your shipment has been registered on the blockchain.</p>
                    <div className="bg-[#0b0e14] border border-dashed border-blue-500 rounded-lg p-4 mb-8 flex flex-col gap-2">
                        <span className="text-slate-400 text-xs uppercase tracking-wider">Shipment ID:</span>
                        <span className="text-blue-500 text-xl font-semibold font-mono">{shipmentId}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button className="w-full bg-blue-600 border border-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-blue-700 hover:border-blue-700 disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => navigate('/dashboard/shipments')}>
                            View Shipment
                        </button>
                        <button className="w-full bg-transparent border border-slate-800 text-slate-100 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed" onClick={() => {
                            setSuccess(false);
                            setFormData(EMPTY_FORM);
                            setSelectedTemplateId('');
                        }}>
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="px-6 py-8 bg-[#050505] text-slate-100 min-h-[calc(100vh-80px)] flex flex-col items-center sm:p-4 w-full">
          <div className="w-full max-w-[800px] mb-6">
              <button className="flex items-center gap-2 bg-transparent border-none text-slate-100 text-sm cursor-pointer px-3 py-2 rounded-md transition-colors hover:bg-slate-800" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20} />
                  <span>Back</span>
              </button>
          </div>

          <div className="w-full max-w-[800px] bg-[#14171E] border border-slate-800 rounded-xl p-8 shadow-lg sm:p-5">
              <div className="mb-8 border-b border-slate-800 pb-6">
                  <Package className="text-blue-500 bg-blue-500/10 p-2 rounded-lg box-content mb-3" size={28} />
                  <h2 className="text-2xl font-semibold mt-3 mb-2 text-slate-100">Create New Shipment</h2>
                  <p className="text-slate-400 text-sm">Enter the shipment details to register it on the blockchain.</p>
              </div>

              {draft && (
                  <div className="flex items-center gap-3 p-4 mb-5 bg-blue-500/5 border border-blue-500/35 rounded-lg sm:flex-col sm:items-start" role="status">
                      <History size={18} className="text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-semibold text-slate-100">Unfinished shipment found</p>
                          <p className="m-0 mt-0.5 text-xs text-slate-400">
                              Saved {new Date(draft.savedAt).toLocaleString()}
                          </p>
                      </div>
                      <div className="flex gap-2 shrink-0 sm:w-full">
                          <button type="button" className="bg-blue-600 border border-blue-600 text-white px-3.5 py-2 text-xs font-semibold rounded-md transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-[#62FFFF] focus-visible:outline-offset-2 sm:flex-1" onClick={handleRestoreDraft}>
                              Restore draft
                          </button>
                          <button type="button" className="bg-transparent border border-slate-800 text-slate-400 px-3.5 py-2 text-xs font-semibold rounded-md transition-all hover:border-slate-700 hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-[#62FFFF] focus-visible:outline-offset-2 sm:flex-1" onClick={handleDiscardDraft}>
                              Discard
                          </button>
                      </div>
                  </div>
              )}

              <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex flex-col gap-2 mb-0">
                      <label htmlFor="load-template" className="text-sm font-medium text-slate-100">Load Template</label>
                      <select
                          id="load-template"
                          value={selectedTemplateId}
                          onChange={(e) => {
                              const templateId = e.target.value;
                              setSelectedTemplateId(templateId);
                              if (templateId) applyTemplate(templateId);
                          }}
                          disabled={templatesLoading || templates.length === 0}
                          className="w-full px-4 py-3 bg-[#0b0e14] border border-slate-800 rounded-lg text-slate-100 text-sm cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                          <option value="">
                              {templatesLoading
                                  ? 'Loading templates…'
                                  : templates.length === 0
                                    ? 'No saved templates'
                                    : 'Select a template'}
                          </option>
                          {templateOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                  {option.label}
                              </option>
                          ))}
                      </select>
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                          <label htmlFor="origin" className="text-sm font-medium text-slate-100">Origin Address</label>
                          <button
                              type="button"
                              className="inline-flex items-center gap-1 bg-transparent border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-blue-500/15"
                              onClick={() => setAddressBookTarget('origin')}
                          >
                              <Book size={12} />
                              Address Book
                          </button>
                      </div>
                      <Combobox
                          id="origin"
                          name="origin"
                          value={formData.origin}
                          onChange={(v) => {
                              setFormData((prev: FormData) => ({ ...prev, origin: v }));
                              if (errors.origin) setErrors((prev: FormErrors) => ({ ...prev, origin: '' }));
                          }}
                          onSelectOption={handleAddressSelect('origin')}
                          onBlur={() => {
                              const msg = validateField('origin');
                              setErrors((prev: FormErrors) => ({ ...prev, origin: msg }));
                          }}
                          options={addressOptions}
                          placeholder="Search or type an address..."
                          ariaLabel="Origin address"
                          isLoading={addressesLoading}
                          noResultsMessage="No matching addresses. Keep typing or enter a new one."
                          loadingMessage="Loading your saved addresses…"
                          className={errors.origin ? '[&_input]:border-red-500 [&_input]:focus:border-red-400' : ''}
                      />
                      {errors.origin && <span id="origin-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.origin}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                          <label htmlFor="destination" className="text-sm font-medium text-slate-100">Destination Address</label>
                          <button
                              type="button"
                              className="inline-flex items-center gap-1 bg-transparent border border-blue-500 text-blue-500 text-xs px-2 py-0.5 rounded cursor-pointer transition-all hover:bg-blue-500/15"
                              onClick={() => setAddressBookTarget('destination')}
                          >
                              <Book size={12} />
                              Address Book
                          </button>
                      </div>
                      <Combobox
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={(v) => {
                              setFormData((prev: FormData) => ({ ...prev, destination: v }));
                              if (errors.destination) setErrors((prev: FormErrors) => ({ ...prev, destination: '' }));
                          }}
                          onSelectOption={handleAddressSelect('destination')}
                          onBlur={() => {
                              const msg = validateField('destination');
                              setErrors((prev: FormErrors) => ({ ...prev, destination: msg }));
                          }}
                          options={addressOptions}
                          placeholder="Search or type an address..."
                          ariaLabel="Destination address"
                          isLoading={addressesLoading}
                          noResultsMessage="No matching addresses. Keep typing or enter a new one."
                          loadingMessage="Loading your saved addresses…"
                          className={errors.destination ? '[&_input]:border-red-500 [&_input]:focus:border-red-400' : ''}
                      />
                      {errors.destination && <span id="destination-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.destination}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                      <label htmlFor="itemDescription" className="text-sm font-medium text-slate-100">Item Description</label>
                      <textarea
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          aria-invalid={!!errors.itemDescription}
                          aria-describedby={errors.itemDescription ? "itemDescription-error" : undefined}
                          className={inputClasses(!!errors.itemDescription)}
                          placeholder="Describe the items being shipped..."
                          rows={3}
                      />
                      {errors.itemDescription && <span id="itemDescription-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.itemDescription}</span>}
                  </div>

                  <div className="flex gap-6 sm:flex-col sm:gap-6">
                      <div className="flex flex-col gap-2 flex-1">
                          <label htmlFor="weight" className="text-sm font-medium text-slate-100">Weight (kg)</label>
                          <input
                              type="number"
                              id="weight"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.weight}
                              aria-describedby={errors.weight ? "weight-error" : undefined}
                              className={inputClasses(!!errors.weight)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                          />
                          {errors.weight && <span id="weight-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.weight}</span>}
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                          <label htmlFor="expectedDeliveryDate" className="text-sm font-medium text-slate-100">Expected Delivery Date</label>
                          <input
                              type="date"
                              id="expectedDeliveryDate"
                              name="expectedDeliveryDate"
                              value={formData.expectedDeliveryDate}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.expectedDeliveryDate}
                              aria-describedby={errors.expectedDeliveryDate ? "expectedDeliveryDate-error" : undefined}
                              className={inputClasses(!!errors.expectedDeliveryDate)}
                          />
                          {errors.expectedDeliveryDate && <span id="expectedDeliveryDate-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.expectedDeliveryDate}</span>}
                      </div>
                  </div>

                  <div className="flex gap-6 sm:flex-col sm:gap-6">
                      <div className="flex flex-col gap-2 flex-1">
                          <label htmlFor="recipientName" className="text-sm font-medium text-slate-100">Recipient Name</label>
                          <input
                              type="text"
                              id="recipientName"
                              name="recipientName"
                              value={formData.recipientName}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.recipientName}
                              aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
                              className={inputClasses(!!errors.recipientName)}
                              placeholder="John Doe"
                          />
                          {errors.recipientName && <span id="recipientName-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.recipientName}</span>}
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                          <label htmlFor="recipientContact" className="text-sm font-medium text-slate-100">Recipient Contact</label>
                          <input
                              type="text"
                              id="recipientContact"
                              name="recipientContact"
                              value={formData.recipientContact}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.recipientContact}
                              aria-describedby={errors.recipientContact ? "recipientContact-error" : undefined}
                              className={inputClasses(!!errors.recipientContact)}
                              placeholder="Phone or Email"
                          />
                          {errors.recipientContact && <span id="recipientContact-error" className="text-red-500 text-xs -mt-1" role="alert">{errors.recipientContact}</span>}
                      </div>
                  </div>

                  <CostBreakdown
                    data={costEstimate}
                    isLoading={isEstimating}
                    mode="estimate"
                />

                  <p className="m-0 mt-1 text-xs text-slate-500" aria-live="polite">
                      {lastSavedAt
                          ? `Draft saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                          : 'Your progress is saved automatically as you type.'}
                  </p>

                  <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-slate-800 sm:flex-col-reverse">
                      <button type="button" className="bg-transparent border border-slate-800 text-slate-100 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full" onClick={() => navigate(-1)} disabled={loading}>
                          Cancel
                      </button>
                      <button type="button" className="bg-transparent border border-slate-700 text-slate-300 px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800 hover:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full flex items-center justify-center gap-2" onClick={handleOpenSaveModal} disabled={loading}>
                          Save as Template
                      </button>
                      <button type="submit" className="bg-blue-600 border border-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all hover:bg-blue-700 hover:border-blue-700 disabled:opacity-60 disabled:cursor-not-allowed sm:w-full flex items-center justify-center gap-2" disabled={loading}>
                          {loading ? (
                              <>
                                  <Loader2 className="animate-spin" size={20} />
                                  <span>Processing...</span>
                              </>
                          ) : (
                              'Create Shipment'
                          )}
                      </button>
                  </div>
              </form>


          </div>

          <SaveTemplateModal
              isOpen={isSaveModalOpen}
              onClose={() => setIsSaveModalOpen(false)}
              onSave={handleSaveTemplate}
          />

          <AddressBookPickerModal
               isOpen={addressBookTarget !== null}
               onClose={() => setAddressBookTarget(null)}
               onSelect={handleAddressBookSelect}
          />
    </div>
  );
};

export default CreateShipment;
