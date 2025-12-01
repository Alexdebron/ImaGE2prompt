import axios from "axios";

export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" }
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const { imageUrl, language = "en", model = "general" } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Image URL is required." });

    // Download image
    const imgResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(imgResp.data, "binary");

    // Validate
    const conf = {
      language: ['en','es','zh','zh-TW','fr','de','ja','ru','pt','ar','ko','it','nl','tr','pl','vi','th','hi','id'],
      model: ['general','midjourney','dalle','stable_diffusion','flux']
    };
    if (!conf.language.includes(language)) throw new Error(`Available languages: ${conf.language.join(', ')}`);
    if (!conf.model.includes(model)) throw new Error(`Available models: ${conf.model.join(', ')}`);

    // Call image prompt API
    const { data } = await axios.post(
      'https://api.imagepromptguru.net/image-to-prompt',
      {
        image: 'data:image/jpeg;base64,' + buffer.toString('base64'),
        language,
        model
      },
      {
        headers: {
          origin: 'https://imagepromptguru.net',
          referer: 'https://imagepromptguru.net/',
          'user-agent': 'Mozilla/5.0'
        }
      }
    );

    res.status(200).json({
      creator: "Chamod Nimsara",
      status: true,
      prompt: data.prompt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
