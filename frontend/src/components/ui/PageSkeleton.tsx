import React from 'react';

const PageSkeleton: React.FC = () => (
  <div className="p-8 animate-pulse" role="status" aria-label="Loading page…">
    <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-6" />
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl" />
      ))}
    </div>
  </div>
);

export default PageSkeleton;
