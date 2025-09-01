import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; 
}
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, ...props }, ref) => {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 peer"
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
