import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Load .env file if running locally

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

app.post("/ask", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const userQuestion = req.body.question;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Gemini API key in environment variables." });
  }

  if (!userQuestion) {
    return res.status(400).json({ error: "Missing 'question' in request body." });
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userQuestion }]
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";

    res.json({ reply });
  } catch (error) {
    console.error("Error talking to Gemini:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
