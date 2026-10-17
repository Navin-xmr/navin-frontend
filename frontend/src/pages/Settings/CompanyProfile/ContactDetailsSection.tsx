import React from 'react';
import { UploadCloud } from 'lucide-react';
import SectionCard from './SectionCard';

interface ContactDetailsData {
  email: string;
  phone: string;
  website: string;
}

interface ContactDetailsSectionProps {
  data: ContactDetailsData;
  errors: Record<string, string>;
  dirty: boolean;
  inputClassName: string;
  onChange: (updates: Partial<ContactDetailsData>) => void;
  onSave: () => void;
}

const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({
  data,
  errors,
  dirty,
  inputClassName,
  onChange,
  onSave,
}) => (
  <SectionCard
    title="Contact Details"
    description="Add contact details that customers and partners can use to reach your team."
    icon={<UploadCloud size={18} />}
    dirty={dirty}
    onSave={onSave}
  >
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm text-slate-400">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={inputClassName}
          placeholder="hello@company.com"
        />
        {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="contact-phone" className="mb-2 block text-sm text-slate-400">
          Phone
        </label>
        <input
          id="contact-phone"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={inputClassName}
          placeholder="+234 800 123 4567"
        />
        {errors.phone && <p className="mt-1 text-sm text-rose-400">{errors.phone}</p>}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="contact-website" className="mb-2 block text-sm text-slate-400">
          Website
        </label>
        <input
          id="contact-website"
          value={data.website}
          onChange={(e) => onChange({ website: e.target.value })}
          className={inputClassName}
          placeholder="https://company.com"
        />
        {errors.website && <p className="mt-1 text-sm text-rose-400">{errors.website}</p>}
      </div>
    </div>
  </SectionCard>
);

export default ContactDetailsSection;
