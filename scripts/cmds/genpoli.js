const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "genpoli",
    version: "1.0",
    permission: 0,
    credits: "NAFIJ",
    description: "Generate anime image using Pollinations",
    cooldowns: 5,
    prefix: "!",
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Please provide a prompt.", event.threadID, event.messageID);

    const tmpPath = path.join(__dirname, "cache", `genpoli_${Date.now()}.jpg`);

    try {
      const response = await axios.post(
        "https://nafijprogenx.up.railway.app/anime2",
        { prompt, key: "nafij" },
        { responseType: "arraybuffer" }
      );

      await fs.ensureDir(path.join(__dirname, "cache"));
      await fs.writeFile(tmpPath, Buffer.from(response.data, "binary"));

      await api.sendMessage(
        {
          body: `🖼️ Prompt: ${prompt}`,
          attachment: fs.createReadStream(tmpPath),
        },
        event.threadID,
        () => fs.unlinkSync(tmpPath),
        event.messageID
      );
    } catch (error) {
      console.error("❌ Genpoli error:", error.message);
      api.sendMessage(`❌ Failed to generate image:\n${error.message || "❌ Unknown error occurred."}`, event.threadID, event.messageID);
    }
  },
};
