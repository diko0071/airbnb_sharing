import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { MenuBar } from "./components/menu-bar/menu-bar";
import { PopupProvider } from "./components/user/popup-context";
import { LoginForm } from "./components/user/login-popup";
import Footer from "./components/footer/footer";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Share Trips",
  description: "Share Trips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (  
    <html lang="en">
      <body className={`${inter.className}`}>
      <PopupProvider>
        <MenuBar />
        <main className="mt-4 grid w-full h-full px-4 md:px-6 py-5">
            {children}           
        <Toaster />
       </main>
       <LoginForm />
       <div className="mt-4 grid w-full h-full">
       <Footer />
       </div>
       </PopupProvider>
      </body>
    </html>
  );
}