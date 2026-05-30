'use client';

// In a real robust implementation, this should trigger a ToastProvider state.
// For now, this is a lightweight wrapper that creates a DOM toast element to avoid breaking the layout with heavy contexts.
export function useToast() {
  const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2';
      document.body.appendChild(container);
    }

    const colors = {
      success: 'bg-emerald-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const el = document.createElement('div');
    el.className = `${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-2`;
    
    // Add icon
    const iconStr = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    el.innerHTML = `<span className="font-bold border-2 border-white rounded-full w-5 h-5 flex items-center justify-center text-xs">${iconStr}</span><span>${message}</span>`;
    
    container.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      el.classList.remove('translate-y-10', 'opacity-0');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      el.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 3000);
  };

  return {
    toast,
    success: (message: string) => toast(message, 'success'),
    error: (message: string) => toast(message, 'error'),
    info: (message: string) => toast(message, 'info'),
  };
}
