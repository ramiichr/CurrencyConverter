import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// Import the main Sass file directly
import "./styles/App.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
