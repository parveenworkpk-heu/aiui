import React from 'react';

interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface NavbarProps {
  title: string;
  items?: NavItem[];
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, items = [], logo, actions, className = '' }) => (
  <nav className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center gap-4">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          <span className="text-xl font-bold text-gray-900 dark:text-white">{title}</span>
        </div>
        <div className="flex items-center gap-6">
          {items.map((item, idx) => (
            <a 
              key={idx} 
              href={item.href || '#'} 
              className={`text-sm font-medium transition-colors ${
                item.active 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  </nav>
);

export default Navbar;
