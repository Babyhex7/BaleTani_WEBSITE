import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:  'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-md hover:shadow-lg',
    secondary:'bg-secondary-400 hover:bg-secondary-500 text-gray-900 focus:ring-secondary-400 shadow-md hover:shadow-lg',
    accent:   'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400 shadow-md hover:shadow-lg',
    outline:  'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
    ghost:    'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    danger:   'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    whatsapp: 'bg-[#25D366] hover:bg-[#128C7E] text-white border border-transparent focus:ring-[#25D366] shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
