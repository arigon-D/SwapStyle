import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Trade from '@/models/Trade';
import User from '@/models/User';
import Chat from '@/models/Chat';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { tradeId, rating, comment } = await request.json();

    // Validate trade exists and is completed
    const trade = await Trade.findById(tradeId);
    if (!trade || trade.status !== 'completed') {
      return NextResponse.json(
        { error: 'Trade not found or not completed' },
        { status: 404 }
      );
    }

    // Determine who is being reviewed
    const reviewedUserId = trade.initiator.toString() === session.user.id
      ? trade.receiver
      : trade.initiator;

    // Create or update review
    const review = await Review.findOneAndUpdate(
      { trade: tradeId, reviewer: session.user.id },
      {
        trade: tradeId,
        reviewer: session.user.id,
        reviewed: reviewedUserId,
        rating,
        comment,
      },
      { upsert: true, new: true }
    );

    // Update reviewed user's stats
    const reviewedUser = await User.findById(reviewedUserId);
    if (reviewedUser) {
      if (rating >= 4) {
        reviewedUser.positiveReviews += 1;
        await reviewedUser.addExperience(25); // Bonus experience for positive review
      }
      await reviewedUser.save();
    }

    // Add review message to chat
    const chat = await Chat.findOne({ trade: tradeId });
    if (chat) {
      chat.messages.push({
        sender: session.user.id,
        content: `Left a ${rating}-star review`,
        type: 'trade_update',
      });
      await chat.save();
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Error creating review' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('tradeId');

    if (!tradeId) {
      return NextResponse.json(
        { error: 'Trade ID is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ trade: tradeId })
      .populate('reviewer', 'name image')
      .populate('reviewed', 'name image');

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Error fetching reviews' },
      { status: 500 }
    );
  }
} 