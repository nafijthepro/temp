const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "resend2",
    version: "5.0",
    author: "PRO NAFIJ ✅",
    countDown: 1,
    role: 2,
    shortDescription: {
      en: "Enable/Disable Anti unsend mode"
    },
    longDescription: {
      en: "Anti unsend mode. Resends all unsent messages (text, image, video, audio, file)."
    },
    category: "Admins",
    guide: {
      en: "{pn} on or off\nExample: {pn} on"
    }
  },

  onStart: async function ({ threadsData, event, args, message }) {
    const input = args[0]?.toLowerCase();
    if (!["on", "off"].includes(input)) {
      return message.reply("Please specify `on` or `off` to enable or disable Anti Unsend mode.");
    }
    const status = input === "on";
    await threadsData.set(event.threadID, status, "settings.reSend");
    return message.reply(status ? "✅ Anti unsend is now enabled." : "❌ Anti unsend is now disabled.");
  },

  onChat: async function ({ api, event, threadsData, usersData }) {
    const threadID = event.threadID;

    // Ensure default enabled
    let isEnabled = await threadsData.get(threadID, "settings.reSend");
    if (typeof isEnabled === "undefined") {
      await threadsData.set(threadID, true, "settings.reSend");
      isEnabled = true;
    }
    if (!isEnabled) return;

    // Store messages in memory
    if (!global.reSend) global.reSend = {};
    if (!global.reSend[threadID]) global.reSend[threadID] = [];

    if (event.type === "message") {
      global.reSend[threadID].push(event);
      if (global.reSend[threadID].length > 100) {
        global.reSend[threadID].shift(); // keep max 100
      }
    }

    // Handle message_unsend
    if (event.type === "message_unsend") {
      const cache = global.reSend[threadID];
      const oldMessage = cache?.find(msg => msg.messageID === event.messageID);
      if (!oldMessage) return;

      const userName = await usersData.getName(oldMessage.senderID) || "Unknown";
      const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      let body = `🚫 [ANTI-UNSEND ALERT] 🚫\n👤 ${userName} just unsent a message!\n🕐 Time: ${time}`;

      const msg = { body };

      if (oldMessage.body) {
        msg.body += `\n💬 Message: ${oldMessage.body}`;
      }

      if (oldMessage.attachments?.length) {
        const attachments = [];
        for (const item of oldMessage.attachments) {
          try {
            const res = await axios.get(item.url, { responseType: "stream" });
            attachments.push(res.data);
          } catch (err) {
            console.error("Failed to load attachment:", err);
          }
        }
        if (attachments.length > 0) msg.attachment = attachments;
      }

      return api.sendMessage(msg, threadID);
    }
  }
};
