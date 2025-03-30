import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// 1. Create a dedicated config file for environment variables
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

const JWT_SECRET = getJwtSecret(); // This will always return string or throw error

export async function POST(request: Request) {
  const prisma = new PrismaClient();
  
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true }
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2. Now JWT_SECRET is guaranteed to be string
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET, // No more error!
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}