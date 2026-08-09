"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Hero } from "@/components/landing/Hero";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeatureBento } from "@/components/landing/FeatureBento";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <AmbientBackground variant="default" />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Hero />
        <StatsStrip />
        <HowItWorks />
        <FeatureBento />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
