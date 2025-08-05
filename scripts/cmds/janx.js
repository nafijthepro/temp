const { getTime } = global.utils;

module.exports = {
  config: {
    name: "janx",
    version: "1.1",
    author: "NAFIJ",
    countDown: 5,
    role: 0,
    description: "--",
    category: "system"
  },

  onStart: async function ({ args, event, usersData, message, prefix }) {
    const { senderID, messageReply, mentions } = event;

    // Only allow NAFIJ or ADMINBOT
    const isAllowed = senderID === "100058371606434" || (global.GoatBot.config.ADMINBOT || []).includes(senderID);
    if (!isAllowed) return;

    const sub = args[0];
    const allUsers = await usersData.getAll();

    // Get target UIDs
    const getIDs = () => {
      const uids = [];
      if (messageReply) uids.push(messageReply.senderID);
      else if (Object.keys(mentions).length) {
        uids.push(...Object.keys(mentions));
      } else if (args.length > 1) {
        for (let i = 1; i < args.length; i++) {
          if (!isNaN(args[i])) uids.push(args[i]);
        }
      }
      return [...new Set(uids)];
    };

    // View ban list
    if (sub === "ban" && args[1] === "list") {
      const banned = allUsers.filter(u => u.banned?.status);
      if (!banned.length) return message.reply("😇 কেউই এখন ban নয়!");

      const msg = banned.map((u, i) =>
        `${i + 1}. ${u.name || "Unknown"}\nUID: ${u.userID}\nReason: ${u.banned.reason || "N/A"}\n⏰ ${u.banned.date}`
      ).join("\n\n");

      const sent = await message.reply(`🔒 Total Banned: ${banned.length}\n\n${msg}`);
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "janx",
        author: senderID,
        bannedList: banned
      });
      return;
    }

    // Status check
    if (sub === "status") {
      const user = await usersData.get(senderID);
      if (user?.banned?.status) {
        const expire = user.banned.expires;
        let left = "";
        if (expire) {
          const remaining = expire - Date.now();
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remaining % (1000 * 60)) / 1000);
          left = ` (⏳ ${h}h ${m}m ${s}s left)`;
        }
        return message.reply(`⛔ আপনি বর্তমানে ban খেয়েছেন!\nReason: ${user.banned.reason || "N/A"}${left}`);
      } else return message.reply("✅ আপনি পুরোপুরি safe zone-এ আছেন!");
    }

    // Unban
    if (sub === "unban") {
      const uids = getIDs();
      if (!uids.length) return message.reply("⚠️ কাকে unban করবো?");
      let done = [];
      for (const uid of uids) {
        const u = await usersData.get(uid);
        if (!u?.banned?.status) continue;
        await usersData.set(uid, { banned: {} });
        done.push(u.name || uid);
      }
      if (!done.length) return message.reply("😄 কেউই ban ছিল না!");
      return message.reply(`✅ Unbanned: ${done.join(", ")}`);
    }

    // Ban / Temp ban
    if (sub === "ban") {
      const isTemp = args[1] === "temp";
      let time, reason, uids;

      if (isTemp) {
        time = parseInt(args[2]);
        if (isNaN(time)) return message.reply("⏰ কত ঘণ্টা ban রাখতে চান?");
        uids = getIDs();
        reason = args.slice(3).join(" ") || "No reason";
      } else {
        uids = getIDs();
        reason = args.slice(1).join(" ").replace(/@\S+/g, "") || "No reason";
      }

      if (!uids.length) return message.reply("⚠️ কাকে ban করবো?");
      let banned = [];
      for (const uid of uids) {
        const user = await usersData.get(uid);
        const isBotAdmin = global.GoatBot.config.ADMINBOT?.includes(uid);
        if (isBotAdmin) continue;

        const banData = {
          banned: {
            status: true,
            reason: reason.trim(),
            date: getTime("DD/MM/YYYY HH:mm:ss")
          }
        };
        if (isTemp) {
          banData.banned.expires = Date.now() + time * 60 * 60 * 1000;
        }

        await usersData.set(uid, banData);
        banned.push(user.name || uid);
      }

      if (!banned.length) return message.reply("😓 কাউকে ban করা যায়নি।");
      return message.reply(`🔒 Banned: ${banned.join(", ")}\n📄 Reason: ${reason.trim()}`);
    }

    return message.SyntaxError();
  },

  onReply: async function ({ event, message, usersData, Reply }) {
    if (event.senderID !== Reply.author) return;

    const args = event.body.split(/\s+/);
    if (args[0] !== "unban") return;

    const indexes = args.slice(1).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
    if (!indexes.length) return message.reply("⚠️ Valid serial number দিন!");

    const targets = indexes.map(i => Reply.bannedList[i - 1]?.userID).filter(Boolean);
    if (!targets.length) return message.reply("❌ কোনও valid user পাওয়া যায়নি।");

    let done = [];
    for (const uid of targets) {
      const u = await usersData.get(uid);
      if (u?.banned?.status) {
        await usersData.set(uid, { banned: {} });
        done.push(u.name || uid);
      }
    }

    if (!done.length) return message.reply("😄 কেউই ban ছিল না!");
    return message.reply(`✅ Unbanned from list: ${done.join(", ")}`);
  },

  onChat: async function ({ event, usersData }) {
    const user = await usersData.get(event.senderID);
    if (!user?.banned?.status) return;

    if (user.banned.expires && Date.now() > user.banned.expires) {
      await usersData.set(event.senderID, { banned: {} });
      return;
    }

    event.stop = true;
  }
};
