import React from "react";
import { CheckCircle, Search, Users } from "lucide-react";
import { useAppContext } from "./AppContext";

export function AboutPage() {
  const { setView } = useAppContext();

    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
                onClick={() => setView("landing")}
                className="mb-8 text-blue-600 hover:text-blue-800 flex items-center font-medium"
            >
                ← Back Home
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-8 py-12 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        We're building the first transparent, data-driven marketplace for the classical music industry.
                    </p>
                </div>
                
                <div className="p-8 md:p-12 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h2>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            For decades, casting has been a "black box." Singers send thousands of emails into the void, unsure if they're even being opened. Organizations struggle to find available talent quickly when cancellations happen, often relying on the same small circle of contacts.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Users className="w-5 h-5" /> For Singers
                            </h3>
                            <p className="text-blue-800/80">
                                Stop guessing. Know who is looking for your voice type, your roles, and your availability. Get discovered for work you can actually accept.
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                <Search className="w-5 h-5" /> For Organizations
                            </h3>
                            <p className="text-indigo-800/80">
                                Find the perfect cover in minutes, not days. Search by specific role experience, location, and real-time availability.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Values</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Transparency First</h4>
                                    <p className="text-slate-600">We believe information should be shared, not hoarded. Singers deserve to know who is hiring.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Respect for Time</h4>
                                    <p className="text-slate-600">Our platform is designed to minimize administrative work and maximize artistic opportunities.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Professional Integrity</h4>
                                    <p className="text-slate-600">We verify profiles and organizations to ensure a high-trust environment for everyone.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="text-center text-slate-500 text-sm">
                <p>&copy; 2026 Singer Search. All rights reserved.</p>
            </div>
        </div>
      </div>
    );
  };

