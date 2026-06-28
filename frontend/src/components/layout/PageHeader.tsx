import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-gray-500 font-medium">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
