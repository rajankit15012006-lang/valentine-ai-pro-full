import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

/* =========================
   Upload config
========================= */
const upload = multer({ dest: "uploads/" });

/* =========================
   OpenAI
========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   Health check (IMPORTANT)
========================= */
app.get("/", (req, res) => {
  res.send("❤️ Valentine AI backend running!");
});

/* =========================
   Main API
========================= */
app.post("/valentine", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }
    const name = req.body.name || "My Valentine";

    const imageBytes = fs.readFileSync(req.file.path);
    const base64Image = imageBytes.toString("base64");
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Create a romantic valentine poster.Keep the face realistic.Add glowing hearts and roses.Add text "${name} ❤️ Me".Soft pink dreamy lighting.`,
      image: base64Image,
      size: "1024x1024"
    });
    const generated = result.data[0].b64_json;
    res.json({ image: generated });
  

    


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   Start server
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
