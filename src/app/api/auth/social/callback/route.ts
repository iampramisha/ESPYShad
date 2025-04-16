
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");
  
  if (!provider || !["google", "facebook"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const nextAuth = NextAuth(authOptions);
  const authResponse = await nextAuth.handlers.GET(req);
  
  if (authResponse.status !== 200) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/", req.url));
};

export { handler as GET, handler as POST };