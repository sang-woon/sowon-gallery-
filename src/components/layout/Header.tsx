'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';

export default function Header() {
  const basePath = process.env.NODE_ENV === 'production' ? '/sowonee-gallery' : '';

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              SOWONEE
            </span>
            <span className="text-xl text-gray-600">Gallery</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/admin/login/"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">관리자</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
