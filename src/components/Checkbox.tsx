import React from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; 
}
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, ...props }, ref) => {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <input
          type="checkbox"
          id={id}
          ref={ref}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 peer',
            // Dark mode styles for the checkbox
            'dark:border-slate-700 dark:bg-slate-800 dark:ring-offset-slate-900 dark:focus:ring-indigo-600 dark:checked:bg-indigo-500'
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300"
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
