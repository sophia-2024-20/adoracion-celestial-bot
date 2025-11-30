// server.js – versión Gemini (sin DeepSeek)

require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// 🔑 Leemos la API key de Gemini desde Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️ No se encontró GEMINI_API_KEY en variables de entorno. " +
      "Configúrala en Render > Environment."
  );
}

app.use(express.json());

// (Opcional) servir archivos estáticos si tienes una carpeta public
// app.use(express.static("public"));

// Ruta principal simple para comprobar que el server corre
app.get("/", (req, res) => {
  res.send("Servidor de Adoración Celestial (Gemini) está en línea.");
});

// 🧠 Ruta de chat usada por tu web: POST /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = (req.body && req.body.message) || "";

    if (!userMessage) {
      return res
        .status(400)
        .json({ error: "Falta el campo 'message' en el cuerpo de la petición." });
    }

    if (!GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "El servidor no tiene configurada GEMINI_API_KEY." });
    }

    // Prompt base para orientar a Gemini a tu proyecto
    const prompt = `
Eres un asistente de "Adoración Celestial", un estudio que crea música cristiana personalizada.

Debes:
- Responder SIEMPRE en español.
- Ayudar con temas bíblicos (salvación, cruz, Espíritu Santo, jóvenes, damas, familia, Mateo 28:19, etc.).
- Explicar estilos musicales cristianos (banda, cumbia grupera, balada grupera, bachata, vallenato, reguetón cristiano, worship, etc.).
- Responder preguntas sobre precios, paquetes y proceso de pedido de pistas cristianas.

Sé claro, amable y respetuoso. No inventes precios nuevos: si te preguntan, usa los paquetes generales (100, 125, 150 USD) salvo que el usuario diga otros.

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
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error Gemini:", data);
      return res
        .status(500)
        .json({ error: "Error al conectar con Gemini (ver logs del servidor)." });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Lo siento, no pude generar una respuesta en este momento.";

    res.json({ reply: text });
  } catch (err) {
    console.error("Error en /api/chat:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
