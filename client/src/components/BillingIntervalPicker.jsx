/** Shared Pro pricing display amounts for singers and organizations. */
export function getBillingDisplay(isSinger, interval = "annual") {
  if (isSinger) {
    return {
      monthlyPrice: "$9.99",
      annualMonthlyEquiv: "$8.25",
      annualTotal: "$99",
      activeMonthly: interval === "annual" ? "$8.25" : "$9.99",
    };
  }
  return {
    monthlyPrice: "$79",
    annualMonthlyEquiv: "$65.83",
    annualTotal: "$790",
    activeMonthly: interval === "annual" ? "$65.83" : "$79",
  };
}
