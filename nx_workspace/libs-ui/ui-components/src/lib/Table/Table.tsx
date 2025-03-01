import React from 'react';

interface TableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
  className?: string;
}

export function Table({ headers, data, renderRow, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
} 