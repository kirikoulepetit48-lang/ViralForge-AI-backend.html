const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=> res.json({ok:true}));

app.post('/generate', async (req,res)=>{
  try{
    const key = process.env.GROQ_API_KEY;
    console.log("Clé présente?",!!key, "Topic:", req.body.topic);
    if(!key) return res.json({error:"GROQ_API_KEY manquante sur Render!"});

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
      body: JSON.stringify({
        model:"openai/gpt-oss-20b",
        messages:[{role:"user", content:`Script TikTok viral 30s sur ${req.body.topic}, style ${req.body.style}. Hook choc + 3 secrets + CTA. Français punchy.`}],
        max_tokens:500
      })
    });
    const d = await r.json();
    console.log("GROQ:", JSON.stringify(d).substring(0,400));
    if(d.error) return res.json({error:"Groq dit: "+d.error.message});
    res.json({script: d.choices[0].message.content});
  }catch(e){
    console.log("ERREUR SERVEUR:", e);
    res.json({error:e.message});
  }
});
app.listen(process.env.PORT||10000, ()=>console.log("Lancé sur 10000"));
