import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { LenisProvider } from "@/components/layout/LenisProvider";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SentryForm — Real-Time Behavioral Biometrics",
  description:
    "Sub-millisecond behavioral risk assessment engine powered by Polars feature extraction and native ONNX C++ inference.",
  keywords: [
    "Behavioral Biometrics",
    "Fraud Prevention",
    "ONNX Machine Learning",
    "Real-Time Security",
    "LightGBM",
  ],
  authors: [{ name: "SentryForm Engineering Team" }],
  openGraph: {
    title: "SentryForm — Real-Time Behavioral Biometrics",
    description: "Sub-millisecond behavioral risk assessment engine",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <LenisProvider>
          <PageTransition>{children}</PageTransition>
        </LenisProvider>
      </body>
    </html>
  );
}
