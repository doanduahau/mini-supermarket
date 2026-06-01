'use client';
import toast from 'react-hot-toast';

import React, { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface ExportExcelButtonProps {
  month: number;
  year: number;
  disabled?: boolean;
}

export default function ExportExcelButton({ month, year, disabled }: ExportExcelButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/payroll/export-excel', {
        params: { month, year },
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bang-luong-${month}-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Không thể xuất Excel. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={disabled || loading}
      className="inline-flex items-center gap-2 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
      Xuất Excel
    </button>
  );
}
