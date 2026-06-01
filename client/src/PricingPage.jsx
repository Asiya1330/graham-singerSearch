import React, { useState, useEffect } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { useAppContext } from "./AppContext";

export function PricingPage({ showAlert }) {
  const { currentUser, setCurrentUser, setView } = useAppContext();

    const [pricingType, setPricingType] = useState(currentUser?.type || "singer");
    const isSinger = pricingType === "singer";
    
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => currentUser ? (isSinger ? setView("singerDashboard") : setView("orgDashboard")) : setView("landing")}
            className="mb-8 text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            ← Back {currentUser ? "to Dashboard" : "Home"}
          </button>
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple pricing for real-world hiring</h1>
            <p className="text-xl text-slate-600 mb-8">Discovery should be free. Urgency, reach, and control are worth paying for.</p>
            
            <div className="flex justify-center">
                 <div className="bg-white p-1.5 rounded-xl border border-slate-200 inline-flex shadow-sm relative z-10">
                   <button 
                     onClick={() => setPricingType("singer")}
                     className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${isSinger ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                   >
                     For Singers
                   </button>
                   <button 
                     onClick={() => setPricingType("organization")}
                     className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${!isSinger ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                   >
                     For Organizations
                   </button>
                 </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Free</h3>
                <p className="text-slate-500 mt-2 h-12">
                  {isSinger ? "Perfect for staying discoverable." : "For occasional searches."}
                </p>
                <div className="mt-6 flex items-baseline text-slate-900">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {isSinger ? (
                  <>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Profile & availability</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Repertoire search visibility</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Profile views & notifications</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Contacted by organizations</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> Search singers by role, work, and dates</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> View profiles</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" /> 3 contact reveals per month</li>
                  </>
                )}
              </ul>

              <button 
                disabled={currentUser?.data.subscription_tier === 'free'}
                className="w-full py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentUser?.data.subscription_tier === 'free' ? "Current Plan" : "Downgrade to Free"}
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-600 p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Recommended
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{isSinger ? "Singer Pro" : "Organization Pro"}</h3>
                <p className="text-slate-500 mt-2 h-12">
                  {isSinger ? "Get seen first when it matters." : "Built for real hiring needs."}
                </p>
                <div className="mt-6 flex items-baseline text-slate-900">
                  <span className="text-5xl font-extrabold tracking-tight">{isSinger ? "$4.99" : "$79"}</span>
                  <span className="ml-1 text-xl font-semibold text-slate-500">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {isSinger ? (
                  <>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Priority search placement</span></li>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Urgent cover visibility</span></li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Advanced availability filters</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Profile analytics</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Featured profile styling</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Unlimited searches</span></li>
                    <li className="flex items-start"><Zap className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> <span className="font-medium text-slate-900">Priority urgent results</span></li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> 25+ contact reveals/month</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Distance & logistics filters</li>
                    <li className="flex items-start"><CheckCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" /> Team access</li>
                  </>
                )}
              </ul>

              <button 
                onClick={async () => {
                    if (!currentUser) {
                        setView(isSinger ? "singerLogin" : "organizationLogin");
                        return;
                    }

                    const confirmed = window.confirm(`Confirm subscription to ${isSinger ? "Singer Pro" : "Organization Pro"}?`);
                    if(confirmed) {
                        try {
                            if(isSinger) {
                                await fetch("/api/singer/profile", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ subscription_tier: "pro" }),
                                });
                            } else {
                                await fetch("/api/org/subscription", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    credentials: "include",
                                    body: JSON.stringify({ tier: "pro" }),
                                });
                            }
                            const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                            const profile = await profileRes.json();
                            setCurrentUser({ type: currentUser.type, data: profile });
                            showAlert("Upgrade successful! Pro features unlocked.", "success");
                            if(isSinger) setView("singerDashboard");
                            else setView("orgDashboard");
                        } catch (err) {
                            showAlert("Upgrade failed", "error");
                        }
                    }
                }}
                disabled={currentUser?.data?.subscription_tier === 'pro'}
                className="w-full py-3 px-4 bg-blue-600 border border-transparent rounded-xl shadow-lg text-white font-bold hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {currentUser 
                    ? (currentUser.data.subscription_tier === 'pro' ? "Plan Active" : `Upgrade to ${isSinger ? "Singer" : "Org"} Pro`)
                    : "Sign in to Upgrade"
                }
              </button>
            </div>
          </div>
          
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>No contracts. Cancel anytime. We don't take commissions. Your relationships stay yours.</p>
          </div>
        </div>
      </div>
    );
}
