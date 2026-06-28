'use client';

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, isLoading, emptyMessage = 'Không có dữ liệu' }: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
      <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
        <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Inbox className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="font-medium text-gray-500">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
