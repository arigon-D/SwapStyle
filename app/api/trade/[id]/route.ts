import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Trade from '@/models/Trade';
import Chat from '@/models/Chat';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const trade = await Trade.findById(params.id)
      .populate('initiator', 'name image')
      .populate('receiver', 'name image')
      .populate('initiatorItems.item')
      .populate('receiverItems.item');

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Check if the user is a participant in the trade
    if (
      trade.initiator.toString() !== session.user.id &&
      trade.receiver.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error fetching trade:', error);
    return NextResponse.json(
      { error: 'Error fetching trade' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const trade = await Trade.findById(params.id);

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Check if the user is a participant in the trade
    if (
      trade.initiator.toString() !== session.user.id &&
      trade.receiver.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverItems, accept, meetingDetails } = await request.json();

    if (receiverItems) {
      // Update trade items and reset accept flags
      trade.receiverItems = receiverItems;
      trade.initiatorAccepted = false;
      trade.receiverAccepted = false;
    }

    if (accept) {
      // Set the appropriate accept flag
      if (trade.initiator.toString() === session.user.id) {
        trade.initiatorAccepted = true;
      } else {
        trade.receiverAccepted = true;
      }

      // If both accepted, update trade status
      if (trade.initiatorAccepted && trade.receiverAccepted) {
        trade.status = 'accepted';
      }
    }

    if (meetingDetails) {
      trade.meetingDetails = meetingDetails;
    }

    await trade.save();

    // Add trade update message to chat
    const chat = await Chat.findOne({ trade: trade._id });
    if (chat) {
      let messageContent = '';
      if (receiverItems) {
        messageContent = 'Trade offer updated';
      } else if (accept) {
        messageContent = 'Trade accepted';
      } else if (meetingDetails) {
        messageContent = 'Meeting details updated';
      }

      chat.messages.push({
        sender: session.user.id,
        content: messageContent,
        type: 'trade_update',
      });
      await chat.save();
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json(
      { error: 'Error updating trade' },
      { status: 500 }
    );
  }
} 