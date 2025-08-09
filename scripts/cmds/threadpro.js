const { getTime } = global.utils;

function isThreadBanned(threadData, senderID) {
  const infoBannedThread = threadData?.banned;
  if (infoBannedThread?.status === true) {
    if (!global.VIP_LIST.includes(senderID.toString())) {
      return true; // banned + non-VIP => block silently
    }
  }
  return false; // VIP or not banned => allow
}

module.exports = {
  config: {
    name: "threadpro",
    version: "1.1",
    author: "NAFIJ",
    countDown: 5,
    role: 0,
    description: "🔒 Ban/unban and list banned groups",
    category: "admin",
    guide: {
      en:
        "threadpro ban <reason> → Ban current group 🔒\n" +
        "threadpro ban <tid> <reason> → Ban group by ID 🔒\n" +
        "threadpro unban <index...> → Unban by list index ✅\n" +
        "threadpro list → Show banned groups 📋",
    },
  },

  onStart: async function ({ args, threadsData, message, event }) {
    // Permission check
    if (
      event.senderID !== "100058371606434" &&
      (!global.VIP_LIST || !global.VIP_LIST.includes(event.senderID.toString()))
    )
      return message.reply("heshh noob🌚🎀");

    const type = (args[0] || "").toLowerCase();
    const currentTID = event.threadID;

    const threadData = await threadsData.get(currentTID);

    // Ban check for the current thread
    const infoBannedThread = threadData?.banned;
    if (infoBannedThread?.status === true) {
      // Non-VIPs: silently block, no message
      if (!global.VIP_LIST.includes(event.senderID.toString())) {
        return;
      }
      // VIPs: show ban info + VIP note & stop further command processing
      return message.reply(
        `🔒 This group has been banned.\n` +
          `Reason: ${infoBannedThread.reason}\n` +
          `Time: ${infoBannedThread.date}\n\n` +
          `⚠️ But you're VIP, so you can still use the bot.`
      );
    }

    if (type === "ban") {
      let targetTID = currentTID;
      let reason = "";

      if (args[1] && /^\d+$/.test(args[1])) {
        targetTID = args[1];
        reason = args.slice(2).join(" ").trim();
      } else {
        reason = args.slice(1).join(" ").trim();
      }

      if (!reason) return message.reply("⚠️ Please provide a reason to ban the group.");

      const targetThreadData = await threadsData.get(targetTID);
      if (targetThreadData?.banned?.status) {
        return message.reply(
          `🔒 This group is already banned.\nReason: ${targetThreadData.banned.reason}\nDate: ${targetThreadData.banned.date}`
        );
      }

      const time = getTime("DD/MM/YYYY HH:mm:ss");
      await threadsData.set(targetTID, {
        banned: { status: true, reason, date: time },
      });

      return message.reply(
        targetTID === currentTID
          ? `🔒 This group has been banned.\nReason: ${reason}\nTime: ${time}`
          : `🔒 Group ${targetTID} has been banned.\nReason: ${reason}\nTime: ${time}`
      );
    }

    if (type === "unban") {
      const indexes = args
        .slice(1)
        .map((i) => parseInt(i, 10))
        .filter((n) => !isNaN(n));
      if (!indexes.length)
        return message.reply("⚠️ Please provide index(es) from the banned list to unban.");

      const allThreads = await threadsData.getAll();
      const bannedThreads = allThreads.filter((t) => t.banned?.status);

      if (!bannedThreads.length) return message.reply("✅ No banned groups found.");

      let results = [];
      for (const idx of indexes) {
        const thread = bannedThreads[idx - 1];
        if (thread) {
          await threadsData.set(thread.threadID, { banned: {} });
          results.push(`✅ Unbanned: ${thread.threadName || "Unknown"} (${thread.threadID})`);
        } else {
          results.push(`❌ No banned group found at index ${idx}`);
        }
      }

      return message.reply(results.join("\n"));
    }

    if (type === "list") {
      const allThreads = await threadsData.getAll();
      const bannedThreads = allThreads.filter((t) => t.banned?.status);

      if (!bannedThreads.length) return message.reply("📭 No banned groups found.");

      let msg = "📋 Banned Groups List:\n";
      bannedThreads.forEach((t, i) => {
        msg += `\n${i + 1}. ${t.threadName || "Unknown"} (${t.threadID})\n📝 Reason: ${t.banned.reason}\n⏰ Banned on: ${t.banned.date}\n`;
      });

      return message.reply(msg.trim());
    }

    return message.reply(
      "❓ Usage:\n" +
        "- threadpro ban <reason> 🔒 (ban current group)\n" +
        "- threadpro ban <tid> <reason> 🔒 (ban by group ID)\n" +
        "- threadpro unban <index...> ✅ (unban by list index)\n" +
        "- threadpro list 📋 (show banned groups)"
    );
  },
};
