"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import LoginForm from "./login/page";
import RegisterForm from "./register/page";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    // Sync tab state with URL
    if (pathname.endsWith('/register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    if (value === 'register') {
      router.replace('/register', { scroll: false });
    } else {
      router.replace('/login', { scroll: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-start bg-white">
      <div className="w-1/2 h-screen hidden lg:block relative">
        <Image
          src="/image/image.png" 
          alt="Auth Side Image"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      <div className="w-full sm:w-1/2 md:w-1/2 flex items-center justify-center lg:mx-auto">
        <div className="w-[300px] md:w-[400px] h-[600px] flex flex-col p-4 md:p-6 bg-white shadow-md rounded-lg">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}