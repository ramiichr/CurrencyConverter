import { createRequire } from "module";
import express from "express";
import cors from "cors";

const require = createRequire(import.meta.url);
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// API usage status tracker
let apiCallsCount = 0;
const API_LIMIT = 100;

// API request to handle list of currencies
app.get("/api/currencies", async (req, res) => {
  try {
    apiCallsCount++;
    console.log("Fetching currencies from API...");

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "API key is not configured",
        details: "Please set the API_KEY environment variable",
      });
    }

    const response = await fetch(
      `https://api.currencybeacon.com/v1/currencies?api_key=${apiKey}`
    );

    console.log("Response status:", response.status);

    const data = await response.json();

    // Log the structure of the response to understand the format
    console.log(
      "API Response structure:",
      JSON.stringify(Object.keys(data), null, 2)
    );

    if (data.response) {
      console.log(
        "First few currencies:",
        JSON.stringify(Object.entries(data.response).slice(0, 5), null, 2)
      );
    } else {
      console.log("Response data:", JSON.stringify(data, null, 2));
    }

    // Check if we have the expected data structure
    if (!data.response) {
      console.error("Unexpected API response format:", data);
      return res.status(500).json({
        error: "Unexpected API response format",
        details:
          "The API response does not contain the expected 'response' field",
      });
    }

    res.json({
      data: data.response,
      apiUsage: {
        count: apiCallsCount,
        limit: API_LIMIT,
        percentage: (apiCallsCount / API_LIMIT) * 100,
      },
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({
      error: "Failed to fetch currencies",
      details: error.message,
    });
  }
});

// Server-side API request to handle currency conversion
app.get("/api/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters: from, to, amount" });
    }

    apiCallsCount++;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "API key is not configured",
        details: "Please set the API_KEY environment variable",
      });
    }

    console.log(`Converting ${amount} ${from} to ${to}`);

    const response = await fetch(
      `https://api.currencybeacon.com/v1/convert?api_key=${apiKey}&from=${from}&to=${to}&amount=${amount}`
    );

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Conversion response:", JSON.stringify(data, null, 2));

    if (!data.response) {
      console.error("Unexpected API response format:", data);
      return res.status(500).json({
        error: "Unexpected API response format",
        details:
          "The API response does not contain the expected 'response' field",
      });
    }

    res.json({
      data: data.response,
      apiUsage: {
        count: apiCallsCount,
        limit: API_LIMIT,
        percentage: (apiCallsCount / API_LIMIT) * 100,
      },
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({
      error: "Failed to convert currency",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.send(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
