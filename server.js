import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PORT = process.env.PORT || 10000;

// Nos aseguramos de que fetch exista (Node 18+)
if (typeof fetch !== "function") {
  console.error("ERROR: fetch no está disponible. Asegúrate de usar NODE_VERSION 18 o superior en Render.");
}

/**
 * Endpoint principal de chat
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje inválido" });
    }

    if (!DEEPSEEK_API_KEY) {
      console.error("Falta DEEPSEEK_API_KEY en variables de entorno.");
      return res.status(500).json({ error: "Servidor no configurado correctamente." });
    }

    const systemPrompt = `
Eres el asistente oficial de "Adoración Celestial", un estudio de producción musical cristiana.

Tu estilo:
- Hablas con respeto, claridad y tono pastoral y amable.
- Centras las respuestas en Jesús, la Biblia y la adoración genuina.
- No inventas doctrinas raras ni fechas de la venida de Cristo.
- No das diagnósticos médicos, financieros ni legales profesionales.

Tu enfoque principal:
- Explicar precios y paquetes de Adoración Celestial.
- Explicar cómo hacer un pedido (formulario, letra, historia, testimonio).
- Explicar estilos musicales cristianos (balada, banda, cumbia, adoración, grupero, bachata, corridos, etc.).
- Ayudar a que el usuario exprese su testimonio en forma de canción.
- Responder dudas sobre temas bíblicos relacionados con adoración, servicio, jóvenes, damas, Espíritu Santo, esperanza, fe, gratitud, etc.

Datos fijos del servicio:
- Paquetes (USD):
  * 100 USD – Pista instrumental personalizada.
  * 125 USD – Pista con segunda voz / coros.
  * 150 USD – Canción completa personalizada (letra + pista).
- Métodos de pago:
  * Zelle al número 704 648 9628.
  * PayPal en el enlace paypal.me/adoracioncelestial.
- Contacto:
  * WhatsApp: +1 704 648 9628.
  * Correo: higinioc172@gmail.com.

Reglas:
- Si no sabes algo, dilo con humildad.
- Para temas muy delicados (salud, decisiones de vida muy fuertes),
  anima a buscar consejería pastoral y ayuda profesional.
- Si el usuario se va a temas de odio o violencia, redirige a un mensaje de amor, perdón y esperanza en Cristo.
    `.trim();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error DeepSeek:", errorText);
      return res.status(500).json({ error: "Error en DeepSeek" });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta en este momento.";

    res.json({ reply });
  } catch (err) {
    console.error("Error /api/chat:", err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor de Adoración Celestial Bot (DeepSeek) funcionando.");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
