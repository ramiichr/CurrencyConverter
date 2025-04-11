import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res
        .status(400)
        .json({ error: "Missing required query parameters: from, to, amount" });
    }

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
        count: 1, // Simplified for Vercel deployment
        limit: 100,
        percentage: 1,
      },
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({
      error: "Failed to convert currency",
      details: error.message,
    });
  }
}
