export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "API is working",
    env: {
      hasApiKey: !!process.env.API_KEY,
      apiKeyLength: process.env.API_KEY ? process.env.API_KEY.length : 0,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
