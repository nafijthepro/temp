module.exports = {
  config: {
    name: "slot",
    version: "2.1",
    author: "Arijit",
    countDown: 15,
    shortDescription: {
      en: "slot game 🙂",
    },
    longDescription: {
      en: "Try your luck in a slot game",
    },
    category: "game",
  },

  langs: {
    en: {
      invalid_amount: "𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 😿💅",
      not_enough_money: "𝗣𝗹𝗲𝗮𝘀𝗲 𝗰𝗵𝗲𝗰𝗸 𝘆𝗼𝘂𝗿 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 🤡",
      win_message: ">🎀\n• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 $%1\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 [ %2 | %3 | %4 ]",
      lose_message: ">🎀\n• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 $%1\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 [ %2 | %3 | %4 ]",
      jackpot_message: ">🎀\n𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 𝐘𝐨𝐮 𝐰𝐨𝐧 $%1 𝐰𝐢𝐭𝐡 𝐭𝐡𝐫𝐞𝐞 %2 𝐬𝐲𝐦𝐛𝐨𝐥𝐬, 𝐁𝐚𝐛𝐲!\n• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬 [ %3 | %4 | %5 ]"
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slots = ["💚", "💛", "💙", "💜", "🤎", "🤍", "❤"];
    const results = [
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)],
    ];

    const winnings = calculateWinnings(results, amount);
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = formatResult(results, winnings, getLang);
    return message.reply(messageText);
  },
};

function calculateWinnings([a, b, c], bet) {
  if (a === b && b === c) {
    if (a === "❤") return bet * 10;  // Jackpot
    return bet * 5;                   // 3 same, non-jackpot
  }
  if (a === b || b === c || a === c) return bet * 2; // Any two same
  return -bet; // Lose
}

function formatResult([a, b, c], winnings, getLang) {
  const formattedWinnings = formatMoney(Math.abs(winnings));

  if (a === b && b === c && a === "❤") {
    return getLang("jackpot_message", formattedWinnings, a, a, b, c);
  }

  if (winnings > 0) {
    return getLang("win_message", formattedWinnings, a, b, c);
  }

  return getLang("lose_message", formattedWinnings, a, b, c);
}

function formatMoney(amount) {
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "𝗧";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "𝗕";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "𝐌";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "𝗞";
  return amount.toString();
}
