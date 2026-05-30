'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, page, limit, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-100 gap-4">
      <div className="text-sm font-medium text-gray-500">
        Hiển thị <span className="font-bold text-gray-900">{start}</span> – <span className="font-bold text-gray-900">{end}</span> trong <span className="font-bold text-gray-900">{total}</span> kết quả
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            // Simplified pagination window for large datasets
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              return (
                <button
                  key={p}
                  onClick={() => onChange(p)}
                  className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    page === p 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === page - 2 || p === page + 2) {
              return <span key={p} className="text-gray-400">...</span>;
            }
            return null;
          })}
        </div>

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
