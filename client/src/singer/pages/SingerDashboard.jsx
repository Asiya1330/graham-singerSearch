import React from "react";
import { SingerNav } from "../../AppNav";
import { StatusBanners } from "../components/dashboard/StatusBanners";
import { ReputationStatsCard } from "../components/dashboard/ReputationStatsCard";
import { PricingBanner } from "../components/dashboard/PricingBanner";
import { ProfileCompletionBanner } from "../components/dashboard/ProfileCompletionBanner";
import { ProfilePhotoSection } from "../components/dashboard/ProfilePhotoSection";
import { BioSection } from "../components/dashboard/BioSection";
import { ResumeSection } from "../components/dashboard/ResumeSection";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { AvailabilitySection } from "../components/dashboard/AvailabilitySection";
import { RepertoireSection } from "../components/dashboard/repertoire/RepertoireSection";

export function SingerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <SingerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusBanners />
        <ReputationStatsCard />
        <PricingBanner />
        <ProfileCompletionBanner />
        <ProfilePhotoSection />
        <BioSection />
        <ResumeSection />
        <StatsGrid />
        <AvailabilitySection />
        <RepertoireSection />
      </div>
    </div>
  );
}
