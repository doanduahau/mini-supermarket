'use client';
import { useState } from 'react';

export function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  
  const resetPage = () => setPage(1);
  
  return { page, limit, setPage, resetPage };
}
