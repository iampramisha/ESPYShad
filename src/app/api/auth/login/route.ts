import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe = false } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" }, 
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Set expiration (30 days when rememberMe is true)
    const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET!, 
      { expiresIn: expiresInSeconds }
    );

    // Create response
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      expiresIn: expiresInSeconds,
      rememberMe // Make sure this matches the input rememberMe
    });

    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresInSeconds,
      path: '/',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
