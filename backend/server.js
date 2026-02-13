import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/valentine", upload.single("photo"), async (req, res) => {
  try {
    const name = req.body.name || "My Valentine";

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Create a cute romantic valentine poster with hearts, roses, soft pink lighting. Add text saying "${name} ❤️ Me". Dreamy glow, Instagram aesthetic.`,
      image: fs.readFileSync(req.file.path),
      size: "1024x1024"
    });

    const base64 = result.data[0].b64_json;

    res.json({ image: base64 });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => 
  console.log(`Backend running on port ${PORT}`)
);