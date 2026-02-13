import React from 'react';

interface TableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export const Table: React.FC<TableProps> = ({ 
  headers = [], 
  data = [], 
  className = '',
  striped = true,
  hoverable = true
}) => (
  <div className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          {headers.map((h, i) => (
            <th 
              key={i} 
              className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((row, i) => (
          <tr 
            key={i} 
            className={`
              ${striped && i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
              ${hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''}
            `}
          >
            {headers.map((h, j) => (
              <td 
                key={j} 
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
              >
                {row[h.toLowerCase()] ?? row[h] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
