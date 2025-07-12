module.exports = {
  config: {
    name: "r",
    version: "1.6",
    author: "♛ N A F I J ♛",
    role: 2,
    category: "pro",
    shortDescription: { en: "Remove user immediately (admin only)" },
    longDescription: { en: "Find and remove a user directly if only one found. Only GoatBot admins can use." },
    guide: { 
      en: "r <name> or reply to user and type r\n\nFor more info, visit my Facebook: https://www.facebook.com/nafijrahaman2023" 
    }
  },

  onStart: async function ({ event, api, args, role }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const input = args.join(" ").toLowerCase().trim();
    const threadInfo = await api.getThreadInfo(threadID);

    const botAdmin = threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID());

    if (role < 2) {
      return api.sendMessage("❌ | Only GoatBot admins can use this command.", threadID, messageID);
    }

    if (!botAdmin) {
      return api.sendMessage("⚠ | I need to be admin to remove someone.", threadID, messageID);
    }

    let targetUsers = [];

    if (messageReply) {
      // Find name from threadInfo userInfo
      const repliedUser = threadInfo.userInfo.find(u => u.id == messageReply.senderID);
      const name = repliedUser ? repliedUser.name : "Unknown Name";
      targetUsers.push({ id: messageReply.senderID, name });
    } else if (input.length > 0) {
      for (const user of threadInfo.userInfo) {
        if (user.name && user.name.toLowerCase().includes(input)) {
          targetUsers.push({ id: user.id, name: user.name });
        }
      }
    } else {
      return api.sendMessage("⚠ | Please reply to a message or provide a name.", threadID, messageID);
    }

    if (targetUsers.length === 0) {
      return api.sendMessage("❌ | Target not found!", threadID, messageID);
    }

    await api.sendMessage("🔍 | Searching target...", threadID, async (err, info) => {
      setTimeout(async () => {
        if (targetUsers.length === 1) {
          const user = targetUsers[0];
          try {
            await api.removeUserFromGroup(user.id, threadID);
            api.sendMessage(`✅ | User removed successfully:\n🔰 ${user.id}\n${user.name}`, threadID);
          } catch (e) {
            api.sendMessage("❌ | Failed to remove user.", threadID);
          }
        } else {
          let text = "🎯 | Multiple targets found:\n";
          for (let i = 0; i < targetUsers.length; i++) {
            text += `${i + 1}. ${targetUsers[i].name} (https://www.facebook.com/${targetUsers[i].id})\n`;
          }
          text += "\nReply with the number you want to remove.";
          api.sendMessage(text, threadID, (e, infoMulti) => {
            global.GoatBot.onReply.set(infoMulti.messageID, {
              commandName: "r",
              type: "select",
              list: targetUsers
            });
          });
        }
      }, 1000);
    });
  },

  onReply: async function ({ event, api, Reply, role }) {
    const { threadID, messageID, body, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);

    const botAdmin = threadInfo.adminIDs.some(e => e.id == api.getCurrentUserID());

    if (role < 2) return api.sendMessage("❌ | Only GoatBot admins can confirm removal.", threadID, messageID);
    if (!botAdmin) return api.sendMessage("⚠ | I am not admin, can't remove.", threadID, messageID);

    if (Reply.type === "confirm") {
      const yesAnswers = ["yes", "Yes", "YES", "y", "Y"];
      if (yesAnswers.includes(body.trim())) {
        try {
          await api.removeUserFromGroup(Reply.targetID, threadID);
          api.sendMessage(`✅ | User removed successfully:\n🔰 ${Reply.targetID}`, threadID);
        } catch (e) {
          api.sendMessage("❌ | Failed to remove user.", threadID);
        }
      } else {
        api.sendMessage("❌ | Removal cancelled.", threadID);
      }
    }

    if (Reply.type === "select") {
      const index = parseInt(body) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.list.length) {
        return api.sendMessage("⚠ | Invalid number selected.", threadID, messageID);
      }
      const selected = Reply.list[index];
      api.sendMessage({
        body: `🎯 | Target Found:\n🔰 ${selected.id}\n${selected.name}\n\nDo you want to remove?\n\nType 'yes', 'YES', 'y', or 'Y' to confirm removal, or 'no' to cancel.`,
        mentions: [{ tag: selected.name, id: selected.id }]
      }, threadID, (e, infoConfirm) => {
        global.GoatBot.onReply.set(infoConfirm.messageID, {
          commandName: "r",
          type: "confirm",
          targetID: selected.id
        });
      });
    }
  }
};
