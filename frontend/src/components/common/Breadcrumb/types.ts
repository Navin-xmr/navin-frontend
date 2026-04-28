export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  current: string;
  separator?: '/' | '>';
  className?: string;
  mobileCollapseAt?: number;
}
