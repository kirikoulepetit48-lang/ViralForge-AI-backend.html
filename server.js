const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test du serveur
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend ViralForge AI fonctionne 🚀",
  });
});

// Génération du contenu TikTok
app.post("/generate", async (req, res) => {
  try {
    const { topic, contentType, style } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Le sujet est obligatoire.",
      });
    }

    const prompt = `
Tu es ViralForge AI, un expert en création de contenu TikTok viral.

Crée du contenu pour une vidéo TikTok.

SUJET : ${topic}
TYPE DE CONTENU : ${contentType}
STYLE : ${style}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après.

Utilise exactement ce format :

{
  "hook": "un hook puissant et viral",
  "script": "le script complet de la vidéo",
  "scenes": "les différentes scènes à afficher",
  "cta": "un appel à l'action puissant",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3"
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Tu es un assistant spécialisé dans la création de contenu viral TikTok. Tu réponds toujours avec du JSON valide.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: {
        type: "json_object",
      },
    });

    const content = completion.choices[0].message.content;

    const data = JSON.parse(content);

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Erreur Groq :", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du contenu.",
      error: error.message,
    });
  }
});

// Port Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur ViralForge AI lancé sur le port ${PORT}`);
});
