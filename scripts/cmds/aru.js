module.exports = {
  config: {
    name: "aru",
    aliases: ["aj"],
    version: "1.1",
    author: "Nyx + Modified by NAFIJ",
    role: 0,
    shortDescription: "Edit a bot's message",
    longDescription: "Edit a bot's message by replying to it with 'edit <message>'. Only authorized users can use this.",
    category: "user",
    guide: {
      en: "{p}{n} <message>",
    },
  },

  onStart: async function ({ api, event, args }) {
    const authorizedUIDs = [
      "100058371606434",
      "100076392488331",
      "100069254151118",
      "1002"
    ];

    if (!authorizedUIDs.includes(event.senderID)) {
      return api.sendMessage("You are not authorized to use this command.", event.threadID, event.messageID);
    }

    const replyMessage = event.messageReply?.body;

    if (!replyMessage || !args || args.length === 0) {
      return api.sendMessage("Invalid input. Please reply to a bot message with your new message.", event.threadID, event.messageID);
    }

    const editedMessage = args.join(" ");

    try {
      await api.editMessage(editedMessage, event.messageReply.messageID);
    } catch (error) {
      console.error("Error editing message:", error);
      api.sendMessage("An error occurred while editing the message.", event.threadID);
    }
  },
};
