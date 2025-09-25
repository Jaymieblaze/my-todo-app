import React from 'react';

// Define the types for the different visual styles of the alert
type AlertVariant = 'default' | 'destructive';

// Define the props for the Alert component, extending standard div attributes
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: React.ReactNode;
}

const Alert = ({ className = '', variant = 'default', children, ...props }: AlertProps) => {
  // Define the base styles for all alerts
  const baseStyle = 'relative w-full rounded-lg border p-4';

  // Define the specific styles for each variant
  const variants: Record<AlertVariant, string> = {
    default: 'bg-background text-foreground',
    destructive: 'border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500',
  };

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

export default Alert;

