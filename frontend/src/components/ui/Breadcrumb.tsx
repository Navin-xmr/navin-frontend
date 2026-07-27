import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight size={13} className="text-slate-600" />,
}) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {isLast ? (
                <span className="text-white font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="text-slate-400 hover:text-[#62ffff] transition-colors duration-150 rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-[#62ffff] focus-visible:ring-offset-1"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-400">{item.label}</span>
                  )}
                  <span aria-hidden="true" className="flex items-center">
                    {separator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
