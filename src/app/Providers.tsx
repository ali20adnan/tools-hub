"use client"

import React from "react";
import { MyuiToaster } from "@/components/myui/myui-toaster";
import { ThemeProvider } from "@/context/theme-context";
import { LocaleProvider } from "@/context/locale-context";
import { AuthBootstrap } from "@/components/auth/auth-bootstrap";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthBootstrap />
        <MyuiToaster />
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}