'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Chat from '@/components/Chat';

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
  meetingDetails?: {
    time: string;
    location: string;
    coordinates: number[];
  };
}

export default function TradePage() {
  const { data: session } = useSession();
  const params = useParams();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrade();
  }, [params.id]);

  const fetchTrade = async () => {
    try {
      const response = await fetch(`/api/trade/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch trade');
      
      const data = await response.json();
      setTrade(data);
    } catch (err) {
      setError('Error loading trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-center bg-[#fff] p-8 border-2 border-[#000]">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view trade</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#000]"></div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-center bg-[#fff] p-8 border-2 border-[#000]">
          <p className="text-[#ff0000] mb-4">{error || 'Trade not found'}</p>
          <button
            onClick={() => window.location.href = '/chat'}
            className="bg-[#0000ff] text-[#fff] px-4 py-2 rounded hover:bg-[#0000cc] font-bold"
          >
            Back to Trades
          </button>
        </div>
      </div>
    );
  }

  const otherUser = trade.initiator._id === session.user.id
    ? trade.receiver
    : trade.initiator;

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#f0f0f0]">
      <Chat chatId={params.id as string} tradeId={params.id as string} otherUser={otherUser} />
    </div>
  );
} 