
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
export async function POST(request: Request) {
  try {
    const { name, email, password, verificationCode } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find code with user relation
    const codeRecord = await prisma.verificationCode.findFirst({
      where: {
        code: String(verificationCode),
        user: { email: normalizedEmail }
      },
      include: { user: true }
    });

    console.log('Verification record:', {
      codeExists: !!codeRecord,
      userExists: !!codeRecord?.user,
      userId: codeRecord?.userId
    });

    if (!codeRecord || !codeRecord.user) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // 2. Check if user already registered (has password)
    if (codeRecord.user.password) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 3. Complete registration
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: codeRecord.user.id },
        data: { name, password: hashedPassword }
      }),
      prisma.verificationCode.delete({
        where: { id: codeRecord.id }
      })
    ]);

    return NextResponse.json(
      { success: true, message: "Registration complete" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}