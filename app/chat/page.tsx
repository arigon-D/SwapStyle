'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface TradeItem {
  item: {
    _id: string;
    title: string;
    images: string[];
  };
  owner: string;
}

interface Trade {
  _id: string;
  initiator: {
    _id: string;
    name: string;
    image: string;
  };
  receiver: {
    _id: string;
    name: string;
    image: string;
  };
  initiatorItems: TradeItem[];
  receiverItems: TradeItem[];
  initiatorAccepted: boolean;
  receiverAccepted: boolean;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  updatedAt: string;
}

export default function TradeList() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trade');
      if (!response.ok) throw new Error('Failed to fetch trades');
      
      const data = await response.json();
      setTrades(data);
    } catch (err) {
      setError('Error loading trades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-center bg-[#fff] p-8 border-2 border-[#000]">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view trades</h1>
          <button
            onClick={() => window.location.href = '/api/auth/signin'}
            className="bg-[#0000ff] text-[#fff] px-4 py-2 rounded hover:bg-[#0000cc] font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Trades</h1>

        {error && (
          <div className="bg-[#ff0000] text-[#fff] px-4 py-3 rounded mb-4 text-center font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000] mx-auto"></div>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-12 bg-[#fff] border-2 border-[#000]">
            <p className="text-gray-500">You don't have any trades yet.</p>
            <Link
              href="/browse"
              className="text-[#0000ff] hover:text-[#0000cc] mt-2 inline-block font-bold"
            >
              Browse clothing to start trading
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => {
              const otherUser = trade.initiator._id === session.user.id
                ? trade.receiver
                : trade.initiator;

              const isInitiator = trade.initiator._id === session.user.id;
              const isAccepted = isInitiator
                ? trade.receiverAccepted
                : trade.initiatorAccepted;

              return (
                <Link
                  key={trade._id}
                  href={`/chat/${trade._id}`}
                  className="block bg-[#fff] border-2 border-[#000] hover:border-[#0000ff] transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-[#000]">
                        <Image
                          src={otherUser.image || '/default-avatar.png'}
                          alt={otherUser.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{otherUser.name}</h3>
                        <div className="text-sm text-gray-500">
                          {trade.status === 'pending' && (
                            <span className={isAccepted ? 'text-[#00ff00]' : 'text-[#ff0000]'}>
                              {isAccepted ? 'Other party accepted' : 'Waiting for acceptance'}
                            </span>
                          )}
                          {trade.status === 'accepted' && (
                            <span className="text-[#00ff00]">Trade accepted</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold mb-2">Your Items:</h4>
                        <div className="space-y-2">
                          {(isInitiator ? trade.initiatorItems : trade.receiverItems).map((item) => (
                            <div key={item.item._id} className="flex items-center space-x-2">
                              <div className="relative h-8 w-8 rounded overflow-hidden border border-[#000]">
                                <Image
                                  src={item.item.images[0]}
                                  alt={item.item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm">{item.item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Their Items:</h4>
                        <div className="space-y-2">
                          {(isInitiator ? trade.receiverItems : trade.initiatorItems).map((item) => (
                            <div key={item.item._id} className="flex items-center space-x-2">
                              <div className="relative h-8 w-8 rounded overflow-hidden border border-[#000]">
                                <Image
                                  src={item.item.images[0]}
                                  alt={item.item.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-sm">{item.item.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Last updated: {new Date(trade.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 