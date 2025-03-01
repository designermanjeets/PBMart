import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/admin/dashboard" className="flex-shrink-0 flex items-center">
              Logo
            </Link>
          </div>
          <div className="flex items-center">
            {/* Profile and notifications */}
            <div className="ml-4 flex items-center md:ml-6">
              {/* Add profile dropdown and notification bell here */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 