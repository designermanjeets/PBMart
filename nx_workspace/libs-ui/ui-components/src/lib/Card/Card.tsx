import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function Card({ children, title, footer, className = '' }: CardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className={`${title ? 'border-t border-gray-200' : ''}`}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
} 