const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- PAYWALL CONFIG ---
let freeUsesViral = 0;
let freeUsesThumb = 0;
const MAX_FREE = 2;
const VIP_CODE = "VIP2026";
const isVIP = (code) => code === VIP_CODE;

app.get('/', (req,res) => res.send('ViralForge + ThumbForge Backend LIVE - openai/gpt-oss-20b'));

// --- 1. VIRALFORGE ENDPOINT (ton actuel + paywall) ---
app.post('/generate', async (req, res) => {
  const { topic, style, code } = req.body;
  if(!topic) return res.status(400).json({error: "Topic manquant"});

  // PAYWALL
  if(!isVIP(code) && freeUsesViral >= MAX_FREE){
    return res.status(402).json({error:"PAYWALL", needPayment:true, message:"Plus d'essais gratuits! Paye via Fondeka frérot 🙏"});
  }

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
          { role: "system", content: "Tu es le meilleur créateur de scripts TikTok viral. Tu réponds TOUJOURS en JSON valide uniquement." },
          { role: "user", content: `Sujet: ${topic}, Style: ${style || 'Choc'}. Crée un script TikTok 30s ULTRA viral en JSON: {"hook":"0-5s - Phrase choc qui stop le scroll + visuel","part1":"5-12s - Secret 1","part2":"12-20s - Secret 2","part3":"20-30s - Secret 3 + CTA","full":"Script complet"} Pas de **, pas de |, texte punchy avec emojis. Français.` }
        ]
      })
    });

    const data = await groqRes.json();
    if(data.error) throw new Error(data.error.message);
    const json = JSON.parse(data.choices[0].message.content);

    if(!isVIP(code)) freeUsesViral++;

    res.json({
      script: json.full || `${json.hook}\n${json.part1}\n${json.part2}\n${json.part3}`,
     ...json,
      remaining: isVIP(code)? 999 : Math.max(0, MAX_FREE - freeUsesViral),
      isVIP: isVIP(code)
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// --- 2. THUMBForge AI ENDPOINT (NOUVEAU!) ---
app.post('/api/thumb', async (req,res)=>{
  const { title, style, code } = req.body;
  if(!title) return res.status(400).json({error:"Titre manquant"});

  if(!isVIP(code) && freeUsesThumb >= MAX_FREE){
    return res.status(402).json({needPayment:true, message:"Paywall ThumbForge"});
  }

  const promptMap={
    shocked: `shocked youtuber face open mouth eyes wide dramatic neon lighting viral youtube thumbnail 4k, text "${title}" bold big`,
    bold: `bold viral youtube thumbnail luxury money success bright colors high contrast, text "${title}" huge yellow`,
    meme: `meme funny exaggerated youtube thumbnail viral crazy expression, text "${title}"`
  };
  const base = promptMap[style] || promptMap.shocked;
  const seeds=[Date.now(), Date.now()+11, Date.now()+22];
  const images = seeds.map(s=>`https://image.pollinations.ai/prompt/${encodeURIComponent(base)}?seed=${s}&width=1280&height=720&nologo=true&enhance=true`);

  if(!isVIP(code)) freeUsesThumb++;

  res.json({images, remaining: isVIP(code)?999:Math.max(0,MAX_FREE-freeUsesThumb), isVIP:isVIP(code)});
});

// --- 3. CODE VALIDATION ---
app.post('/api/validate', (req,res)=>{
  const {code}=req.body;
  if(isVIP(code)) return res.json({valid:true});
  res.json({valid:false});
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('ViralForge + ThumbForge LIVE on ' + PORT));
