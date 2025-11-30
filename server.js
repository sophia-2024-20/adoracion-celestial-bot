// server.js – Asistente Adoración Celestial con Gemini

import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware JSON
app.use(express.json());

// ✅ CORS: permitir peticiones desde tu HTML local
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Página principal de prueba
app.get("/", (req, res) => {
  res.send("Servidor Adoración Celestial (Gemini) funcionando correctamente.");
});

// ✅ GET /api/chat solo para probar en el navegador
app.get("/api/chat", (req, res) => {
  res.json({
    error: "Usa POST /api/chat con { message: 'tu pregunta' } en el body.",
  });
});

// ✅ Ruta principal de chat (lo que usa tu web)
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    console.log("🟢 Nueva pregunta del asistente:", userMessage);

    if (!GEMINI_API_KEY) {
      console.error("⚠️ Falta GEMINI_API_KEY en variables de entorno");
      return res.json({
        reply:
          "No tengo acceso a la IA en este momento (falta la clave GEMINI).",
      });
    }

    const prompt = `
Eres un asistente cristiano del estudio "Adoración Celestial".
Responde SIEMPRE en español, con cariño y respeto.

Ayuda con:
• Versículos bíblicos y su explicación simple.
• Temas cristianos: salvación, Espíritu Santo, jóvenes, culto de damas, adoración, etc.
• Estilos musicales cristianos: banda, cumbia grupera, balada grupera, bachata, vallenato, worship.
• Composición de canciones cristianas, basadas en la Biblia.
• Explicar textos como Mateo 28:19, Juan 3:16, Salmo 23, etc.
• Información general sobre los paquetes de música de la web.

Pregunta del usuario:
"${userMessage}"
`.trim();

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error desde Gemini:", data);
      return res.json({
        reply:
          "Hubo un problema al conectar con la IA. Intenta de nuevo más tarde.",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    res.json({ reply: text });
  } catch (error) {
    console.error("❌ Error interno del servidor:", error);
    res.json({
      reply:
        "Ocurrió un error interno al procesar tu pregunta. Intenta más tarde.",
    });
  }
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Adoración Celestial escuchando en puerto ${PORT}`);
});
