const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "latthi",
    version: "2.2.1",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "🤣 Kick someone with latthi power!",
    longDescription: "Mention 2 users (1 kicker + 1 kicked). Do not reply to a message!",
    category: "fun",
    guide: {
      en: "{pn} mention exactly 2 users. Don't reply to any message.",
    },
  },

  onStart: async function ({ event, message, api }) {
    const mentionedIDs = Object.keys(event.mentions);
    const isReply = event.type === "message_reply";

    if (isReply) {
      return message.reply("❌ Don't reply to any message. Just mention 2 users.");
    }

    if (mentionedIDs.length !== 2) {
      return message.reply("❌ Please mention exactly 2 users (1 kicker and 1 who gets kicked).");
    }

    const womanID = mentionedIDs[0]; // kicker
    const manID = mentionedIDs[1];   // kicked

    const baseFolder = path.join(__dirname, "Arijit_latthi");
    if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

    const bgPath = path.join(baseFolder, "latthi_bg.jpg");
    const womanAvatarPath = path.join(baseFolder, `woman_${womanID}.png`);
    const manAvatarPath = path.join(baseFolder, `man_${manID}.png`);
    const outputPath = path.join(baseFolder, `latthi_result_${Date.now()}.png`);

    try {
      // Download background image once
      const latthiImageURL = "https://files.catbox.moe/iabe3d.jpg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(latthiImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      const getAvatar = async (uid, outputPath) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(outputPath, res.data);
      };

      await getAvatar(womanID, womanAvatarPath);
      await getAvatar(manID, manAvatarPath);

      const bg = await jimp.read(bgPath);
      const womanAvatar = await jimp.read(womanAvatarPath);
      const manAvatar = await jimp.read(manAvatarPath);

      womanAvatar.resize(110, 110).circle();
      manAvatar.resize(100, 100).circle();

      // Position tuning
      const womanX = 120, womanY = 30;
      const manX = 410, manY = 180;

      bg.composite(womanAvatar, womanX, womanY);
      bg.composite(manAvatar, manX, manY);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo([womanID, manID]);
      const womanName = userInfo[womanID]?.name || "She";
      const manName = userInfo[manID]?.name || "He";

      await message.reply({
        body: `🤣 ${womanName} gave a LATTHI to ${manName}! Full power 💥`,
        mentions: [
          { tag: womanName, id: womanID },
          { tag: manName, id: manID }
        ],
        attachment: fs.createReadStream(outputPath),
      });

      // Clean temporary files
      fs.unlinkSync(womanAvatarPath);
      fs.unlinkSync(manAvatarPath);
      fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("❌ LATTHI CMD ERROR:", err);
      return message.reply("❌ Couldn't deliver the latthi! Please try again later.");
    }
  },
};
