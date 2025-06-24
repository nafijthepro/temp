module.exports = {
  config: {
    name: "uid2",
    version: "1.0.0",
    permission: 0,
    credits: "XNIL + HHGLY",
    prefix: 'awto',
    description: "Get UID and profile link",
    category: "tools",
    cooldowns: 3
  },

  onStart: async function({ api, event, usersData }) {
    let uid;

    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else {
      uid = event.senderID;
    }

    try {
      const name = await usersData.getName(uid);
      const profileLink = `https://facebook.com/${uid}`;

      const msg = `👤 𝗡𝗮𝗺𝗲: ${name}\n🆔 𝗨𝗜𝗗: ${uid}\n🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${profileLink}`;

      await api.sendMessage(msg, event.threadID, event.messageID);
    } catch (error) {
      console.error("❌ UID2 error:", error);
      await api.sendMessage("❌ Error: " + error.message, event.threadID, event.messageID);
    }
  }
};
