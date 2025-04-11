export default function handler(req, res) {
  // Get all environment variables (safely)
  const envVars = Object.keys(process.env)
    .filter(
      (key) =>
        key.includes("API") || key.includes("VERCEL") || key.includes("NODE")
    )
    .reduce((obj, key) => {
      // Only show first few chars of sensitive values
      const value = process.env[key];
      obj[key] =
        key.includes("KEY") || key.includes("SECRET")
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : value;
      return obj;
    }, {});

  res.status(200).json({
    status: "ok",
    message: "API is working",
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.API_KEY,
      apiKeyLength: process.env.API_KEY ? process.env.API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    },
    // Safe list of environment variables for debugging
    envVars,
    // Request info
    request: {
      headers: req.headers,
      url: req.url,
      method: req.method,
    },
  });
}
