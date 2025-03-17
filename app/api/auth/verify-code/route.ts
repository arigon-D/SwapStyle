import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and verify code
    const user = await User.findOne({
      phoneNumber,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Generate a random password for the user
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await hash(password, 12);

    // Update user with verified status and password
    await User.findByIdAndUpdate(user._id, {
      isPhoneVerified: true,
      password: hashedPassword,
      verificationCode: undefined,
      verificationCodeExpires: undefined,
    });

    return NextResponse.json({
      message: 'Phone number verified successfully',
      temporaryPassword: password, // In production, you might want to send this via email
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 