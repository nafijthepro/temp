const { getTime } = global.utils;

module.exports = {
  config: {
    name: "threadpro",
    version: "1.8",
    author: "NAFIJ_PRO (MODDED)",
    countDown: 5,
    role: 0,
    description: "🔒 Ban/unban and list banned groups",
    category: "admin",
    guide: {
      en:
        "threadpro ban <reason> → Ban current group 🔒\n" +
        "threadpro ban <tid> <reason> → Ban group by ID 🔒\n" +
        "threadpro unban [tid] → Unban by group ID or current group ✅\n" +
        "threadpro unban num <indexes...> → Unban by banned list indexes\n" +
        "threadpro list → Show banned groups 📋",
    },
  },

  onStart: async function ({ args, threadsData, message, event, api }) {
    // Permission check
    if (
      event.senderID !== "100058371606434" &&
      (!global.VIP_LIST || !global.VIP_LIST.includes(event.senderID.toString()))
    )
      return message.reply("heshh noob🌚🎀");

    const type = (args[0] || "").toLowerCase();
    const currentTID = event.threadID;

    const threadData = await threadsData.get(currentTID);
    const infoBannedThread = threadData?.banned;

    // VIP ban warning message, except for list/unban commands
    if (infoBannedThread?.status === true && type !== "list" && type !== "unban") {
      if (!global.VIP_LIST.includes(event.senderID.toString())) return; // silently block non-VIPs
      return message.reply(
        `🔒 This group has been banned.\n` +
          `Reason: ${infoBannedThread.reason}\n` +
          `Time: ${infoBannedThread.date}\n\n` +
          `⚠ But you're VIP, so you can still use the bot.`
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

      if (!reason) return message.reply("⚠ Please provide a reason to ban the group.");

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

      // Notify the banned group
      try {
        await api.sendMessage(
          `🔒 This group has been banned by the pro group.\nReason: ${reason}\nTime: ${time}`,
          targetTID
        );
      } catch (e) {
        // maybe the bot isn't in the group or no permissions, silently fail
      }

      return message.reply(
        targetTID === currentTID
          ? `🔒 This group has been banned.\nReason: ${reason}\nTime: ${time}`
          : `🔒 Group ${targetTID} has been banned.\nReason: ${reason}\nTime: ${time}\n\n` +
            `⚠ But If you're VIP, so you can still use the bot. Thank you 🦥⚡`
      );
    }

    if (type === "list") {
      const allThreads = await threadsData.getAll();
      const bannedThreads = allThreads.filter(t => t.banned?.status);

      if (!bannedThreads.length) return message.reply("📭 No banned groups found.");

      let msg = "📋 Banned Groups List:\n";
      bannedThreads.forEach((t, i) => {
        msg += `\n${i + 1}. ${t.threadName || "Unknown"} (${t.threadID})\n📝 Reason: ${t.banned.reason}\n⏰ Banned on: ${t.banned.date}\n`;
      });

      return message.reply(msg.trim());
    }

    if (type === "unban") {
      const allThreads = await threadsData.getAll();
      const bannedThreads = allThreads.filter(t => t.banned?.status);

      if (!bannedThreads.length) return message.reply("✅ No banned groups found.");

      // Unban by indexes from banned list (num mode)
      if (args[1] && args[1].toLowerCase() === "num") {
        const indexes = args.slice(2)
          .flatMap(arg => arg.split(","))
          .map(i => parseInt(i.trim(), 10))
          .filter(i => !isNaN(i) && i >= 1 && i <= bannedThreads.length);

        if (!indexes.length)
          return message.reply("⚠ Please provide valid index(es) after 'num' to unban.");

        const uniqueIndexes = [...new Set(indexes)];
        let results = [];

        for (const idx of uniqueIndexes) {
          const thread = bannedThreads[idx - 1];
          if (thread) {
            await threadsData.set(thread.threadID, { banned: {} });

            // Notify the unbanned group
            try {
              await api.sendMessage(
                `✅ This group has been unbanned by the pro group. Everyone can now use the bot here.`,
                thread.threadID
              );
            } catch (e) {}

            results.push(`✅ Unbanned: ${thread.threadName || "Unknown"} (${thread.threadID})`);
          } else {
            results.push(`❌ No banned group found at index ${idx}`);
          }
        }

        results.push("Everyone can now use the bot in these groups.");
        return message.reply(results.join("\n"));
      }

      // Unban by tid or current group (default)
      const tidArg = args[1];
      if (!tidArg) {
        if (!threadData.banned?.status)
          return message.reply(`✅ This group (${currentTID}) is not banned.`);

        await threadsData.set(currentTID, { banned: {} });

        try {
          await api.sendMessage(
            `✅ This group has been unbanned by the pro group. Everyone can now use the bot here.`,
            currentTID
          );
        } catch (e) {}

        return message.reply(`✅ Unbanned current group (${threadData.threadName || currentTID}). Everyone can now use the bot here.`);
      }

      if (/^\d+$/.test(tidArg)) {
        const tidThread = bannedThreads.find(t => t.threadID === tidArg);
        if (!tidThread) return message.reply(`❌ Group ID ${tidArg} is not banned.`);

        await threadsData.set(tidArg, { banned: {} });

        try {
          await api.sendMessage(
            `✅ This group has been unbanned by the pro group. Everyone can now use the bot here.`,
            tidArg
          );
        } catch (e) {}

        return message.reply(`✅ Unbanned group ${tidThread.threadName || tidArg}. Everyone can now use the bot here.`);
      }

      return message.reply(
        "❓ Invalid unban usage.\n" +
          "- Use 'threadpro unban' to unban current group\n" +
          "- Use 'threadpro unban <tid>' to unban by group ID\n" +
          "- Use 'threadpro unban num <indexes...>' to unban by banned list indexes"
      );
    }

    return message.reply(
      "❓ Usage:\n" +
        "- threadpro ban <reason> 🔒 (ban current group)\n" +
        "- threadpro ban <tid> <reason> 🔒 (ban by group ID)\n" +
        "- threadpro unban [tid] ✅ (unban by group ID or current group)\n" +
        "- threadpro unban num <indexes...> ✅ (unban by banned list indexes)\n" +
        "- threadpro list 📋 (show banned groups)"
    );
  },
};
