import { VOICE_TYPE_OPTIONS } from "@shared/voice-types";

export const FACH_OPTIONS_ADMIN = VOICE_TYPE_OPTIONS;
export const VOICE_TYPE_OPTIONS_ADMIN = VOICE_TYPE_OPTIONS;
export const UNION_OPTIONS_ADMIN = ["Non-Union", "AGMA", "AEA", "AFM", "AGMA Member", "AEA Member", "AFM Member"];
export const TIER_OPTIONS_ADMIN = ["free", "pro"];
export const STATE_OPTIONS_ADMIN = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"];
export const CREDIT_REASONS = ["Promotional Grant", "Support Adjustment", "Refund", "Correction", "Other"];

export const DEFAULT_CREDIT_ADJUST_FORM = { amount: "", reason: "Promotional Grant" };
export const DEFAULT_GIFT_FORM = { duration: "1y", customDate: "", reason: "" };
