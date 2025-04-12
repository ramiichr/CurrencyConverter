"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, ExternalLink } from "lucide-react";
import CurrencyConverter from "./components/CurrencyConverter";
import Logo from "./components/Logo";
import "./styles/App.scss";

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return (
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });
  const [apiUsage, setApiUsage] = useState({
    count: 0,
    limit: 100,
    percentage: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const updateApiUsage = (usage) => {
    setApiUsage(usage);
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-container">
          <Logo />
          <div className="brand-text">
            <h1>ExchangeFlow</h1>
            <p>
              Fast, secure, and reliable currency conversion at your fingertips
            </p>
          </div>
        </div>
        <div className="api-usage">
          <span
            className={`status-indicator ${
              apiUsage.percentage < 80 ? "active" : "warning"
            }`}
          ></span>
          API USAGE: {Math.round(apiUsage.percentage)}%
        </div>
      </header>

      <main>
        <CurrencyConverter updateApiUsage={updateApiUsage} />
      </main>

      <footer>
        <div className="footer-left">
          <p>
            Built by{" "}
            <a
              href="https://github.com/ramiichr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rami Cheikh Rouhou <ExternalLink size={14} />
            </a>
          </p>
        </div>
        <div className="footer-right">
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
