import React from "react";
import { ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSingerUser } from "../../hooks/useSingerUser";

export function PricingBanner() {
  const { user, setView } = useSingerUser();
  const isPro = user.subscription_tier === 'pro';

  if (isPro) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-indigo-900 rounded-xl shadow-xl overflow-hidden mb-8 text-white relative"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap className="w-64 h-64 transform -rotate-12 translate-x-12 -translate-y-12" />
      </div>
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-yellow-400 text-indigo-900 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Limited Visibility</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Don't miss your next role.</h2>
          <p className="text-indigo-200 text-lg max-w-2xl">
            You are currently on the Free plan. Upgrade to Pro for <span className="text-white font-bold">$9.99/month</span> to appear in "Urgent Ready" searches and see who is viewing your profile.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setView("pricing")}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-bold shadow-lg transition-colors flex items-center gap-2"
          >
            View Pro Benefits <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
