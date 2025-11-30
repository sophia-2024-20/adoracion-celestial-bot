// server.js – Compatible con ESM y Google Gemini

import express from "express";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ No se encontró GEMINI_API_KEY en Render.");
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor Adoración Celestial (Gemini) en funcionamiento.");
});

// RUTA DEL CHAT
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const prompt = `
Eres un asistente cristiano de "Adoración Celestial".
Responde SIEMPRE en español.
Puedes ayudar con temas bíblicos, música cristiana, estilos musicales,
letras cristianas, creación de canciones y versículos.

Pregunta del usuario:
"${userMessage}"
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Gemini:", data);
      return res.status(500).json({ error: "Error al conectar con Gemini" });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar respuesta.";

    res.json({ reply: text });
  } catch (error) {
    console.error("Error interno:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
