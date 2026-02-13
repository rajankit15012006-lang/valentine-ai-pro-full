import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend running ❤️");
});

app.post("/valentine", upload.single("photo"), async (req, res) => {
  try {
    const name = req.body.name || "My Valentine";

    const result = await openai.images.edit({
      model: "dall-e-2",
      image: fs.createReadStream(req.file.path),
      prompt: `Create a romantic valentine poster.
      Keep face realistic.
      Add text "${name} ❤️ Me".`,
      size: "1024x1024"
    });

    const base64 = result.data[0].b64_json;

    fs.unlinkSync(req.file.path);

    res.json({ image: base64 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

