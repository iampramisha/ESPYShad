// Import NextAuth types to extend them
import NextAuth from "next-auth";
import { DefaultUser } from "next-auth";

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultUser;
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}