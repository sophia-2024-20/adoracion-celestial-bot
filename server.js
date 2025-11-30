// server.js – Compatible con ESM y Google Gemini en Render

import express from "express";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 🔑 API key desde Render (Environment Variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ No se encontró GEMINI_API_KEY en Render.");
}

app.use(express.json());

// Página principal del servidor
app.get("/", (req, res) => {
  res.send("Servidor Adoración Celestial (Gemini) funcionando correctamente.");
});

// 🧠 Ruta de chat usada por tu sitio web
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const prompt = `
Eres un asistente cristiano del estudio "Adoración Celestial".
Responde SIEMPRE en español.

Puedes ayudar con:
• Versículos bíblicos (explicación simple y correcta)
• Temas cristianos (Espíritu Santo, jóvenes, damas, familia, fe, salvación)
• Música cristiana (banda, cumbia grupera, balada grupera, bachata, vallenato, worship)
• Composición de canciones cristianas
• Consejos sobre adoración
• Letras basadas en la Biblia (ej. Mateo 28:19, Salmo 23, Juan 3:16)
• Información sobre pistas musicales (100, 125 y 150 USD)

Pregunta del usuario:
"${userMessage}"
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error desde Gemini:", data);
      return res.status(500).json({ error: "Error al conectar con Gemini" });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ Error interno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar servidor en Render
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
