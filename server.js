const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res)=> res.json({success:true, message:"ViralForge AI OK 🚀"}));

app.post("/generate", async (req,res)=>{
  try{
    const { topic, contentType, style } = req.body;
    if(!topic) return res.status(400).json({success:false, message:"Topic obligatoire"});
    if(!process.env.GROQ_API_KEY) return res.status(500).json({success:false, message:"GROQ_API_KEY manquante dans Render"});

    const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

    const completion = await groq.chat.completions.create({
      model:"llama-3.3-70b-versatile",
      messages:[
        {role:"system", content:"Tu es expert contenu TikTok viral. Réponds JSON valide."},
        {role:"user", content:`SUJET: ${topic} TYPE: ${contentType} STYLE: ${style} Réponds JSON: {"hook":"","script":"","scenes":"","cta":"","hashtags":""}` }
      ],
      temperature:0.8,
      response_format:{type:"json_object"}
    });

    const data = JSON.parse(completion.choices[0].message.content);
    res.json({success:true, data});
  }catch(e){
    console.error(e);
    res.status(500).json({success:false, message:e.message});
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', ()=> console.log("Lancé sur "+PORT));
