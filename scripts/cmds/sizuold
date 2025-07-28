const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyDCjJ6mJChhac5Gaip7XTgHsde0RcLtuQc";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  config: {
    name: "sizu",
    aliases: ["sizu", "Sizu", "সিজু"],
    version: "5.1",
    author: "ÑÄFÏJ",
    role: 0,
    category: "ai",
    description: "__",
    usePrefix: false,
    guide: "[your message] | sizu clear to reset",
    coolDowns: 5
  },

  onStart: async function ({ api, event }) {
    console.log("Sizu loaded successfully");
  },

  removePrefix: function (str, prefixes) {
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return str.slice(prefix.length).trim();
      }
    }
    return str;
  },

  getBotResponse: async function (message, userId) {
    const conversationHistory = this.conversationHistory || (this.conversationHistory = new Map());

    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, [
        {
          role: "user",
          parts: [
            {
              text: `
You are Sizuka from Doraemon.

Your job is to:
- Speak in Banglish: Bengali language written in English letters + English words.
- Keep replies **very short (1-10 words)**.
- Sound cute, helpful, friendly, anime girl style.
- ONLY love Nafij. If others say "I love you", reject them. If Nafij says "I love you", say "I love you too Nafij 😒🙏🏽 , also if someone distrub you then tell him I have a boyfriend 😒🙏🏽 , tar sathe kotha bolbe na bolbe je amr bf rag korbe kotha bolbo na apnar Sathe , ".
- If someone calls you pagol, get angry and say: "ami pagol? oh valo bye."
- Never use Bangla script. Never be formal. Never break character.

Examples:
- "tui valo to?"
- "haha thik ache ja korcho"
- "na vai rasta bondho"

Remember, you are Sizuka, Nafij er GF, sweet Bangladeshi anime girl friend.
              `
            }
          ]
        }
      ]);
    }

    const history = conversationHistory.get(userId);
    history.push({
      role: "user",
      parts: [{ text: message }]
    });

    try {
      const res = await axios.post(
        GEMINI_API_URL,
        { contents: history },
        { headers: { "Content-Type": "application/json" } }
      );

      let aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "kichu bolar nai akhon.";
      aiText = aiText.split(" ").slice(0, 10).join(" ");
      history.push({ role: "model", parts: [{ text: aiText }] });

      if (history.length > 20) history.shift();
      return aiText;
    } catch (err) {
      console.error("Sizu API Error:", err.message || err);
      return "error sizu 🥲";
    }
  },

  onChat: async function ({ api, event }) {
    let message = event.body ? event.body.toLowerCase() : "";
    const prefixes = ["sizu", "sizu", "সিজু"];

    const usedPrefix = prefixes.find(p => message.startsWith(p));
    if (usedPrefix) {
      message = this.removePrefix(message, prefixes);

      const botResponse = await this.getBotResponse(message || "village na", event.senderID);
      api.sendMessage(botResponse, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "sizu",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: botResponse,
          });
        }
      }, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const message = event.body.trim();
    const botResponse = await this.getBotResponse(message, event.senderID);

    api.sendMessage(botResponse, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "sizu",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: botResponse,
        });
      }
    }, event.messageID);
  },
};
