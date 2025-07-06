const fs = require("fs-extra");

module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["send", "send -m"],
    version: "2.2.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Send money to a user",
    longDescription: "Send money by replying to a message, mentioning user, or using UID",
    category: "economy",
    guide: "{pn} <amount> (as reply)\n{pn} @user <amount>\n{pn} <UID> <amount>"
  },

  onStart: async function ({ event, message, args, usersData }) {
    const senderID = event.senderID;
    let amount = null;
    let recipientID = null;

    // ✅ Case 1: REPLY to someone + just amount
    if (event.messageReply && args.length === 1 && !isNaN(args[0])) {
      amount = parseInt(args[0]);
      recipientID = event.messageReply.senderID;
    }

    // ✅ Case 2: Mention format
    else if (Object.keys(event.mentions).length > 0 && args.length >= 2) {
      recipientID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1]);
    }

    // ✅ Case 3: UID + amount
    else if (args.length >= 2 && /^\d{5,}$/.test(args[0]) && !isNaN(args[1])) {
      recipientID = args[0];
      amount = parseInt(args[1]);
    }

    // ❌ If nothing matched — show usage
    if (!recipientID || isNaN(amount)) {
      return message.reply("⚠ Usage:\n- send -m @user <amount>\n- send -m <UID> <amount>\n- send -m <amount> (as a reply)");
    }

    if (amount <= 0) return message.reply("⚠ Amount must be greater than 0.");
    if (recipientID === senderID) return message.reply("❌ You can’t send money to yourself.");

    const senderData = await usersData.get(senderID);
    const recipientData = await usersData.get(recipientID);
    const senderBalance = senderData.money || 0;

    if (senderBalance < amount) {
      return message.reply(`❌ You don’t have enough balance. Your balance: $${senderBalance}`);
    }

    // 💸 Transfer
    await usersData.set(senderID, { money: senderBalance - amount });
    await usersData.set(recipientID, { money: (recipientData.money || 0) + amount });

    // Format short currency
    function formatShort(n) {
      const suffixes = ["", "K", "M", "B", "T", "Q", "Q+", "S"];
      let tier = Math.floor(Math.log10(n) / 3);
      if (tier === 0) return n.toString();
      const suffix = suffixes[tier] || "";
      const scale = Math.pow(10, tier * 3);
      const scaled = n / scale;
      return scaled.toFixed(1).replace(/\.0$/, "") + suffix;
    }

    const shortAmount = formatShort(amount);
    const recipientName = recipientData.name || "User";

    return message.reply(
      `✅ | Successfully sent $${shortAmount} to ${recipientName}.`,
      [],
      {
        mentions: [{
          tag: `@${recipientName}`,
          id: recipientID
        }]
      }
    );
  }
};
