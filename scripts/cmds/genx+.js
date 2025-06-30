const axios = require('axios');
const { getStreamFromURL } = global.utils;
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "genx+",
    version: "1.0",
    author: "GEMINI_PRO",
    countDown: 20,
    longDescription: {
      en: "__"
    },
    category: "ai",
    role: 0,
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply("⚠ Please provide a prompt to generate the image.");

    api.setMessageReaction("🎨", event.messageID, () => {}, true);
    message.reply("genx+ is working", async () => {
      try {
        const apiUrl = `http://65.109.80.126:20511/api/flux1-dev?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        const images = response?.data?.images;
        if (!response?.data?.status || !Array.isArray(images) || images.length !== 4)
          return message.reply("❌ Could not generate images. Try again later.");

        // Extract image URLs from the new API response format
        const imageLinks = images.map(img => img.data[0]?.url);
        const imageObjs = await Promise.all(imageLinks.map(url => loadImage(url)));

        // Create the canvas and save the image
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageObjs[0], 0, 0, 512, 512);
        ctx.drawImage(imageObjs[1], 512, 0, 512, 512);
        ctx.drawImage(imageObjs[2], 0, 512, 512, 512);
        ctx.drawImage(imageObjs[3], 512, 512, 512, 512);

        const cacheDir = path.join(__dirname, 'cache');
        fs.mkdirSync(cacheDir, { recursive: true });

        const fileName = `genx+_${event.senderID}_${Date.now()}.png`;
        const outputPath = path.join(cacheDir, fileName);

        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", async () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          message.reply({
            body: `✨ Result for genx+:* "${prompt}"\n\n🖼 Reply with image`,
            attachment: fs.createReadStream(outputPath)
          }, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: event.senderID,
                images: imageLinks
              });
            }
          });
        });

      } catch (error) {
        console.error(error);
        api.setMessageReaction("", event.messageID, () => {}, true);
        message.reply("⚠ Error while generating image.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, images } = Reply;
    if (event.senderID !== author)
      return message.reply(" Only the original user can select an image.");

    const input = event.body.trim().toUpperCase();
    const match = input.match(/^U([1-4])$/);
    if (!match) return message.reply("Invalid input. Use: U1, U2, U3 or U4");

    const index = parseInt(match[1]) - 1;
    const selectedImage = images[index];

    try {
      const imageStream = await getStreamFromURL(selectedImage, `flux1dev_U${index + 1}.jpg`);
      message.reply({
        body: `✅here is image (U${index + 1}) is ready.`,
        attachment: imageStream
      });
    } catch (error) {
      console.error(error);
      message.reply("sorry🥲");
    }
  }
};
