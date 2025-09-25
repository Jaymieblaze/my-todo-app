import React from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          'text-sm font-medium leading-none text-gray-700',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          // Dark mode styles
          'dark:text-slate-300',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

export default Label;