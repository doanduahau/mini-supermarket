'use client';

import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface ExportPDFButtonProps {
  payrollId: string;
  employeeName: string;
  month: number;
  year: number;
}

export default function ExportPDFButton({ payrollId, employeeName, month, year }: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/payroll/${payrollId}/export-pdf`, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `phieu-luong-${employeeName}-${month}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Use standard alert if toast is not globally available in this scope
      // In a real app, use the useToast hook
      // alert('Xuất PDF thành công');
    } catch (error) {
      console.error(error);
      alert('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Xuất PDF
    </button>
  );
}
