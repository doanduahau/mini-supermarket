'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: any) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className={`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 w-full ${maxWidth} p-6 max-h-[90vh] overflow-y-auto outline-none animate-in zoom-in-95 duration-200`}>
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <Dialog.Title className="text-xl font-extrabold text-gray-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
