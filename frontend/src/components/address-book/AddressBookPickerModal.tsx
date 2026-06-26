import React, { useEffect, useState } from 'react';
import { Book, Search, Star } from 'lucide-react';
import { addressesApi } from '@services/api/endpoints/addresses';
import type { Address } from '@services/api/endpoints/addresses';
import Modal from '@components/common/Modal/Modal';

interface AddressBookPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

const AddressBookPickerModal: React.FC<AddressBookPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    addressesApi
      .getAll()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const filtered = addresses.filter((addr) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      addr.label.toLowerCase().includes(q) ||
      addr.name.toLowerCase().includes(q) ||
      addr.street.toLowerCase().includes(q) ||
      addr.city.toLowerCase().includes(q) ||
      addr.country.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) =>
    a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Address"
      size="lg"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search addresses…"
            className="w-full bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.2)] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#62ffff]"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Loading addresses…
          </p>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Book size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              {search
                ? 'No addresses match your search.'
                : 'No saved addresses. Add one in Settings.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sorted.map((addr) => (
              <button
                key={addr._id}
                onClick={() => {
                  onSelect(addr);
                  onClose();
                }}
                className="w-full text-left bg-[rgba(19,186,186,0.05)] border border-[rgba(98,255,255,0.1)] hover:bg-[rgba(19,186,186,0.1)] hover:border-[#62ffff]/40 rounded-lg p-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(19,186,186,0.15)] flex items-center justify-center shrink-0">
                    <Book size={14} className="text-[#62ffff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <Star size={12} className="text-yellow-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{addr.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddressBookPickerModal;
