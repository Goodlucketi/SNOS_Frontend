import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  text,
  variant = 'primary',
  isLoading = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "font-sans font-medium rounded-xl flex items-center justify-center transition-all duration-200 outline-none focus:ring-4 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20 shadow-lg shadow-blue-600/10 dark:bg-blue-500 dark:hover:bg-blue-600",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400/10 dark:bg-slate-850 dark:text-slate-100 dark:hover:bg-slate-800",
    outline: "bg-transparent border border-slate-250 text-slate-700 hover:bg-slate-100 focus:ring-slate-300/10 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 shadow-md hover:shadow-red-600/10 dark:bg-red-500 dark:hover:bg-red-600",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300/10 dark:text-slate-400 dark:hover:bg-slate-900"
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Processing...</span>
        </div>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

export default Button;
