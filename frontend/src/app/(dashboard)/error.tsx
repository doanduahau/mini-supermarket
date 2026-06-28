'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-3xl border border-red-100 shadow-sm p-10 text-center mx-auto max-w-lg mt-10">
      <div className="w-20 h-20 bg-red-50 text-red-500 flex items-center justify-center rounded-full mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi hệ thống!</h2>
      <p className="text-gray-500 mb-8">
        Không thể tải dữ liệu trang. Vui lòng thử lại sau.
      </p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
      >
        Thử lại
      </button>
    </div>
  );
}
