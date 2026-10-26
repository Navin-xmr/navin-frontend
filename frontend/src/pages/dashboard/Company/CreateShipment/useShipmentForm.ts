import { useState, useEffect, useMemo, useCallback } from 'react';
import { shipmentApi, type CreateShipmentRequest } from '@services/api/endpoints/shipments';
import { addressesApi } from '@services/api/endpoints/addresses';
import type { Address } from '@services/api/endpoints/addresses';
import { useToast } from '@context/ToastContext';
import { useShipmentTemplates } from '@hooks/useShipmentTemplates';
import { useFormDraft } from '@hooks/useFormDraft';
import { getTemplatePreview, toTemplateFields } from '../../../types/shipmentTemplate';
import { formatAddress as formatLocalizedAddress } from '@utils/localeFormat';
import type { ComboboxOption } from '@components/ui/Combobox';
import type { CostBreakdownData } from '@components/shipment/CostBreakdown';
import type { AxiosError } from 'axios';

export interface FormData {
  origin: string;
  destination: string;
  itemDescription: string;
  weight: string;
  recipientName: string;
  recipientContact: string;
  expectedDeliveryDate: string;
}

export interface FormErrors {
  [key: string]: string;
}

export const EMPTY_FORM: FormData = {
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

const FIELD_ORDER = [
  'origin', 'destination', 'itemDescription', 'weight',
  'expectedDeliveryDate', 'recipientName', 'recipientContact',
] as const;

type FieldName = typeof FIELD_ORDER[number];

function validateField(name: FieldName, data: FormData): string {
  switch (name) {
    case 'origin': return data.origin.trim() ? '' : 'Origin address is required';
    case 'destination': return data.destination.trim() ? '' : 'Destination address is required';
    case 'itemDescription': return data.itemDescription.trim() ? '' : 'Item description is required';
    case 'weight': return data.weight && Number(data.weight) > 0 ? '' : 'Valid weight is required';
    case 'recipientName': return data.recipientName.trim() ? '' : 'Recipient name is required';
    case 'recipientContact': return data.recipientContact.trim() ? '' : 'Recipient contact is required';
    case 'expectedDeliveryDate': return data.expectedDeliveryDate ? '' : 'Expected delivery date is required';
    default: return '';
  }
}

function getErrorMessage(error: AxiosError<{ message?: string }>): string {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return 'Failed to create shipment. Please try again.';
}

export interface UseShipmentFormReturn {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  success: boolean;
  shipmentId: string;
  selectedTemplateId: string;
  addressOptions: ComboboxOption[];
  addressesLoading: boolean;
  costEstimate: CostBreakdownData | null;
  isEstimating: boolean;
  lastSavedAt: Date | null;
  draft: { savedAt: number } | null;
  templates: ReturnType<typeof useShipmentTemplates>['templates'];
  templatesLoading: boolean;
  templateOptions: ComboboxOption[];
  isSaveModalOpen: boolean;
  addressBookTarget: 'origin' | 'destination' | null;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setIsSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAddressBookTarget: React.Dispatch<React.SetStateAction<'origin' | 'destination' | null>>;
  setSelectedTemplateId: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleAddressSelect: (field: 'origin' | 'destination') => (option: ComboboxOption) => void;
  handleAddressBookSelect: (address: Address) => void;
  handleRestoreDraft: () => void;
  handleDiscardDraft: () => void;
  handleOpenSaveModal: () => void;
  handleSaveTemplate: (name: string) => Promise<void>;
  applyTemplate: (templateId: string) => void;
  resetSuccess: () => void;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

export function useShipmentForm(): UseShipmentFormReturn {
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
  const [addressOptions, setAddressOptions] = useState<ComboboxOption[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  const { draft, lastSavedAt, restoreDraft, discardDraft, clearDraft } = useFormDraft<FormData>(
    DRAFT_STORAGE_KEY,
    formData,
    isFormEmpty,
    { disabled: loading || success },
  );

  const formatAddress = (addr: Address): string =>
    formatLocalizedAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });

  // Load addresses for typeahead suggestions
  useEffect(() => {
    let cancelled = false;
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

  // Cost estimate auto-calculation
  const { origin: formOrigin, destination: formDestination, weight: formWeight } = formData;
  useEffect(() => {
    const hasRequired = formOrigin.trim() && formDestination.trim() && Number(formWeight) > 0;
    if (!hasRequired) {
      const timer = setTimeout(() => { setCostEstimate(null); }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setIsEstimating(true);
      const weightKg = Number(formWeight);
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
  }, [formOrigin, formDestination, formWeight]);

  const templateOptions = useMemo(
    () => templates.map((template) => ({
      id: template.id,
      label: `${template.name} — ${getTemplatePreview(template)}`,
    })),
    [templates],
  );

  const applyTemplate = useCallback((templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setFormData((prev) => ({ ...prev, ...template.fields, expectedDeliveryDate: prev.expectedDeliveryDate }));
    setSelectedTemplateId(templateId);
    setErrors({});
    addToast(`Loaded template "${template.name}"`, 'success');
  }, [addToast, templates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    const message = validateField(name as FieldName, formData);
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    FIELD_ORDER.forEach((field) => {
      const message = validateField(field, formData);
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

  const handleAddressSelect = (field: 'origin' | 'destination') => (option: ComboboxOption) => {
    const addr = option.metadata?.address as Address | undefined;
    if (addr) {
      setFormData((prev) => ({ ...prev, [field]: formatAddress(addr) }));
    }
  };

  const handleAddressBookSelect = (address: Address) => {
    if (!addressBookTarget) return;
    const field = addressBookTarget;
    const formatted = formatAddress(address);
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

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

  const handleOpenSaveModal = () => {
    if (!validateTemplateFields()) {
      addToast('Fill in all reusable shipment fields before saving a template.', 'error');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveTemplate = async (name: string) => {
    if (!validateTemplateFields()) {
      throw new Error('Fill in all reusable shipment fields before saving a template.');
    }
    const duplicate = templates.some(
      (template) => template.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (duplicate) throw new Error('A template with this name already exists.');
    await createTemplate({ name, fields: toTemplateFields(formData) });
    addToast('Template saved successfully!', 'success');
  };

  const resetSuccess = () => {
    setSuccess(false);
    setFormData(EMPTY_FORM);
    setSelectedTemplateId('');
  };

  return {
    formData, errors, loading, success, shipmentId,
    selectedTemplateId, addressOptions, addressesLoading,
    costEstimate, isEstimating, lastSavedAt, draft,
    templates, templatesLoading, templateOptions,
    isSaveModalOpen, addressBookTarget,
    setFormData, setIsSaveModalOpen, setAddressBookTarget, setSelectedTemplateId,
    handleInputChange, handleBlur, handleSubmit,
    handleAddressSelect, handleAddressBookSelect,
    handleRestoreDraft, handleDiscardDraft,
    handleOpenSaveModal, handleSaveTemplate,
    applyTemplate, resetSuccess, setErrors,
  };
}
