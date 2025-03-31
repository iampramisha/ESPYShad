import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Generate and store code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Critical Fix: Proper user-code relationship
    await prisma.$transaction([
      // Create user if doesn't exist
      prisma.user.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          name: '',
          password: '', // Temporary marker
          verificationCode: {
            create: {
              code: verificationCode,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
            }
          }
        },
        update: {
          verificationCode: {
            upsert: {
              create: {
                code: verificationCode,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
              },
              update: {
                code: verificationCode,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
              }
            }
          }
        }
      })
    ]);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Your Verification Code",
      text: `Your code is: ${verificationCode}`,
    });

    return NextResponse.json({ message: "Verification code sent" });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}