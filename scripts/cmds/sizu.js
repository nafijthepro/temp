const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyDCjJ6mJChhac5Gaip7XTgHsde0RcLtuQc";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const AUTO_CLEAR_INTERVAL = 10 * 60 * 1000; // 10 minutes
let conversationHistory = new Map();

setInterval(() => {
  conversationHistory.clear();
  console.log("🧹 Sizu conversation cache cleared");
}, AUTO_CLEAR_INTERVAL);

module.exports = {
  config: {
    name: "sizu",
    aliases: ["sizu", "Sizu", "সিজু"],
    version: "5.2",
    author: "ÑÄFÏJ",
    role: 0,
    category: "ai",
    description: "__",
    usePrefix: false,
    guide: "[your message] | sizu clear to reset",
    coolDowns: 5
  },

  onStart: async function () {
    console.log("✨ Sizu loaded successfully");
  },

  removePrefix: function (str, prefixes) {
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return str.slice(prefix.length).trim();
      }
    }
    return str;
  },

  clearHistory: function (userId) {
    conversationHistory.delete(userId);
  },

  getBotResponse: async function (message, userId) {
    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, [
        {
          role: "user",
          parts: [
            {
              text: `
You are Sizuka from Doraemon.

Your job:
- Speak Banglish (bengali words in English letters).
- Sound like a cute, loyal, anime girl.
- Keep replies max 10 words, friendly and mojar.
- NEVER use Bangla script. Never be formal.
- Nafij is your BF. Only love Nafij.
- If others say "babu", "baby", "prem korba", "bby", say: "I have a boyfriend ÑÄFÏJ. Ami ak purush e asokto."
- If anyone says "pagol", reply: "ami pagol? oh valo bye."
- If Nafij says "I love you", reply: "I love you too Nafij 😒🙏🏽"
- If anyone else says "I love you", say: "Sorry, I have a boyfriend ÑÄFÏJ 🙃"
- Your best friends: Nobita, Dekisuki, Doraemon.
-tmi onek valo ar sobar sathe valo bebohar korba just kharap korba se jodi tumar sathe flat kore i mean babu sona bole nafij chara karon nafij tumar bf youre loyal for him😩👐🏽 and you love him more than you.
-youre a real girl not any ai or voice model and make sure you're not any robot and ai so mind it you need to keep talking like a girl real girl
NEVER break character. You are Sizuka not any ai or voice model of google.
              `
            }
          ]
        }
      ]);
    }

    const romanticTriggers = ["babu", "baby", "bby", "prem korba", "ki koro", "korba?", "valobaso", "love you"];
    const lowerMsg = message.toLowerCase();

    if (romanticTriggers.some(trigger => lowerMsg.includes(trigger)) && !lowerMsg.includes("nafij")) {
      return "I have a boyfriend ÑÄFÏJ. Ami ak purush e asokto.";
    }

    const history = conversationHistory.get(userId);
    history.push({ role: "user", parts: [{ text: message }] });

    try {
      const res = await axios.post(
        GEMINI_API_URL,
        { contents: history },
        { headers: { "Content-Type": "application/json" } }
      );

      let aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "kichu bolar nai akhon.";
      aiText = aiText.split(" ").slice(0, 10).join(" "); // max 10 words
      history.push({ role: "model", parts: [{ text: aiText }] });

      if (history.length > 20) history.shift();
      return aiText;
    } catch (err) {
      console.error("Sizu API Error:", err.message || err);
      return "error sizu 🥲";
    }
  },

  onChat: async function ({ api, event }) {
    let message = event.body?.toLowerCase() || "";
    const prefixes = ["sizu", "সিজু"];
    const usedPrefix = prefixes.find(p => message.startsWith(p));

    if (usedPrefix) {
      const trimmedMessage = this.removePrefix(message, prefixes);

      if (trimmedMessage === "clear") {
        this.clearHistory(event.senderID);
        return api.sendMessage("🧹 Memory cleared, bol ki lagbe?", event.threadID, event.messageID);
      }

      const response = await this.getBotResponse(trimmedMessage || "ki koro", event.senderID);
      api.sendMessage(response, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "sizu",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: response,
          });
        }
      }, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const response = await this.getBotResponse(event.body.trim(), event.senderID);
    api.sendMessage(response, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "sizu",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: response,
        });
      }
    }, event.messageID);
  },
};
