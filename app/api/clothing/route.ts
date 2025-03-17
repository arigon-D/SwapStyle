import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Clothing from '@/models/Clothing';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const condition = searchParams.get('condition');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10'; // Default radius in kilometers

    const query: any = { status: 'available' };

    if (category) query.category = category;
    if (size) query.size = size;
    if (condition) query.condition = condition;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      };
    }

    const clothing = await Clothing.find(query)
      .populate('owner', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json(clothing);
  } catch (error) {
    console.error('Error fetching clothing:', error);
    return NextResponse.json(
      { error: 'Error fetching clothing' },
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
    const data = await request.json();

    const clothing = await Clothing.create({
      ...data,
      owner: session.user.id,
    });

    return NextResponse.json(clothing);
  } catch (error) {
    console.error('Error creating clothing:', error);
    return NextResponse.json(
      { error: 'Error creating clothing' },
      { status: 500 }
    );
  }
} 