import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
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
        count: 1, // Simplified for Vercel deployment
        limit: 100,
        percentage: 1,
      },
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({
      error: "Failed to fetch currencies",
      details: error.message,
    });
  }
}
