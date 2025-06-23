const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "2.0",
    author: "NAFIJ PRO ✅",
    countDown: 3,
    role: 0,
    description: "Show or change prefix for this group or globally",
    category: "system",
    guide: {
      en: "{pn} → show prefix\n{pn} <prefix> → set prefix\n{pn} <prefix> -g → set global (admin only)\n{pn} reset → reset group prefix"
    }
  },

  langs: {
    en: {
      reset: "✅ Group prefix reset to default: %1",
      onlyAdmin: "❌ Only bot admin can set global prefix!",
      confirmGlobal: "⚠️ React to confirm global prefix change!",
      confirmThisThread: "⚠️ React to confirm group prefix change!",
      successGlobal: "✅ Global prefix updated to: %1",
      successThisThread: "✅ Group prefix updated to: %1",
      myPrefix:
`╭───[ 😼PRO V2 STORM 🌷]───╮
│ 🤍 ASSALAMUALAIKUM ❣️
│
│ 🌐 SYSTEM PREFIX: %1
│ 👥 GROUP PREFIX: %2
│ ⏱️ UPTIME: %3 hours (%4 day)
╰───────────────────────╯`
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] == "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) return message.reply(getLang("onlyAdmin"));
      formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    return message.reply(
      formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread"),
      (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      }
    );
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (!event.body || event.body.toLowerCase() !== "prefix") return;

    const systemPrefix = global.GoatBot.config.prefix;
    const groupPrefix = utils.getPrefix(event.threadID);

    const uptimeInSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeInSeconds / 3600);
    const uptimeDays = Math.floor(uptimeHours / 24);

    return message.reply(getLang("myPrefix", systemPrefix, groupPrefix, uptimeHours, uptimeDays));
  }
};
