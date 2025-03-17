'use client';

import Link from 'next/link';
import { FaSearch, FaPlus, FaExchangeAlt, FaUser } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          SwapStyle
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Swap clothes. Save money. Save the planet.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link href="/browse" className="retro-card hover:transform hover:-translate-y-1 transition-transform">
            <div className="text-center">
              <FaSearch className="mx-auto text-3xl mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">Browse Items</h2>
              <p className="text-gray-600">Find clothes you want to swap</p>
            </div>
          </Link>

          <Link href="/add-item" className="retro-card hover:transform hover:-translate-y-1 transition-transform">
            <div className="text-center">
              <FaPlus className="mx-auto text-3xl mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">Add Items</h2>
              <p className="text-gray-600">List your clothes for swapping</p>
            </div>
          </Link>

          <Link href="/chat" className="retro-card hover:transform hover:-translate-y-1 transition-transform">
            <div className="text-center">
              <FaExchangeAlt className="mx-auto text-3xl mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">My Trades</h2>
              <p className="text-gray-600">Manage your trade offers</p>
            </div>
          </Link>

          <Link href="/profile" className="retro-card hover:transform hover:-translate-y-1 transition-transform">
            <div className="text-center">
              <FaUser className="mx-auto text-3xl mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">My Profile</h2>
              <p className="text-gray-600">View and edit your profile</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 