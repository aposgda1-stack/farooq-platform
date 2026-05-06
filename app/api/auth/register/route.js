import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserProgress } from '@/lib/models';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

const MONGODB_URI = process.env.MONGODB_URI;

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }

    // Check if user already exists (either custom or clerk)
    const existingUser = await UserProgress.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserProgress({
      userId: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      email,
      password: hashedPassword,
      authSource: 'custom',
      totalPoints: 0,
    });

    await newUser.save();

    // Create session
    const sessionData = {
      id: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      authSource: 'custom',
    };

    const session = await encrypt(sessionData);
    cookies().set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({ success: true, user: sessionData });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 });
  }
}
