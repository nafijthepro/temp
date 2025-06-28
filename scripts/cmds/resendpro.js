const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "resendpro",
    version: "5.0",
    author: "PRO NAFIJ ✅",
    countDown: 1,
    coolDowns: 0,
    role: 0,
    shortDescription: {
      en: "Enable/Disable Anti unsend mode"
    },
    longDescription: {
      en: "Anti unsend mode. Works with audio, video, images, stickers, and text."
    },
    category: "Admins",
    guide: {
      en: "{pn} on or off\nex: {pn} on"
    }
  },

  onStart: async function({ threadsData, event, args, message }) {
    const ownerUID = "100058371606434";
    if (event.senderID !== ownerUID)
      return message.reply("❌ You are not authorized to use this command.");

    const input = args[0]?.toLowerCase();
    if (!input || !["on", "off"].includes(input)) {
      return message.reply("Please specify `on` or `off` to enable or disable Anti Unsend mode.");
    }

    const isEnable = input === "on";
    await threadsData.set(event.threadID, isEnable, "settings.reSend");
    return message.reply(isEnable
      ? "✅ Anti unsend is now enabled for this group."
      : "❌ Anti unsend is now disabled for this group.");
  },

  onChat: async function({ api, event, threadsData, usersData }) {
    const notifyThreadID = "9856539844435742";

    let isEnabled = await threadsData.get(event.threadID, "settings.reSend");
    if (typeof isEnabled === "undefined") {
      isEnabled = true;
      await threadsData.set(event.threadID, true, "settings.reSend");
    }

    if (!isEnabled) return;

    if (!global.reSend) global.reSend = {};
    if (!global.reSend[event.threadID]) global.reSend[event.threadID] = [];

    if (event.type === "message") {
      global.reSend[event.threadID].push(event);
      if (global.reSend[event.threadID].length > 99999999999999999999999)
        global.reSend[event.threadID].shift();
    }

    if (event.type === "message_unsend") {
      const cached = global.reSend[event.threadID];
      const original = cached?.find(msg => msg.messageID === event.messageID);
      if (!original) return;

      const userName = await usersData.getName(original.senderID) || "Unknown user";
      const unsendTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      let msg = `🚨 Anti Unsend Alert By ResendPro🚨\n\n` +
        `👤 User: ${userName}\n` +
        `🆔 UID: ${original.senderID}\n` +
        `🕒 Time: ${unsendTime}`;

      const attachments = [];

      if (original.body) msg += `\n💬 Message: ${original.body}`;

      if (original.attachments?.length) {
        for (let i = 0; i < original.attachments.length; i++) {
          const item = original.attachments[i];
          const extMap = {
            photo: "jpg",
            video: "mp4",
            audio: "mp3",
            sticker: "png"
          };
          const ext = extMap[item.type] || "bin";
          const filename = `unsend_${Date.now()}_${i}.${ext}`;
          const filepath = path.join(__dirname, "cache", filename);

          const stream = fs.createWriteStream(filepath);
          const res = await axios({
            method: "GET",
            url: item.url,
            responseType: "stream"
          });

          await new Promise((resolve, reject) => {
            res.data.pipe(stream);
            res.data.on("end", resolve);
            res.data.on("error", reject);
          });

          attachments.push(fs.createReadStream(filepath));
        }

        msg += `\n📎 Attachments: ${original.attachments.length}`;
      }

      return api.sendMessage({ body: msg, attachment: attachments }, notifyThreadID);
    }
  }
};
