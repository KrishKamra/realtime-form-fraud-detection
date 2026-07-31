import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
  themeColor: "#020617",
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
      className={`dark ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}