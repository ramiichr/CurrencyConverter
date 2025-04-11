"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import CurrencySelect from "./CurrencySelect";
import "../styles/CurrencyConverter.scss";

const API_BASE_URL =
  import.meta.env.API_PROD_URL || "http://localhost:5000/api";

const CurrencyConverter = ({ updateApiUsage }) => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [conversionResult, setConversionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setCurrenciesLoading(true);
      setError(null);
      console.log("Fetching currencies...");

      const response = await fetch(`${API_BASE_URL}/currencies`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch currencies: ${response.status}`
        );
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse API response");
      });

      console.log("Currencies API response received:", data);

      // Check if the data has the expected structure
      if (!data || !data.data) {
        console.error("Unexpected API response format:", data);
        throw new Error("Invalid API response format");
      }

      // Format currencies for the dropdown
      try {
        // The API response might be an array of currency objects or an object with currency codes as keys
        let formattedCurrencies = [];

        if (Array.isArray(data.data)) {
          // If it's an array of currency objects
          formattedCurrencies = data.data.map((currency) => {
            return {
              code: currency.short_code || currency.code,
              name: currency.name || currency.short_code || currency.code,
              symbol: currency.symbol || "",
              flag: currency.short_code
                ? currency.short_code.substring(0, 2)
                : "",
            };
          });
        } else {
          // If it's an object with currency codes as keys
          formattedCurrencies = Object.entries(data.data).map(
            ([code, name]) => {
              return {
                code: code,
                name: typeof name === "string" ? name : code,
                symbol: "",
                flag: code.substring(0, 2),
              };
            }
          );
        }

        // Sort currencies alphabetically by code
        formattedCurrencies.sort((a, b) => a.code.localeCompare(b.code));

        console.log(`Loaded ${formattedCurrencies.length} currencies`);
        console.log("First few currencies:", formattedCurrencies.slice(0, 5));

        if (formattedCurrencies.length === 0) {
          throw new Error("No currencies received from API");
        }

        setAllCurrencies(formattedCurrencies);

        if (data.apiUsage) {
          updateApiUsage(data.apiUsage);
        }

        // Set default currencies if they exist in the list
        const hasUSD = formattedCurrencies.some((c) => c.code === "USD");
        const hasEUR = formattedCurrencies.some((c) => c.code === "EUR");

        if (hasUSD) {
          setFromCurrency("USD");
        } else if (formattedCurrencies.length > 0) {
          setFromCurrency(formattedCurrencies[0].code);
        }

        if (hasEUR) {
          setToCurrency("EUR");
        } else if (formattedCurrencies.length > 1) {
          setToCurrency(formattedCurrencies[1].code);
        } else if (formattedCurrencies.length > 0) {
          // If we only have one currency, use the same for both
          setToCurrency(formattedCurrencies[0].code);
        }
      } catch (err) {
        console.error("Error processing currencies:", err);
        throw new Error(`Failed to process currencies: ${err.message}`);
      }
    } catch (err) {
      console.error("Currency fetch error:", err);
      setError(err.message || "Failed to fetch currencies");
      // Set empty currencies array to prevent component from disappearing
      setAllCurrencies([]);
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const handleConvert = async () => {
    if (allCurrencies.length === 0) {
      setError("No currencies available. Please try refreshing the page.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);

      const response = await fetch(
        `${API_BASE_URL}/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to convert currency");
      }

      const data = await response.json().catch(() => {
        throw new Error("Failed to parse conversion response");
      });

      console.log("Conversion response:", data);

      if (data.data) {
        setConversionResult(data.data);
        if (data.apiUsage) {
          updateApiUsage(data.apiUsage);
        }
      } else {
        throw new Error("Invalid conversion response format");
      }
    } catch (err) {
      setError(err.message || "Failed to convert currency");
      console.error("Conversion error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getFromCurrencySymbol = () => {
    return getCurrencySymbol(fromCurrency);
  };

  const getCurrencySymbol = (currencyCode) => {
    // Try to find the symbol in our currencies array
    const currency = allCurrencies.find((c) => c.code === currencyCode);
    if (currency && currency.symbol) {
      return currency.symbol;
    }

    // Fallback to hardcoded symbols
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CNY: "¥",
      INR: "₹",
      AUD: "A$",
      CAD: "C$",
      CHF: "Fr",
      HKD: "HK$",
      NZD: "NZ$",
      SEK: "kr",
      KRW: "₩",
      SGD: "S$",
      NOK: "kr",
      MXN: "$",
      // Add more as needed
    };
    return symbols[currencyCode] || currencyCode;
  };

  const handleRetry = () => {
    fetchCurrencies();
  };

  return (
    <div className="converter-container">
      {currenciesLoading ? (
        <div className="loading-container">
          <RefreshCw className="spin" size={24} />
          <p>Loading currencies...</p>
        </div>
      ) : error && allCurrencies.length === 0 ? (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <h3>Error Loading Currencies</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="converter-form">
            <div className="form-group">
              <label>Amount</label>
              <div className="input-with-symbol">
                <span className="currency-symbol">
                  {getFromCurrencySymbol()}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Base Currency</label>
              <CurrencySelect
                currencies={allCurrencies}
                allCurrencies={allCurrencies}
                selectedCurrency={fromCurrency}
                onSelect={setFromCurrency}
                disabled={loading}
              />
            </div>

            <div className="swap-button-container">
              <button
                className="swap-button"
                onClick={handleSwapCurrencies}
                disabled={loading}
              >
                <ArrowUpDown size={18} />
                Swap
              </button>
            </div>

            <div className="form-group">
              <label>Foreign Currency</label>
              <CurrencySelect
                currencies={allCurrencies}
                allCurrencies={allCurrencies}
                selectedCurrency={toCurrency}
                onSelect={setToCurrency}
                disabled={loading}
              />
            </div>

            <button
              className="convert-button"
              onClick={handleConvert}
              disabled={loading || allCurrencies.length === 0}
            >
              {loading ? <RefreshCw className="spin" size={18} /> : "Convert"}
            </button>
          </div>

          {conversionResult && (
            <div className="conversion-result">
              <div className="result-text">
                <span className="result-label">
                  {amount}{" "}
                  {allCurrencies.find((c) => c.code === fromCurrency)?.name ||
                    fromCurrency}{" "}
                  =
                </span>
                <span className="result-value">
                  {getCurrencySymbol(toCurrency)}
                  {conversionResult.value.toFixed(3)}
                </span>
              </div>
              <div className="result-attribution">
                Powered by
                <a
                  href="https://currencybeacon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Currencybeacon <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {error && allCurrencies.length > 0 && (
            <div className="error-message">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CurrencyConverter;
