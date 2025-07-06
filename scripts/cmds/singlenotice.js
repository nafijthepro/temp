const fs = require("fs-extra");
const path = require("path");
const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "singlenoti",
    version: "6.0",
    author: "NAFIJ_PRO",
    role: 2,
    shortDescription: "Send notice to specific group",
    longDescription: "Send notification to a specific group with visual formatting and optional attachments",
    category: "owner",
    guide: {
      en: "{pn} <target_tid> <message>"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    const targetTID = args[0];
    const msgContent = args.slice(1).join(" ");
    if (!targetTID || !msgContent) return message.reply("📌 Usage: .singlenoti <group_tid> <message>");

    const senderID = event.senderID;
    const senderName = await usersData.getName(senderID);
    const groupName = (await api.getThreadInfo(targetTID)).threadName || "Unnamed Group";

    const visualMessage = `🟦 𝗡𝗼𝘁𝗶𝗰𝗲 :
━━━━━━━━━━━━━━
📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲:
『 ${msgContent} 』

👤 𝗦𝗲𝗻𝘁 𝗕𝘆: ${senderName}
━━━━━━━━━━━━━━`;

    const attachments = await getStreamsFromAttachment(
      [
        ...event.attachments,
        ...(event.messageReply?.attachments || [])
      ].filter(item =>
        ["photo", "video", "audio", "animated_image"].includes(item.type)
      )
    );

    try {
      await api.sendMessage({
        body: visualMessage,
        attachment: attachments
      }, targetTID);

      return message.reply(`✅ Message sent to: ${groupName} (${targetTID})`);
    } catch (err) {
      console.error("❌ Send error:", err);
      return message.reply("❌ Failed to send notice.");
    }
  }
};
