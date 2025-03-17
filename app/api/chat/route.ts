import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const chats = await Chat.find({
      participants: session.user.id,
    })
      .populate('participants', 'name')
      .sort({ 'lastMessage.timestamp': -1 });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Error fetching chats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { participantId } = await request.json();

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [session.user.id, participantId] },
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const chat = await Chat.create({
      participants: [session.user.id, participantId],
      messages: [],
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Error creating chat' },
      { status: 500 }
    );
  }
} 