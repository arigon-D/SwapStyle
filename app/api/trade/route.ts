import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Trade from '@/models/Trade';
import Chat from '@/models/Chat';
import Clothing from '@/models/Clothing';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { receiverId, initiatorItems, receiverItems } = await request.json();

    // Verify all items exist and belong to their respective owners
    const initiatorItemsData = await Promise.all(
      initiatorItems.map(async (itemId: string) => {
        const item = await Clothing.findById(itemId);
        if (!item || item.owner.toString() !== session.user.id) {
          throw new Error('Invalid item or unauthorized');
        }
        return { item: itemId, owner: session.user.id };
      })
    );

    const receiverItemsData = await Promise.all(
      receiverItems.map(async (itemId: string) => {
        const item = await Clothing.findById(itemId);
        if (!item || item.owner.toString() !== receiverId) {
          throw new Error('Invalid item or unauthorized');
        }
        return { item: itemId, owner: receiverId };
      })
    );

    // Create trade
    const trade = await Trade.create({
      initiator: session.user.id,
      receiver: receiverId,
      initiatorItems: initiatorItemsData,
      receiverItems: receiverItemsData,
    });

    // Create associated chat
    await Chat.create({
      trade: trade._id,
      participants: [session.user.id, receiverId],
      messages: [],
    });

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: 'Error creating trade' },
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
    const trades = await Trade.find({
      $or: [
        { initiator: session.user.id },
        { receiver: session.user.id },
      ],
    })
      .populate('initiator', 'name image')
      .populate('receiver', 'name image')
      .populate('initiatorItems.item')
      .populate('receiverItems.item')
      .sort({ updatedAt: -1 });

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Error fetching trades' },
      { status: 500 }
    );
  }
} 