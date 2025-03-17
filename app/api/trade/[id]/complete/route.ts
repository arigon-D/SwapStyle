import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Trade from '@/models/Trade';
import User from '@/models/User';
import Review from '@/models/Review';
import Chat from '@/models/Chat';

/**
 * POST /api/trade/[id]/complete
 * Completes a trade and updates user experience
 * 
 * Experience is calculated based on:
 * - Base experience: 50 XP
 * - Per item bonus: 10 XP per item
 * 
 * @param request - The incoming request object
 * @param params - Route parameters containing the trade ID
 * @returns Updated trade object or error response
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database and fetch trade
    await connectDB();
    const trade = await Trade.findById(params.id);

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Verify user is a participant in the trade
    if (
      trade.initiator.toString() !== session.user.id &&
      trade.receiver.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify trade is in accepted state
    if (trade.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Trade must be accepted before completion' },
        { status: 400 }
      );
    }

    // Update trade status to completed
    trade.status = 'completed';
    await trade.save();

    // Fetch both users involved in the trade
    const initiator = await User.findById(trade.initiator);
    const receiver = await User.findById(trade.receiver);

    // Calculate experience based on number of items
    const totalItems = trade.initiatorItems.length + trade.receiverItems.length;
    const baseExperience = 50; // Base experience for completing a trade
    const itemExperience = 10; // Experience per item
    const totalExperience = baseExperience + (totalItems * itemExperience);

    // Update initiator's stats and experience
    if (initiator) {
      initiator.completedTrades += 1;
      await initiator.addExperience(totalExperience);
      await initiator.save();
    }

    // Update receiver's stats and experience
    if (receiver) {
      receiver.completedTrades += 1;
      await receiver.addExperience(totalExperience);
      await receiver.save();
    }

    // Add completion message to trade chat
    const chat = await Chat.findOne({ trade: trade._id });
    if (chat) {
      chat.messages.push({
        sender: session.user.id,
        content: `Trade completed successfully! Earned ${totalExperience} XP for trading ${totalItems} items.`,
        type: 'trade_update',
      });
      await chat.save();
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error completing trade:', error);
    return NextResponse.json(
      { error: 'Error completing trade' },
      { status: 500 }
    );
  }
} 