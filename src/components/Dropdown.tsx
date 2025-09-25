import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// Create a context to manage the dropdown's state
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

// Custom hook to access the context
const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownMenu');
  }
  return context;
};

// Main dropdown container
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown if a click is detected outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

// The button that triggers the dropdown
const DropdownMenuTrigger = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { setIsOpen } = useDropdown();
  return (
    <button
      type="button"
      onClick={() => setIsOpen(prev => !prev)}
      className={className}
    >
      {children}
    </button>
  );
};

// The content of the dropdown menu
const DropdownMenuContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { isOpen } = useDropdown();
  if (!isOpen) return null;

  return (
    <div
      className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-xl border border-gray-200/80 focus:outline-none z-10 ${className}`}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

// Individual items within the dropdown menu
const DropdownMenuItem = ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void; }) => {
  const { setIsOpen } = useDropdown();
  return (
    <button
      onClick={() => {
        onSelect();
        setIsOpen(false);
      }}
      className="text-gray-700 block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };

