const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let freeUsesViral = 0;
let freeUsesThumb = 0;
const MAX_FREE = 2;
const VIP_CODE = "VIP2026";
const isVIP = (code) => code === VIP_CODE;

app.get('/', (req,res) => res.send('ViralForge + ThumbForge Backend LIVE - openai/gpt-oss-20b'));

// VIRALFORGE
app.post('/generate', async (req, res) => {
  const { topic, style, code } = req.body;
  if(!topic) return res.status(400).json({error: "Topic manquant"});
  if(!isVIP(code) && freeUsesViral >= MAX_FREE) return res.status(402).json({needPayment:true});

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        response_format: { type: "json_object" },
        temperature: 0.9,
        messages: [
          { role: "system", content: "Tu es le meilleur créateur de scripts TikTok viral. JSON uniquement." },
          { role: "user", content: `Sujet: ${topic}, Style: ${style||'Choc'}. JSON: {"hook":"0-5s","part1":"5-12s","part2":"12-20s","part3":"20-30s","full":"script complet"} Français punchy.` }
        ]
      })
    });
    const data = await groqRes.json();
    const json = JSON.parse(data.choices[0].message.content);
    if(!isVIP(code)) freeUsesViral++;
    res.json({...json, script: json.full, remaining: isVIP(code)?999:MAX_FREE-freeUsesViral });
  } catch (e) { res.status(500).json({error: e.message}); }
});

// THUMBForge - VERSION FIX
app.post('/api/thumb', async (req,res)=>{
  const { title, style, code } = req.body;
  if(!title) return res.status(400).json({error:"Titre manquant"});
  if(!isVIP(code) && freeUsesThumb >= MAX_FREE) return res.status(402).json({needPayment:true});

  const cleanTitle = title.slice(0,40);
  const promptMap={
    shocked: `youtube thumbnail shocked face, ${cleanTitle}, dramatic, 4k`,
    bold: `youtube thumbnail bold text ${cleanTitle}, money luxury, high contrast`,
    meme: `funny youtube thumbnail meme, ${cleanTitle}, viral`
  };
  const base = promptMap[style] || promptMap.shocked;
  const t = Date.now();
  const images = [
    `https://image.pollinations.ai/prompt/${encodeURIComponent(base)}?seed=${t}&width=1280&height=720&nologo=1`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(base+' variant 2')}?seed=${t+1}&width=1280&height=720&nologo=1`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(base+' variant 3')}?seed=${t+2}&width=1280&height=720&nologo=1`
  ];

  if(!isVIP(code)) freeUsesThumb++;
  res.json({images, remaining: isVIP(code)?999:MAX_FREE-freeUsesThumb});
});

app.post('/api/validate', (req,res)=>{ res.json({valid:isVIP(req.body.code)}); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('ViralForge + ThumbForge LIVE on ' + PORT));
