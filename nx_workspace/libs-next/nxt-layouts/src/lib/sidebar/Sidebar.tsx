import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'HomeIcon' },
    { name: 'Users', href: '/admin/users', icon: 'UsersIcon' },
    { name: 'Products', href: '/admin/products', icon: 'ShoppingBagIcon' },
    { name: 'Orders', href: '/admin/orders', icon: 'ShoppingCartIcon' },
    { name: 'Settings', href: '/admin/settings', icon: 'CogIcon' },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
} 