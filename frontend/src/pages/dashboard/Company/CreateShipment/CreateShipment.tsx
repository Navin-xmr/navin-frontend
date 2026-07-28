import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowLeft, Loader2, Book, History } from 'lucide-react';
import { CheckCircle2, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { shipmentApi, type CreateShipmentRequest } from '@services/api/endpoints/shipments';
import { addressesApi } from '@services/api/endpoints/addresses';
import type { Address } from '@services/api/endpoints/addresses';
import { useToast } from '@context/ToastContext';
import { useShipmentTemplates } from '@hooks/useShipmentTemplates';
import { useFormDraft } from '@hooks/useFormDraft';
import SaveTemplateModal from '@components/shipment/SaveTemplateModal/SaveTemplateModal';
import { getTemplatePreview, toTemplateFields } from '../../../../types/shipmentTemplate';
import type { AxiosError } from 'axios';
import Combobox from '@components/ui/Combobox';
import type { ComboboxOption } from '@components/ui/Combobox';
import CostBreakdown from '@components/shipment/CostBreakdown/CostBreakdown';
import { formatAddress as formatLocalizedAddress } from '@utils/localeFormat';
import type { CostBreakdownData } from '@components/shipment/CostBreakdown/CostBreakdown';
import './CreateShipment.css';

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
            <div className="create-shipment-container success-view">
                <div className="success-content">
                    <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" color="#22c55e" />
                    <h2 className="success-title">Shipment Created Successfully!</h2>
                    <p className="success-message">Your shipment has been registered on the blockchain.</p>
                    <div className="shipment-id-box">
                        <span className="shipment-id-label">Shipment ID:</span>
                        <span className="shipment-id-value">{shipmentId}</span>
                    </div>
                    <div className="success-actions">
                        <button className="primary-btn" onClick={() => navigate('/dashboard/shipments')}>
                            View Shipment
                        </button>
                        <button className="secondary-btn" onClick={() => {
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
    <div className="create-shipment-container">
          <div className="header-actions">
              <button className="back-btn" onClick={() => navigate(-1)}>
                  <ArrowLeft size={20} />
                  <span>Back</span>
              </button>
          </div>

          <div className="form-wrapper">
              <div className="form-header">
                  <Package className="form-icon" size={28} />
                  <h2>Create New Shipment</h2>
                  <p>Enter the shipment details to register it on the blockchain.</p>
              </div>

              {draft && (
                  <div className="draft-banner" role="status">
                      <History size={18} className="draft-banner-icon" />
                      <div className="draft-banner-text">
                          <p className="draft-banner-title">Unfinished shipment found</p>
                          <p className="draft-banner-meta">
                              Saved {new Date(draft.savedAt).toLocaleString()}
                          </p>
                      </div>
                      <div className="draft-banner-actions">
                          <button type="button" className="draft-restore-btn" onClick={handleRestoreDraft}>
                              Restore draft
                          </button>
                          <button type="button" className="draft-discard-btn" onClick={handleDiscardDraft}>
                              Discard
                          </button>
                      </div>
                  </div>
              )}

              <div className="template-toolbar">
                  <div className="form-group template-select-group">
                      <label htmlFor="load-template">Load Template</label>
                      <select
                          id="load-template"
                          value={selectedTemplateId}
                          onChange={(e) => {
                              const templateId = e.target.value;
                              setSelectedTemplateId(templateId);
                              if (templateId) applyTemplate(templateId);
                          }}
                          disabled={templatesLoading || templates.length === 0}
                          className="template-select"
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

              <form onSubmit={handleSubmit} className="shipment-form">
                  <div className="form-group">
                      <label htmlFor="origin">Origin Address</label>
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
                      {errors.origin && <span id="origin-error" className="error-text" role="alert">{errors.origin}</span>}
                  </div>

                  <div className="form-group">
                      <label htmlFor="destination">Destination Address</label>
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
                      {errors.destination && <span id="destination-error" className="error-text" role="alert">{errors.destination}</span>}
                  </div>

                  <div className="form-group">
                      <label htmlFor="itemDescription">Item Description</label>
                      <textarea
                          id="itemDescription"
                          name="itemDescription"
                          value={formData.itemDescription}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          aria-invalid={!!errors.itemDescription}
                          aria-describedby={errors.itemDescription ? "itemDescription-error" : undefined}
                          className={errors.itemDescription ? 'input-error' : ''}
                          placeholder="Describe the items being shipped..."
                          rows={3}
                      />
                      {errors.itemDescription && <span id="itemDescription-error" className="error-text" role="alert">{errors.itemDescription}</span>}
                  </div>

                  <div className="form-row">
                      <div className="form-group half-width">
                          <label htmlFor="weight">Weight (kg)</label>
                          <input
                              type="number"
                              id="weight"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.weight}
                              aria-describedby={errors.weight ? "weight-error" : undefined}
                              className={errors.weight ? 'input-error' : ''}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                          />
                          {errors.weight && <span id="weight-error" className="error-text" role="alert">{errors.weight}</span>}
                      </div>

                      <div className="form-group half-width">
                          <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                          <input
                              type="date"
                              id="expectedDeliveryDate"
                              name="expectedDeliveryDate"
                              value={formData.expectedDeliveryDate}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.expectedDeliveryDate}
                              aria-describedby={errors.expectedDeliveryDate ? "expectedDeliveryDate-error" : undefined}
                              className={errors.expectedDeliveryDate ? 'input-error' : ''}
                          />
                          {errors.expectedDeliveryDate && <span id="expectedDeliveryDate-error" className="error-text" role="alert">{errors.expectedDeliveryDate}</span>}
                      </div>
                  </div>

                  <div className="form-row">
                      <div className="form-group half-width">
                          <label htmlFor="recipientName">Recipient Name</label>
                          <input
                              type="text"
                              id="recipientName"
                              name="recipientName"
                              value={formData.recipientName}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.recipientName}
                              aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
                              className={errors.recipientName ? 'input-error' : ''}
                              placeholder="John Doe"
                          />
                          {errors.recipientName && <span id="recipientName-error" className="error-text" role="alert">{errors.recipientName}</span>}
                      </div>

                      <div className="form-group half-width">
                          <label htmlFor="recipientContact">Recipient Contact</label>
                          <input
                              type="text"
                              id="recipientContact"
                              name="recipientContact"
                              value={formData.recipientContact}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.recipientContact}
                              aria-describedby={errors.recipientContact ? "recipientContact-error" : undefined}
                              className={errors.recipientContact ? 'input-error' : ''}
                              placeholder="Phone or Email"
                          />
                          {errors.recipientContact && <span id="recipientContact-error" className="error-text" role="alert">{errors.recipientContact}</span>}
                      </div>
                  </div>

                  <CostBreakdown
                    data={costEstimate}
                    isLoading={isEstimating}
                    mode="estimate"
                />

                  <p className="draft-status" aria-live="polite">
                      {lastSavedAt
                          ? `Draft saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                          : 'Your progress is saved automatically as you type.'}
                  </p>

                  <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => navigate(-1)} disabled={loading}>
                          Cancel
                      </button>
                      <button type="button" className="template-btn" onClick={handleOpenSaveModal} disabled={loading}>
                          Save as Template
                      </button>
                      <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? (
                              <>
                                  <Loader2 className="spinner" size={20} />
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
    </div>
  );
};

export default CreateShipment;
