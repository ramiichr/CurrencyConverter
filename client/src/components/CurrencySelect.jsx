"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Search,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import "../styles/CurrencySelect.scss";

const CURRENCIES_PER_PAGE = 4;

const CurrencySelect = ({
  currencies = [],
  allCurrencies = [],
  selectedCurrency,
  onSelect,
  disabled = false,
  showAllCurrencies = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

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
      // When not searching, use the provided currencies list (either top 5 or all)
      setFilteredCurrencies(currencies);
    }
    // Reset to first page when search term changes
    setCurrentPage(0);
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

  const toggleDropdown = () => {
    if (disabled || currencies.length === 0) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setCurrentPage(0);
    }
  };

  const handleSelect = (currencyCode) => {
    onSelect(currencyCode);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(0);
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredCurrencies.length / CURRENCIES_PER_PAGE);
  const startIndex = currentPage * CURRENCIES_PER_PAGE;
  const endIndex = startIndex + CURRENCIES_PER_PAGE;
  const currentPageCurrencies = filteredCurrencies.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
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
              <button className="back-button" onClick={closeDropdown}>
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
              <button className="clear-search" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
          <div className="options-container">
            {currentPageCurrencies.length > 0 ? (
              <>
                {currentPageCurrencies.map((currency) => (
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
                ))}
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className={`pagination-button ${
                        currentPage === 0 ? "disabled" : ""
                      }`}
                      onClick={goToPrevPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </button>
                    <span className="pagination-info">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      className={`pagination-button ${
                        currentPage === totalPages - 1 ? "disabled" : ""
                      }`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
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
