import fetch from "node-fetch";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    console.log("Fetching currencies from API...");

    // Check for API key
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is not set in environment variables");
      return res.status(500).json({
        error: "API key is not configured",
        details: "Please set the API_KEY environment variable",
      });
    }

    // Log the API key (first few characters for debugging)
    console.log(`Using API key: ${apiKey.substring(0, 4)}...`);

    // Make the API request
    const response = await fetch(
      `https://api.currencybeacon.com/v1/currencies?api_key=${apiKey}`
    );
    console.log("Response status:", response.status);

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      return res.status(response.status).json({
        error: `Currency API returned status ${response.status}`,
        details: errorText,
      });
    }

    // Parse the response
    const data = await response.json();
    console.log(
      "API Response structure:",
      JSON.stringify(Object.keys(data), null, 2)
    );

    // Check for expected data structure
    if (!data.response) {
      console.error(
        "Unexpected API response format:",
        JSON.stringify(data, null, 2)
      );
      return res.status(500).json({
        error: "Unexpected API response format",
        details:
          "The API response does not contain the expected 'response' field",
      });
    }

    // Return the data
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
