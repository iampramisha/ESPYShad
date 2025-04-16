"use client"
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/store/store";

interface CheckAuthProps {
  children: React.ReactNode;
}

export default function CheckAuth({ children }: CheckAuthProps) {
  const router = useRouter();
  const pathname = usePathname(); // ✅ get the current pathname
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!pathname) return;

    // 1. Redirect unauthenticated users trying to access protected routes
    if (!isAuthenticated && !["/login", "/register"].includes(pathname)) {
      router.push("/login");
      return;
    }

    // 2. Redirect authenticated users away from login/register
    if (isAuthenticated && ["/login", "/register"].includes(pathname)) {
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/shop");
      }
      return;
    }

    // 3. Block non-admins from accessing /admin
    if (
      isAuthenticated &&
      user?.role !== "ADMIN" &&
      pathname.startsWith("/admin")
    ) {
      router.push("/shop"); // or maybe a /unauthorized page
      return;
    }

    // 4. Prevent ADMINs from accessing /shop
    if (
      isAuthenticated &&
      user?.role === "ADMIN" &&
      pathname.startsWith("/shop")
    ) {
      router.push("/admin");
      return;
    }
  }, [isAuthenticated, user, pathname, router]);

  return <>{children}</>;
}
