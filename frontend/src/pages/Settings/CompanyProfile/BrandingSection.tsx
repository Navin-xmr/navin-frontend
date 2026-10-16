import React from 'react';
import { Building2 } from 'lucide-react';
import FileUpload from '../../../components/ui/FileUpload';
import SectionCard from './SectionCard';

interface BrandingSectionProps {
  logoPreview: string | null;
  logoName: string;
  errors: Record<string, string>;
  dirty: boolean;
  onFilesSelected: (files: File[]) => void;
  onSave: () => void;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({
  logoPreview,
  logoName,
  errors,
  dirty,
  onFilesSelected,
  onSave,
}) => (
  <SectionCard
    title="Branding"
    description="Upload a square logo and preview it before you save it for the navbar."
    icon={<Building2 size={18} />}
    dirty={dirty}
    onSave={onSave}
  >
    <div className="space-y-4">
      <FileUpload
        accept={['image/*']}
        maxSizeMB={5}
        onFilesSelected={onFilesSelected}
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:flex-row md:items-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          {logoPreview ? (
            <img src={logoPreview} alt="Company logo preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-slate-500">No logo</span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">
            {logoName || 'Upload an image to preview your square logo'}
          </p>
          <p className="text-sm text-slate-400">
            The image is cropped to a square preview before saving so it displays neatly in the navbar.
          </p>
          {errors.logo && <p className="text-sm text-rose-400">{errors.logo}</p>}
        </div>
      </div>
    </div>
  </SectionCard>
);

export default BrandingSection;
