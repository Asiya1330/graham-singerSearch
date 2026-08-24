import React from "react";
import { SingerNav } from "../../AppNav";
import { StatusBanners } from "../components/dashboard/StatusBanners";
import { ReputationStatsCard } from "../components/dashboard/ReputationStatsCard";
import { PricingBanner } from "../components/dashboard/PricingBanner";
import { ProfileCompletionBanner } from "../components/dashboard/ProfileCompletionBanner";
import { ProfilePhotoSection } from "../components/dashboard/ProfilePhotoSection";
import { BioSection } from "../components/dashboard/BioSection";
import { MediaLinksSection } from "../components/dashboard/MediaLinksSection";
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900" data-testid="heading-edit-profile">
            Edit your profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Photo, bio, YouTube and other links, availability, and repertoire — all in one place.
          </p>
        </div>
        <ProfileCompletionBanner />
        <ProfilePhotoSection />
        <BioSection />
        <MediaLinksSection />
        <ResumeSection />
        <StatsGrid />
        <AvailabilitySection />
        <RepertoireSection />
      </div>
    </div>
  );
}
