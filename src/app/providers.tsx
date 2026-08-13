"use client";

import { SnackbarProvider } from "notistack";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      
    >
      {children}
    </SnackbarProvider>
  );
}
