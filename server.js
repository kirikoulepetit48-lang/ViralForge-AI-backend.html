const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let freeUsesViral = 0;
let freeUsesThumb = 0;
const MAX_FREE = 2;
const VIP_CODE = "VIP2026";
const isVIP = (c) => c === VIP_CODE;

app.get('/', (req,res)=>res.send('ViralForge + ThumbForge LIVE - openai/gpt-oss-20b'));

app.post('/generate', async (req,res)=>{
  const {topic,style,code}=req.body;
  if(!topic) return res.status(400).json({error:"Topic manquant"});
  if(!isVIP(code) && freeUsesViral>=MAX_FREE) return res.status(402).json({needPayment:true});
  try{
    const groqRes=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.GROQ_API_KEY}`},
      body:JSON.stringify({model:"openai/gpt-oss-20b",response_format:{type:"json_object"},temperature:0.9,messages:[
        {role:"system",content:"Tu es créateur TikTok viral. JSON uniquement."},
        {role:"user",content:`Sujet:${topic} Style:${style}. JSON:{"hook":"0-5s","part1":"5-12s","part2":"12-20s","part3":"20-30s","full":"script complet"} Français.`}
      ]})
    });
    const data=await groqRes.json();
    const json=JSON.parse(data.choices[0].message.content);
    if(!isVIP(code)) freeUsesViral++;
    res.json({...json,script:json.full,remaining:isVIP(code)?999:MAX_FREE-freeUsesViral});
  }catch(e){res.status(500).json({error:e.message});}
});

// FIX IMAGES NOIRES / RANDOM
app.post('/api/thumb', async (req,res)=>{
  const {title,style,code}=req.body;
  if(!title) return res.status(400).json({error:"Titre manquant"});
  if(!isVIP(code) && freeUsesThumb>=MAX_FREE) return res.status(402).json({needPayment:true});
  const clean=encodeURIComponent(title.slice(0,50));
  const t=Date.now();
  const images=[
    `https://image.pollinations.ai/prompt/viral%20youtube%20thumbnail%20shocked%20face%20${clean}%20neon%20dramatic?width=1280&height=720&model=flux&seed=${t}&nologo=true&enhance=true`,
    `https://image.pollinations.ai/prompt/viral%20youtube%20thumbnail%20rich%20luxury%20money%20${clean}%20bold%20yellow%20text?width=1280&height=720&model=flux&seed=${t+1}&nologo=true&enhance=true`,
    `https://image.pollinations.ai/prompt/viral%20youtube%20thumbnail%20meme%20funny%20${clean}%20clickbait?width=1280&height=720&model=flux&seed=${t+2}&nologo=true&enhance=true`
  ];
  if(!isVIP(code)) freeUsesThumb++;
  res.json({images,remaining:isVIP(code)?999:MAX_FREE-freeUsesThumb});
});

app.post('/api/validate',(req,res)=>res.json({valid:isVIP(req.body.code)}));
const PORT=process.env.PORT||10000;
app.listen(PORT,()=>console.log('LIVE on '+PORT));
