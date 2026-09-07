const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req,res) => res.send('ViralForge Backend LIVE - openai/gpt-oss-20b'));

app.post('/generate', async (req, res) => {
  const { topic, style } = req.body;
  if(!topic) return res.status(400).json({error: "Topic manquant"});

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        response_format: { type: "json_object" },
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content: "Tu es le meilleur créateur de scripts TikTok viral. Tu réponds TOUJOURS en JSON valide uniquement."
          },
          {
            role: "user",
            content: `Sujet: ${topic}, Style: ${style || 'Choc'}. 
            Crée un script TikTok 30s ULTRA viral en JSON:
            {
              "hook": "0-5s - Phrase choc qui stop le scroll + visuel (1 phrase)",
              "part1": "5-12s - Secret 1 + ce qu'il faut dire + visuel",
              "part2": "12-20s - Secret 2 + ce qu'il faut dire + visuel",
              "part3": "20-30s - Secret 3 + CTA abonne-toi + visuel",
              "full": "Script complet à lire d'une traite"
            }
            Pas de **, pas de | tableau |, que du texte punchy avec emojis. Français.`
          }
        ]
      })
    });

    const data = await groqRes.json();
    if(data.error) throw new Error(data.error.message);
    
    const content = data.choices[0].message.content;
    const json = JSON.parse(content);

    res.json({ 
      script: json.full || `${json.hook}\n${json.part1}\n${json.part2}\n${json.part3}`,
      ...json
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server on ' + PORT));
