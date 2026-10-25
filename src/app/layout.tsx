import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/toaster";
import { SupportAssistant } from "@/components/support-assistant";

export const metadata: Metadata = {
  title: "GearUp — Rent Sports & Outdoor Gear Instantly",
  description:
    "Browse and rent sports and outdoor equipment from local providers. Book gear, pay securely, and hit the trail.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col"
        style={
          {
            "--font-display":
              "'Archivo Black', 'Arial Narrow Bold', 'Franklin Gothic Heavy', system-ui, sans-serif",
            "--font-body":
              "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            "--font-mono":
              "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
          } as React.CSSProperties
        }
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <SupportAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}
