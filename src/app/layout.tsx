import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export const metadata: Metadata = {
  title: "Tekton Stock Control",
  description:
    "Inventory, purchasing, sales and financials for consumables. AUD pricing with 10% GST.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className="h-full antialiased">
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 lg:ml-64">
            {/* Desktop top bar with the notifications bell */}
            <div className="sticky top-0 z-20 hidden h-14 items-center justify-end border-b border-slate-200 bg-background/80 px-6 backdrop-blur lg:flex lg:px-8">
              <NotificationBell />
            </div>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
