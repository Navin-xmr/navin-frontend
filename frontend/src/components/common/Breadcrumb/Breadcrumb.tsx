import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem, BreadcrumbProps } from './types';

const DEFAULT_MOBILE_COLLAPSE_AT = 4;

function Breadcrumb({
  items,
  current,
  separator = '/',
  className = '',
  mobileCollapseAt = DEFAULT_MOBILE_COLLAPSE_AT,
}: BreadcrumbProps): ReactElement {
  const hasCurrentItem = items.some((item) => item.label === current);
  const breadcrumbItems: BreadcrumbItem[] = hasCurrentItem
    ? items
    : [...items, { label: current }];

  const mobileItems =
    breadcrumbItems.length > mobileCollapseAt
      ? [breadcrumbItems[0], { label: '...' }, breadcrumbItems[breadcrumbItems.length - 1]]
      : breadcrumbItems;

  const renderItem = (item: BreadcrumbItem, isCurrentPage: boolean) => {
    if (isCurrentPage) {
      return (
        <span aria-current="page" className="text-text-primary font-semibold">
          {item.label}
        </span>
      );
    }

    if (!item.href) {
      return <span className="text-text-secondary">{item.label}</span>;
    }

    return (
      <Link to={item.href} className="text-text-secondary hover:text-[#62ffff] transition-colors">
        {item.label}
      </Link>
    );
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="hidden sm:flex items-center flex-wrap gap-y-1 text-sm font-medium">
        {breadcrumbItems.map((item, index) => {
          const isCurrentPage = item.label === current;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center min-w-0">
              {index > 0 && <span className="mx-2 text-text-secondary/70">{separator}</span>}
              <span className="truncate max-w-[180px]">{renderItem(item, isCurrentPage)}</span>
            </li>
          );
        })}
      </ol>

      <ol className="flex sm:hidden items-center text-sm font-medium min-w-0">
        {mobileItems.map((item, index) => {
          const isCurrentPage = item.label === current;
          const isCollapsedToken = item.label === '...';

          return (
            <li key={`${item.label}-${index}`} className="flex items-center min-w-0">
              {index > 0 && <span className="mx-2 text-text-secondary/70">{separator}</span>}
              {isCollapsedToken ? (
                <span className="text-text-secondary" aria-hidden="true">
                  ...
                </span>
              ) : (
                <span className="truncate max-w-[120px]">{renderItem(item, isCurrentPage)}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
