'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-3xl',
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className={`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[101] w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col outline-none animate-in zoom-in-95 duration-200`}>
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <Dialog.Title className="text-xl font-extrabold text-gray-900">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
