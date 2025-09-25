import React, { ReactNode } from 'react';

// Interface for the component's props
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string; // Optional prop
  children: ReactNode; // Type for any valid React content
}

// Apply the props interface to the component
const Dialog = ({ isOpen, onClose, title, children, description = '' }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="relative w-full max-w-[90vw] sm:max-w-lg rounded-lg border bg-white p-6 shadow-lg dark:bg-slate-900 dark:border-slate-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-slate-100">{title}</h3>
          {description && <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className="py-4">
          {children}
        </div>
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:pointer-events-none dark:ring-offset-slate-900 dark:focus:ring-indigo-400"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500 dark:text-gray-400">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

export default Dialog;
