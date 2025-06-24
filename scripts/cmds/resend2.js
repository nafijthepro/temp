module.exports = {
  config: {
    name: "resend",
    version: "5.0",
    author: "PRO NAFIJ ✅",
    countDown: 1,
    role: 0,
    shortDescription: {
      en: "Enable/Disable Anti unsend mode"
    },
    longDescription: {
      en: "Anti unsend mode. Works with audio, video, images, and text."
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

    // Ensure setting is present
    let isEnabled = await threadsData.get(event.threadID, "settings.reSend");
    if (typeof isEnabled === "undefined") {
      isEnabled = true;
      await threadsData.set(event.threadID, true, "settings.reSend");
    }

    if (!isEnabled) return;

    // Initialize cache
    if (!global.reSend) global.reSend = {};
    if (!global.reSend[event.threadID]) global.reSend[event.threadID] = [];

    if (event.type === "message") {
      // Save message to cache
      global.reSend[event.threadID].push(event);

      // Keep only last 100
      if (global.reSend[event.threadID].length > 9999999999999999)
        global.reSend[event.threadID].shift();
    }

    if (event.type === "message_unsend") {
      const cached = global.reSend[event.threadID];
      const original = cached?.find(msg => msg.messageID === event.messageID);
      if (!original) return;

      const userName = await usersData.getName(original.senderID) || "Unknown user";

      const unsendTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

      let msg = `🚨 Anti Unsend Alert 🚨\n\n` +
        `👥 Group: ${event.threadID}\n` +
        `👤 User: ${userName}\n` +
        `🕒 Time: ${unsendTime}`;

      if (original.body) msg += `\n💬 Message: ${original.body}`;
      else if (original.attachments?.length)
        msg += `\n📎 Attachment(s): ${original.attachments.length}`;
      else msg += `\n💨 Message contained no text.`;

      // Forward alert to notify group
      return api.sendMessage(msg, notifyThreadID);
    }
  }
};
