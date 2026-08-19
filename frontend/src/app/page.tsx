'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      router.replace('/login');
      return;
    }

    switch (role.toUpperCase()) {
      case 'ADMINISTRATEUR':
        router.replace('/admin/dashboard');
        break;
      case 'LIVREUR':
        router.replace('/livreur');
        break;
      case 'CLIENT':
        router.replace('/client');
        break;
      default:
        localStorage.clear();
        router.replace('/login');
        break;
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner SVG animé en vert */}
        <svg
          className="h-10 w-10 animate-spin text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-sm font-medium text-gray-500">...</span>
      </div>
    </div>
  );
}