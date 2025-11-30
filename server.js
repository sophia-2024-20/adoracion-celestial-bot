import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PORT = process.env.PORT || 10000;

// Ruta API: la que usa el chat para preguntar a DeepSeek
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

// Ruta principal: muestra una página de chat sencilla
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Asistente Adoración Celestial</title>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top, #020617, #020617);
      color: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .chat-container {
      width: 100%;
      max-width: 480px;
      height: 90vh;
      max-height: 680px;
      background: #020617;
      border-radius: 18px;
      border: 1px solid rgba(148,163,184,0.7);
      box-shadow: 0 24px 60px rgba(15,23,42,0.95);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .chat-header {
      padding: 0.75rem 0.9rem;
      background: linear-gradient(135deg, #0f172a, #022c22);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .chat-avatar {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 20%, #facc15, #22c55e);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      font-weight: 800;
    }
    .chat-title {
      font-size: 0.95rem;
      font-weight: 700;
    }
    .chat-sub {
      font-size: 0.75rem;
      color: #a5b4fc;
    }
    .chat-status {
      margin-left: auto;
      font-size: 0.7rem;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      background: rgba(22,163,74,0.18);
      color: #bbf7d0;
      border: 1px solid rgba(22,163,74,0.7);
    }
    .chat-body {
      flex: 1;
      padding: 0.7rem;
      overflow-y: auto;
      background: radial-gradient(circle at top, #020617, #020617);
    }
    .msg {
      margin-bottom: 0.5rem;
      display: flex;
    }
    .msg.bot {
      justify-content: flex-start;
    }
    .msg.user {
      justify-content: flex-end;
    }
    .bubble {
      max-width: 80%;
      padding: 0.5rem 0.7rem;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.4rem;
      white-space: pre-wrap;
    }
    .msg.bot .bubble {
      background: rgba(15,23,42,0.96);
      border: 1px solid rgba(148,163,184,0.8);
      color: #e5e7eb;
    }
    .msg.user .bubble {
      background: linear-gradient(135deg, #22c55e, #a3e635);
      color: #022c22;
      font-weight: 600;
    }
    .chat-input {
      display: flex;
      padding: 0.5rem;
      border-top: 1px solid rgba(51,65,85,0.9);
      background: #020617;
      gap: 0.4rem;
    }
    .chat-input textarea {
      flex: 1;
      resize: none;
      max-height: 70px;
      padding: 0.4rem 0.5rem;
      border-radius: 10px;
      border: 1px solid rgba(75,85,99,0.9);
      background: #020617;
      color: #e5e7eb;
      font-size: 0.85rem;
    }
    .chat-input button {
      border: none;
      border-radius: 10px;
      padding: 0 0.9rem;
      background: linear-gradient(135deg, #22c55e, #4ade80);
      color: #022c22;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-avatar">AC</div>
      <div>
        <div class="chat-title">Asistente Adoración Celestial</div>
        <div class="chat-sub">Música cristiana · Biblia · Pedidos</div>
      </div>
      <div class="chat-status">En línea</div>
    </div>
    <div id="chat-body" class="chat-body"></div>
    <div class="chat-input">
      <textarea id="chat-input" rows="1" placeholder="Escribe tu pregunta aquí..."></textarea>
      <button id="chat-send">Enviar</button>
    </div>
  </div>

  <script>
    const bodyEl = document.getElementById("chat-body");
    const inputEl = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");

    function addMsg(text, from) {
      const msg = document.createElement("div");
      msg.className = "msg " + (from === "user" ? "user" : "bot");
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = text;
      msg.appendChild(bubble);
      bodyEl.appendChild(msg);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    function bienvenida() {
      addMsg(
        "¡Bienvenido al asistente de Adoración Celestial! 💚\\n\\n" +
        "Puedo ayudarte con precios, estilos musicales cristianos, ideas de letras, " +
        "y preguntas bíblicas relacionadas con adoración y servicio a Dios.",
        "bot"
      );
    }

    async function enviar() {
      const texto = (inputEl.value || "").trim();
      if (!texto) return;
      addMsg(texto, "user");
      inputEl.value = "";

      const thinkingId = "thinking-" + Date.now();
      const tmsg = document.createElement("div");
      tmsg.className = "msg bot";
      tmsg.id = thinkingId;
      const tb = document.createElement("div");
      tb.className = "bubble";
      tb.textContent = "Estoy pensando tu respuesta, un momento...";
      tmsg.appendChild(tb);
      bodyEl.appendChild(tmsg);
      bodyEl.scrollTop = bodyEl.scrollHeight;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: texto })
        });
        const data = await res.json();
        const thinkingNode = document.getElementById(thinkingId);
        if (thinkingNode) thinkingNode.remove();

        if (data && data.reply) {
          addMsg(data.reply, "bot");
        } else {
          addMsg("Lo siento, hubo un problema al responder. Intenta de nuevo.", "bot");
        }
      } catch (e) {
        console.error(e);
        const thinkingNode = document.getElementById(thinkingId);
        if (thinkingNode) thinkingNode.remove();
        addMsg("No puedo conectar con el servidor en este momento. Intenta más tarde.", "bot");
      }
    }

    sendBtn.addEventListener("click", enviar);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        enviar();
      }
    });

    bienvenida();
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
