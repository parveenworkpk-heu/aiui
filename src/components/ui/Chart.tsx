import React from 'react';

interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: ChartDataItem[];
  title?: string;
  className?: string;
  type?: 'bar' | 'horizontal';
}

export const Chart: React.FC<ChartProps> = ({ data = [], title, className = '', type = 'horizontal' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.value));
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h4>
      )}
      
      {type === 'horizontal' ? (
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-20 truncate">{item.label}</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{ 
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color || colors[idx % colors.length]
                  }}
                >
                  <span className="text-[10px] font-medium text-white">{item.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end justify-around gap-2 h-40">
          {data.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1">
              <div 
                className="w-full rounded-t transition-all duration-700 ease-out min-h-[4px]"
                style={{ 
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || colors[idx % colors.length]
                }}
              />
              <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate max-w-full">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chart;
