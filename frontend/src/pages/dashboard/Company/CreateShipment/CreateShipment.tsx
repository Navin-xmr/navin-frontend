import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SaveTemplateModal from '@components/shipment/SaveTemplateModal';
import AddressBookPickerModal from '@components/address-book/AddressBookPickerModal';
import { useShipmentForm } from './useShipmentForm';
import SuccessView from './SuccessView';
import DraftBanner from './DraftBanner';
import TemplateSelector from './TemplateSelector';
import ShipmentForm from './ShipmentForm';

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
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
  } = useShipmentForm();

  // Apply template from URL query param
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (!templateId || templatesLoading || templates.length === 0) return;
    if (selectedTemplateId === templateId) return;
    const timer = setTimeout(() => { applyTemplate(templateId); }, 0);
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

    const applyTemplate = useCallback((templateId: string) => {
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
    }, [addToast, templates]);

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
    }, [applyTemplate, searchParams, selectedTemplateId, templates, templatesLoading]);
    const [addressOptions, setAddressOptions] = useState<ComboboxOption[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);

    // Load addresses for typeahead suggestions
    useEffect(() => {
        let cancelled = false;
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
  }, [applyTemplate, searchParams, selectedTemplateId, templates, templatesLoading]);

  if (success) {
    return <SuccessView shipmentId={shipmentId} onCreateAnother={resetSuccess} />;
  }

  return (
    <div className="px-6 py-8 bg-[#050505] text-slate-100 min-h-[calc(100vh-80px)] flex flex-col items-center sm:p-4 w-full">
      <div className="w-full max-w-[800px] mb-6">
        <button
          className="flex items-center gap-2 bg-transparent border-none text-slate-100 text-sm cursor-pointer px-3 py-2 rounded-md transition-colors hover:bg-slate-800"
          onClick={() => navigate(-1)}
        >
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
          <DraftBanner
            savedAt={draft.savedAt}
            onRestore={handleRestoreDraft}
            onDiscard={handleDiscardDraft}
          />
        )}

        <TemplateSelector
          selectedTemplateId={selectedTemplateId}
          templateOptions={templateOptions}
          templatesLoading={templatesLoading}
          noTemplates={templates.length === 0}
          onTemplateChange={(templateId) => {
            setSelectedTemplateId(templateId);
            if (templateId) applyTemplate(templateId);
          }}
        />

        <ShipmentForm
          formData={formData}
          errors={errors}
          loading={loading}
          addressOptions={addressOptions}
          addressesLoading={addressesLoading}
          costEstimate={costEstimate}
          isEstimating={isEstimating}
          lastSavedAt={lastSavedAt}
          onInputChange={handleInputChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          onOriginChange={(v) => {
            setFormData((prev) => ({ ...prev, origin: v }));
            if (errors.origin) setErrors((prev) => ({ ...prev, origin: '' }));
          }}
          onDestinationChange={(v) => {
            setFormData((prev) => ({ ...prev, destination: v }));
            if (errors.destination) setErrors((prev) => ({ ...prev, destination: '' }));
          }}
          onOriginSelect={handleAddressSelect('origin')}
          onDestinationSelect={handleAddressSelect('destination')}
          onOriginBlur={() => {
            const msg = formData.origin.trim() ? '' : 'Origin address is required';
            setErrors((prev) => ({ ...prev, origin: msg }));
          }}
          onDestinationBlur={() => {
            const msg = formData.destination.trim() ? '' : 'Destination address is required';
            setErrors((prev) => ({ ...prev, destination: msg }));
          }}
          onOpenAddressBookOrigin={() => setAddressBookTarget('origin')}
          onOpenAddressBookDestination={() => setAddressBookTarget('destination')}
          onOpenSaveModal={handleOpenSaveModal}
        />
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
