"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, ArrowLeft } from "lucide-react";
import "../styles/CurrencySelect.scss";

const CurrencySelect = ({
  currencies = [],
  allCurrencies = [],
  selectedCurrency,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Filter currencies based on search term
  useEffect(() => {
    if (searchTerm) {
      // When searching, always search through all currencies
      const filtered = allCurrencies.filter(
        (currency) =>
          currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCurrencies(filtered);
    } else {
      // When not searching, use the provided currencies list
      setFilteredCurrencies(currencies);
    }
  }, [searchTerm, currencies, allCurrencies]);

  // Safely find the selected currency data
  const selectedCurrencyData = allCurrencies.find(
    (c) => c.code === selectedCurrency
  ) || {
    code: selectedCurrency || "",
    name: selectedCurrency || "Select currency",
    flag: selectedCurrency ? selectedCurrency.substring(0, 2) : "",
  };

  // Check if there's enough space below the dropdown
  useEffect(() => {
    if (isOpen && triggerRef.current && !isMobile) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const dropdownHeight = Math.min(500, window.innerHeight * 0.8); // Approximate dropdown height

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [isOpen, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Prevent body scrolling when dropdown is open on mobile
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // Prevent touch events from causing glitches
  useEffect(() => {
    const preventTouchMove = (e) => {
      // Allow scrolling within the options container
      if (
        optionsContainerRef.current &&
        optionsContainerRef.current.contains(e.target)
      ) {
        return;
      }
      // Prevent touch move on other elements when dropdown is open
      if (isOpen && isMobile) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventTouchMove, {
      passive: false,
    });
    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen, isMobile]);

  const toggleDropdown = () => {
    if (disabled || currencies.length === 0) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleSelect = (currencyCode) => {
    onSelect(currencyCode);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const getFlagEmoji = (countryCode) => {
    try {
      if (!countryCode || countryCode.length < 2) return "🌐";

      // This is a simple implementation - for a real app, you might want to use a flag library
      const codePoints = countryCode
        .toUpperCase()
        .slice(0, 2)
        .split("")
        .map((char) => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      console.error("Error generating flag emoji:", e);
      return "🌐";
    }
  };

  return (
    <div
      className={`currency-select ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
    >
      <div className="select-trigger" onClick={toggleDropdown} ref={triggerRef}>
        <div className="selected-currency">
          <span className="currency-flag">
            {getFlagEmoji(
              selectedCurrencyData.flag || selectedCurrencyData.code
            )}
          </span>
          <span className="currency-code">{selectedCurrencyData.code}</span>
          <span className="currency-name">- {selectedCurrencyData.name}</span>
        </div>
        <ChevronDown
          size={18}
          className={`dropdown-icon ${isOpen ? "open" : ""}`}
        />
      </div>

      {isOpen && (
        <div
          className={`select-dropdown ${
            dropdownPosition === "top" ? "dropdown-top" : ""
          }`}
        >
          <div className="search-container">
            {isMobile && (
              <button
                className="back-button"
                onClick={closeDropdown}
                aria-label="Close dropdown"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="options-container" ref={optionsContainerRef}>
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`option ${
                    currency.code === selectedCurrency ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(currency.code)}
                >
                  <span className="currency-flag">
                    {getFlagEmoji(currency.flag || currency.code)}
                  </span>
                  <span className="currency-code">{currency.code}</span>
                  <span className="currency-name">- {currency.name}</span>
                </div>
              ))
            ) : (
              <div className="no-results">No currencies found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;
