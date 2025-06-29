const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "chicken",
    version: "1.0.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Turn someone into a chicken 🐔",
    longDescription: "Overlays user's avatar on a chicken body image",
    category: "fun",
    guide: {
      en: "{pn} reply to someone's message to turn them into a chicken",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = event.type === "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions)[0];

    if (!targetID) return message.reply("🐔 Reply to someone's message to make them a chicken!");

    const baseFolder = path.join(__dirname, "Arijit_chicken");
    const bgPath = path.join(baseFolder, "chicken_bg.jpg");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `chicken_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      const chickenImageURL = "https://files.catbox.moe/ng1j7c.jpg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(chickenImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(avatarPath, avatarBuffer);

      const bg = await jimp.read(bgPath);
      const avatar = await jimp.read(avatarPath);

      // Resize and make circular avatar
      avatar.resize(90, 90).circle();

      // Adjust avatar position (update x/y as per chicken head)
      const x = 130;
      const y = 60;

      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `😂 ${name} has turned into a chicken! 🐔`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐔 Chicken command error:", err);
      return message.reply("❌ Failed to create chicken image.");
    }
  }
};
