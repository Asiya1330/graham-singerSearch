import { useState, useCallback } from "react";
import { lookupStateForCity } from "../utils/cityState";

export function useCityStateAutofill(setForm, opts = {}) {
  const { cityKey = "city", stateKey = "state" } = opts;
  const [stateAutoFilled, setStateAutoFilled] = useState(false);

  const handleCityChange = useCallback((city) => {
    const matched = lookupStateForCity(city);
    setForm(prev => matched
      ? { ...prev, [cityKey]: city, [stateKey]: matched }
      : { ...prev, [cityKey]: city });
    if (matched) setStateAutoFilled(true);
  }, [setForm, cityKey, stateKey]);

  const handleStateChange = useCallback((state) => {
    setForm(prev => ({ ...prev, [stateKey]: state }));
    setStateAutoFilled(false);
  }, [setForm, stateKey]);

  return { stateAutoFilled, handleCityChange, handleStateChange, setStateAutoFilled };
}

export default useCityStateAutofill;
