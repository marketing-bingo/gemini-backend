import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const askGemini = async (question) => {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 GEMINI_API_KEY:", apiKey ? "[Present]" : "[Missing]");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  console.log("📥 Gemini API raw response:", JSON.stringify(data, null, 2));

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response from Gemini."
  );
};

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).json({ error: "Missing question in request body." });
  }

  try {
    const reply = await askGemini(question);
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error calling Gemini:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
