import React from 'react';
import type { ComboboxOption } from '@components/ui/Combobox';

export interface TemplateSelectorProps {
  selectedTemplateId: string;
  templateOptions: ComboboxOption[];
  templatesLoading: boolean;
  noTemplates: boolean;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  templateOptions,
  templatesLoading,
  noTemplates,
  onTemplateChange,
}) => (
  <div className="mb-6 pb-6 border-b border-slate-800">
    <div className="flex flex-col gap-2 mb-0">
      <label htmlFor="load-template" className="text-sm font-medium text-slate-100">
        Load Template
      </label>
      <select
        id="load-template"
        value={selectedTemplateId}
        onChange={(e) => onTemplateChange(e.target.value)}
        disabled={templatesLoading || noTemplates}
        className="w-full px-4 py-3 bg-[#0b0e14] border border-slate-800 rounded-lg text-slate-100 text-sm cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="">
          {templatesLoading ? 'Loading templates…' : noTemplates ? 'No saved templates' : 'Select a template'}
        </option>
        {templateOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default TemplateSelector;
