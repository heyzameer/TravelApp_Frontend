import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NatureStay - Homestays & Local Adventures",
  description: "Experience verified homestays and authentic local adventures in nature.",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "NatureStay",
    description: "Experience verified homestays and authentic local adventures in nature.",
    images: ['https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070'],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <Providers>
          <Navbar />
          <Toaster position="top-center" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
