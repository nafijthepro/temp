const axios = require("axios");
const fs = require("fs");
const path = require("path");

const modelMap = {
  1: "anime-v1",
  2: "stable-diffusion-v1-6",
  3: "dreamshaper-8",
  4: "realistic-vision-v5",
  5: "openjourney-v4"
};

module.exports = {
  config: {
    name: "genxpro",
    version: "2.1",
    author: "NAFIJ PRO ✅",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Generate image with model choice" },
    longDescription: { en: "Use different image models like anime, photo, concept art etc" },
    category: "image",
    guide: {
      en: `{pn} <modelNumber?> <prompt>\n\n1: anime-v1 (default)\n2: sd-v1-6\n3: dreamshaper\n4: realistic-vision\n5: openjourney\n\nExamples:\n{pn} a girl with wings\n{pn} 3 cyberpunk cat`
    }
  },

  onStart: async function ({ api, event, args }) {
    let modelNum = parseInt(args[0]);
    let prompt = "";

    if (modelMap[modelNum]) {
      prompt = args.slice(1).join(" ");
    } else {
      modelNum = 1; // default to anime-v1
      prompt = args.join(" ");
    }

    const model = modelMap[modelNum];

    if (!prompt)
      return api.sendMessage(
        `📸 | Use like:\ngenx <modelNumber?> <prompt>\nExample: genx 1 anime girl with red eyes\n\nAvailable Models:\n${Object.entries(modelMap).map(([k, v]) => `${k}. ${v}`).join("\n")}`,
        event.threadID,
        event.messageID
      );

    const loading = await api.sendMessage(`🧠 Generating image with "${model}" model...`, event.threadID);

    try {
      const response = await axios.post(
        "https://nafijprogenx.up.railway.app/anime",
        {
          prompt,
          key: ["na", "fij"].join(""),
          model,
          seed: "nafijpro"
        },
        { responseType: "arraybuffer" }
      );

      const imagePath = path.join(__dirname, "cache", `${event.senderID}_genx.jpg`);
      fs.writeFileSync(imagePath, Buffer.from(response.data, "binary"));

      api.sendMessage({
        body: `✅ | Model: ${model}\n🎯 Prompt: "${prompt}"`,
        attachment: fs.createReadStream(imagePath)
      }, event.threadID, () => fs.unlinkSync(imagePath), loading.messageID);

    } catch (err) {
      console.error("❌ genx error:", err.response?.data || err.message);
      api.sendMessage("❌ | Failed to generate image. Try later or check your API/backend.", event.threadID, loading.messageID);
    }
  }
};
