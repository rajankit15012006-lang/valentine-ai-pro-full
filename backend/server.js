import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".png");  // ✅ FORCE PNG EXTENSION
  }
});

const upload = multer({ storage });


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend running ❤️");
});

app.post("/valentine", upload.single("photo"), async (req, res) => {
  try {
    const name = req.body.name || "My Valentine";

    const originalPath = req.file.path;
    const pngPath = originalPath + ".png";

    // Convert to real PNG
    await sharp(originalPath)
      .png()
      .toFile(pngPath);

    const result = await openai.images.edit({
      model: "dall-e-2",
      image: fs.createReadStream(pngPath),
      prompt: `Create a romantic valentine poster.
      Keep face realistic.
      Add text "${name} ❤️ Me".`,
      size: "1024x1024"
    });

    const base64 = result.data[0].b64_json;

    // Cleanup files
    fs.unlinkSync(originalPath);
    fs.unlinkSync(pngPath);

    res.json({ image: base64 });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

