import React from 'react';

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  className?: string;
  label?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text', 
  className = '',
  label,
  disabled = false
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);

export default Input;
