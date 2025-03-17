'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

/**
 * Message interface defining the structure of chat messages
 */
interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
  type: 'text' | 'trade_update' | 'meeting_pin';
}

/**
 * TradeItem interface defining the structure of items in a trade
 */
interface TradeItem {
  item: {
    _id: string;
    title: string;
    images: string[];
  };
  owner: string;
}

/**
 * Trade interface defining the structure of a trade
 */
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

/**
 * Review interface defining the structure of a user review
 */
interface Review {
  _id: string;
  reviewer: {
    _id: string;
    name: string;
    image: string;
  };
  reviewed: {
    _id: string;
    name: string;
    image: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * ChatProps interface defining the component's props
 */
interface ChatProps {
  chatId: string;
  tradeId: string;
  otherUser: {
    _id: string;
    name: string;
    image: string;
    level: number;
    getLevelColor: () => string;
  };
}

/**
 * Chat Component
 * Handles the chat interface for trade negotiations and reviews
 */
export default function Chat({ chatId, tradeId, otherUser }: ChatProps) {
  // Authentication and state management
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meetingDetails, setMeetingDetails] = useState({
    time: '',
    location: '',
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from the chat
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages);
    } catch (err) {
      setError('Error loading messages. Please try again.');
    }
  };

  // Fetch trade details
  const fetchTrade = async () => {
    try {
      const response = await fetch(`/api/trade/${tradeId}`);
      if (!response.ok) throw new Error('Failed to fetch trade');
      
      const data = await response.json();
      setTrade(data);
    } catch (err) {
      setError('Error loading trade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for completed trades
  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/review?tradeId=${tradeId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError('Error loading reviews. Please try again.');
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError('Error sending message. Please try again.');
    }
  };

  // Handle accepting a trade
  const handleAcceptTrade = async () => {
    try {
      const response = await fetch(`/api/trade/${tradeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accepted: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to accept trade');

      fetchTrade();
    } catch (err) {
      setError('Error accepting trade. Please try again.');
    }
  };

  // Handle completing a trade
  const handleCompleteTrade = async () => {
    try {
      const response = await fetch(`/api/trade/${tradeId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to complete trade');

      fetchTrade();
    } catch (err) {
      setError('Error completing trade. Please try again.');
    }
  };

  // Handle submitting a review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setError('Error submitting review. Please try again.');
    }
  };

  // Handle setting meeting details
  const handleSetMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDetails.time || !meetingDetails.location) return;

    try {
      const response = await fetch(`/api/trade/${tradeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingDetails,
        }),
      });

      if (!response.ok) throw new Error('Failed to set meeting details');

      setShowMeetingForm(false);
      setMeetingDetails({ time: '', location: '' });
      fetchTrade();
    } catch (err) {
      setError('Error setting meeting details. Please try again.');
    }
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial data fetching
  useEffect(() => {
    fetchMessages();
    fetchTrade();
  }, [chatId, tradeId]);

  // Fetch reviews when trade is completed
  useEffect(() => {
    if (trade?.status === 'completed') {
      fetchReviews();
    }
  }, [trade?.status]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] border-2 border-[#000]">
      {/* Trade Status Bar */}
      <div className="bg-[#000] text-[#fff] p-2 text-center font-bold">
        {trade?.status === 'pending' && (
          <div className="flex justify-between items-center">
            <span>Trade Status: Pending</span>
            {trade.initiator.toString() === session.user.id ? (
              <span>{trade.receiverAccepted ? 'Other party accepted' : 'Waiting for acceptance'}</span>
            ) : (
              <span>{trade.initiatorAccepted ? 'Other party accepted' : 'Waiting for acceptance'}</span>
            )}
          </div>
        )}
        {trade?.status === 'accepted' && (
          <div className="flex justify-between items-center">
            <span>Trade Status: Accepted</span>
            {!trade.meetingDetails && (
              <button
                onClick={() => setShowMeetingForm(true)}
                className="bg-[#00ff00] text-[#000] px-4 py-1 rounded hover:bg-[#00cc00]"
              >
                Set Meeting Details
              </button>
            )}
            {trade.meetingDetails && (
              <button
                onClick={handleCompleteTrade}
                className="bg-[#00ff00] text-[#000] px-4 py-1 rounded hover:bg-[#00cc00]"
              >
                Complete Trade
              </button>
            )}
          </div>
        )}
        {trade?.status === 'completed' && (
          <div className="flex justify-between items-center">
            <span>Trade Status: Completed</span>
            {!reviews.some(r => r.reviewer._id === session.user.id) && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-[#00ff00] text-[#000] px-4 py-1 rounded hover:bg-[#00cc00]"
              >
                Leave Review
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Header */}
      <div className="flex items-center p-4 border-b-2 border-[#000] bg-[#fff]">
        <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 border-2 border-[#000]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${otherUser.getLevelColor()}`,
            }}
          />
          <Image
            src={otherUser.image || '/default-avatar.png'}
            alt={otherUser.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold">{otherUser.name}</h3>
          <p className="text-sm text-gray-500">Level {otherUser.level}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f0f0]">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.sender === session.user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 border-2 border-[#000] ${
                  message.sender === session.user.id
                    ? 'bg-[#00ff00] text-[#000]'
                    : 'bg-[#fff] text-[#000]'
                }`}
              >
                {message.type === 'trade_update' ? (
                  <div className="font-bold">{message.content}</div>
                ) : message.type === 'meeting_pin' ? (
                  <div className="font-bold text-[#0000ff]">{message.content}</div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Meeting Form */}
      {showMeetingForm && (
        <div className="p-4 bg-[#fff] border-t-2 border-[#000]">
          <form onSubmit={handleSetMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-bold">Meeting Time</label>
              <input
                type="datetime-local"
                value={meetingDetails.time}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, time: e.target.value })}
                className="mt-1 block w-full rounded border-2 border-[#000] px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold">Meeting Location</label>
              <input
                type="text"
                value={meetingDetails.location}
                onChange={(e) => setMeetingDetails({ ...meetingDetails, location: e.target.value })}
                className="mt-1 block w-full rounded border-2 border-[#000] px-3 py-2"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-[#00ff00] text-[#000] px-4 py-2 rounded hover:bg-[#00cc00] font-bold"
              >
                Set Meeting
              </button>
              <button
                type="button"
                onClick={() => setShowMeetingForm(false)}
                className="bg-[#ff0000] text-[#fff] px-4 py-2 rounded hover:bg-[#cc0000] font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="p-4 bg-[#fff] border-t-2 border-[#000]">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-bold">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-2xl ${star <= reviewForm.rating ? 'text-[#ffff00]' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="mt-1 block w-full rounded border-2 border-[#000] px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-[#00ff00] text-[#000] px-4 py-2 rounded hover:bg-[#00cc00] font-bold"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-[#ff0000] text-[#fff] px-4 py-2 rounded hover:bg-[#cc0000] font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Section */}
      {trade?.status === 'completed' && reviews.length > 0 && (
        <div className="p-4 bg-[#fff] border-t-2 border-[#000]">
          <h3 className="font-bold mb-2">Reviews</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border-2 border-[#000] p-3 rounded">
                <div className="flex items-center mb-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 border-2 border-[#000]">
                    <Image
                      src={review.reviewer.image}
                      alt={review.reviewer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">{review.reviewer.name}</p>
                    <div className="flex text-[#ffff00]">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-[#ffff00]' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#fff] border-t-2 border-[#000]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded border-2 border-[#000] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#000]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#0000ff] text-[#fff] px-4 py-2 rounded hover:bg-[#0000cc] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 