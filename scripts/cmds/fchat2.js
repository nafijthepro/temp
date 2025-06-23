const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fakechat2",
    aliases: ["fchat2"],
    version: "1.1",
    role: 2,
    author: "NAFIJ",
    description: "Create a fake Messenger-style chat image with themes",
    category: "owner",
    countDown: 10,
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {
      let theme = "default";
      let text = args.join(" ");

      if (args[0] && args[0].toLowerCase() === "theme1") {
        theme = "theme1";
        text = args.slice(1).join(" ");
      } else if (args[0] && args[0].toLowerCase() === "theme2") {
        theme = "theme2";
        text = args.slice(1).join(" ");
      }

      if (!text && event.type === "message_reply" && event.messageReply) {
        text = event.messageReply.body || "Kire tui koi geli?";
      }

      if (!text && event.mentions && Object.keys(event.mentions).length > 0) {
        text = event.body.replace(/@[0-9]+/g, "").trim() || "Kire tui koi geli?";
      }

      if (!text) {
        text = "Kire tui koi geli?";
      }

      const uid = Object.keys(event.mentions)[0] || (event.type === "message_reply" ? event.messageReply.senderID : event.senderID);
      const userName = await usersData.getName(uid);
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=256&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarBuffer = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
      const avatar = await loadImage(avatarBuffer);

      let bgImage = null;
      if (theme === "theme1") {
        const bgData = (await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/lofi.jpeg", { responseType: "arraybuffer" })).data;
        bgImage = await loadImage(bgData);
      } else if (theme === "theme2") {
        const bgData = (await axios.get("https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/love.jpeg", { responseType: "arraybuffer" })).data;
        bgImage = await loadImage(bgData);
      }

      const width = 800;
      const maxTextWidth = 500;
      const lineHeight = 28;

      const canvasTemp = createCanvas(1, 1);
      const ctxTemp = canvasTemp.getContext("2d");
      ctxTemp.font = "20px Arial";

      function wrapText(text, maxWidth) {
        const words = text.split(" ");
        let lines = [];
        let line = "";

        for (let word of words) {
          let testLine = line + word + " ";
          let width = ctxTemp.measureText(testLine).width;
          if (width > maxWidth && line !== "") {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());
        return lines;
      }

      const textLines = wrapText(text, maxTextWidth);
      const height = Math.max(150, 100 + textLines.length * lineHeight);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(60, 60, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 20, 20, 80, 80);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Arial";
      ctx.fillText(userName, 120, 55);

      const bubbleX = 120;
      const bubbleY = 80;
      const bubbleWidth = maxTextWidth + 30;
      const bubbleHeight = textLines.length * lineHeight + 20;

      ctx.fillStyle = (theme === "default") ? "#e0e0e0" : "#ffffff";
      roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "20px Arial";
      for (let i = 0; i < textLines.length; i++) {
        ctx.fillText(textLines[i], bubbleX + 15, bubbleY + 28 + i * lineHeight);
      }

      const buffer = canvas.toBuffer();
      const imgPath = path.join(__dirname, "fakechat2.png");
      fs.writeFileSync(imgPath, buffer);

      message.reply({
        body: `Here is your fakechat with${theme === "default" ? " default style 🖤" : theme === "theme1" ? " lofi 🎧" : " love ❤️"} background:`,
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.log("Fakechat2 Error:", err);
      message.reply("Kisu ekta vul hoise. Try again!");
    }
  }
};

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
