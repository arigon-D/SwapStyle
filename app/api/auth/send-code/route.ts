import { NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    await connectDB();
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the verification code in the user document
    await User.findOneAndUpdate(
      { phoneNumber },
      {
        phoneNumber,
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
      { upsert: true }
    );

    // Send SMS using Twilio
    await client.messages.create({
      body: `Your SwapStyle verification code is: ${verificationCode}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return NextResponse.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 