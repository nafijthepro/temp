const axios = require('axios');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { createReadStream, existsSync } = require('fs');

const obfuscated = Buffer.from("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fsa2FtYTg0NC9yZXMvcmVmcy9oZWFkcy9tYWluL2NyaWNrZXQvY3JpY2tldC5qc29u", "base64").toString("utf-8");

const PLAY_LIMIT = 20;
const COOLDOWN = 10 * 60 * 60 * 1000;
const TIME_LIMIT = 15000;
const COINS_WIN = 1000;
const COINS_LOSE = 300;

module.exports = {
  config: {
    name: "cricketquiz",
    aliases: ["cricketqz", "cricket"],
    version: "9.9.9",
    author: "NAFIJ PRO ✅",
    role: 0,
    shortDescription: "__",
    longDescription: "__",
    category: "game",
    guide: {
      en: "{p}cricketquiz\n{p}cricketquiz top"
    }
  },

  onStart: async function({ event, message, usersData, args }) {
    if (args[0] === "top") return await this.showTop({ message, usersData });

    const uid = event.senderID;
    const now = Date.now();
    const dataFile = path.join(__dirname, "cricketdata.json");
    if (!existsSync(dataFile)) await fsp.writeFile(dataFile, "{}");
    const allData = JSON.parse(await fsp.readFile(dataFile, "utf-8"));

    if (!allData[uid]) allData[uid] = { count: 0, lastReset: now, wins: 0, loses: 0 };

    if (now - allData[uid].lastReset > COOLDOWN) {
      allData[uid].count = 0;
      allData[uid].lastReset = now;
    }

    if (allData[uid].count >= PLAY_LIMIT) {
      const remain = COOLDOWN - (now - allData[uid].lastReset);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);
      return message.reply(`⛔ Please come back after ${h}h ${m}m ${s}s`);
    }

    const players = await this.fetchData();
    if (!players || players.length === 0) return message.reply("Failed to fetch player data.");

    const random = players[Math.floor(Math.random() * players.length)];
    const { name, image, aliases } = random;

    const imgStream = await this.downloadImage(image);
    if (!imgStream) return message.reply("Image loading failed.");

    allData[uid].count++;
    await fsp.writeFile(dataFile, JSON.stringify(allData, null, 2));

    const replyMsg = await message.reply({
      body: `━━━━━━━━━━━━━━━━━━━━\n🏏 PLEASE THELL THIS PLAYER NAME:\n⏱ YOUR TIME IS 15 SECONDS\n💰 IF RIGHT THEN GET 1000 COINS\n━━━━━━━━━━━━━━━━━━━━`,
      attachment: imgStream
    });

    global.GoatBot.onReply.set(replyMsg.messageID, {
      commandName: this.config.name,
      senderID: uid,
      correctAnswer: [name.toLowerCase(), ...(aliases.map(a => a.toLowerCase()))],
      messageID: replyMsg.messageID,
      dataFile,
      startedAt: now
    });

    setTimeout(() => {
      const gameData = global.GoatBot.onReply.get(replyMsg.messageID);
      if (gameData && gameData.senderID === uid) {
        global.GoatBot.onReply.delete(replyMsg.messageID);
        message.reply("⏰ Time expired 😦");
      }
    }, TIME_LIMIT);
  },

  onReply: async function({ event, message, Reply, usersData }) {
    const uid = event.senderID;
    const answer = event.body.trim().toLowerCase();
    const correct = Reply.correctAnswer;
    const now = Date.now();

    if (now - Reply.startedAt > TIME_LIMIT) {
      global.GoatBot.onReply.delete(Reply.messageID);
      return message.reply("⏰ Time expired 😦");
    }

    global.GoatBot.onReply.delete(Reply.messageID);

    const dataFile = Reply.dataFile;
    const allData = JSON.parse(await fsp.readFile(dataFile, "utf-8"));

    if (correct.includes(answer)) {
      await this.addCoins(uid, COINS_WIN, usersData);
      allData[uid].wins = (allData[uid].wins || 0) + 1;
      await fsp.writeFile(dataFile, JSON.stringify(allData, null, 2));
      return message.reply("✅ HEY PRO YOU'RE MASTER ✅🎯");
    } else {
      await this.addCoins(uid, -COINS_LOSE, usersData);
      allData[uid].loses = (allData[uid].loses || 0) + 1;
      await fsp.writeFile(dataFile, JSON.stringify(allData, null, 2));
      return message.reply(`❌ HEY NOOB PLEASE GO AND SLEEP 😴💤\n✔️ CORRECT ANSWER WAS: ${correct[0]}`);
    }
  },

  fetchData: async function() {
    try {
      const res = await axios.get(obfuscated);
      return res.data;
    } catch {
      return null;
    }
  },

  downloadImage: async function(url) {
    try {
      const name = `cricket_${Date.now()}.jpg`;
      const dir = path.join(__dirname, "cache");
      if (!existsSync(dir)) fs.mkdirSync(dir);
      const filePath = path.join(dir, name);
      const res = await axios.get(url, { responseType: "arraybuffer" });
      await fsp.writeFile(filePath, res.data);
      return createReadStream(filePath);
    } catch {
      return null;
    }
  },

  addCoins: async function(uid, amount, usersData) {
    const data = await usersData.get(uid) || {};
    data.money = (data.money || 0) + amount;
    if (data.money < 0) data.money = 0;
    await usersData.set(uid, data);
  },

  showTop: async function({ message, usersData }) {
    const file = path.join(__dirname, "cricketdata.json");
    if (!existsSync(file)) return message.reply("No leaderboard data yet.");
    const raw = JSON.parse(fs.readFileSync(file));
    const sorted = Object.entries(raw).sort((a, b) => b[1].wins - a[1].wins).slice(0, 5);
    const board = await Promise.all(sorted.map(async ([id, stats], i) => {
      const name = await usersData.getName(id) || "Unknown";
      return `${i + 1}. ${name} - ${stats.wins} wins`;
    }));
    return message.reply("🏆 CRICKET QUIZ TOP PLAYERS:\n━━━━━━━━━━━━━━━━━━━━\n" + board.join("\n"));
  }
};
