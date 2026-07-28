const FALLBACK_PRICING = {
  singer: {
    monthlyPrice: "$9.99",
    annualMonthlyEquiv: "$8.25",
    annualTotal: "$99",
    annualDiscountLabel: "$20.88 saved yearly",
  },
  organization: {
    monthlyPrice: "$79",
    annualMonthlyEquiv: "$65.83",
    annualTotal: "$790",
    annualDiscountLabel: "$158 saved yearly",
  },
};

/** Shared Pro pricing display amounts for singers and organizations. */
export function getBillingDisplay(isSinger, interval = "annual", pricingData = null) {
  const base = isSinger
    ? pricingData?.singer || FALLBACK_PRICING.singer
    : pricingData?.organization || FALLBACK_PRICING.organization;

  return {
    monthlyPrice: base.monthlyPrice,
    annualMonthlyEquiv: base.annualMonthlyEquiv || base.monthlyPrice,
    annualTotal: base.annualTotal,
    annualDiscountLabel: base.annualDiscountLabel,
    activeMonthly: interval === "annual"
      ? (base.annualMonthlyEquiv || base.monthlyPrice)
      : base.monthlyPrice,
  };
}
