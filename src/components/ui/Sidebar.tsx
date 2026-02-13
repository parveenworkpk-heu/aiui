import React from 'react';

interface SidebarItem {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  onItemClick?: (index: number) => void;
  title?: string;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items = [], onItemClick, title, className = '' }) => (
  <div className={`w-64 bg-gray-100 dark:bg-gray-900 h-full flex flex-col ${className}`}>
    {title && (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h2>
      </div>
    )}
    <nav className="flex-1 p-4 space-y-1">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onItemClick?.(idx)}
          className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
            item.active 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  </div>
);

export default Sidebar;
