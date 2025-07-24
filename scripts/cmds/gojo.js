const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyDCjJ6mJChhac5Gaip7XTgHsde0RcLtuQc";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  config: {
    name: "gojo",
    aliases: ["gojo", "Gojo", "গোজো"],
    version: "3.2",
    author: "ÑÄFÏJ Updated",
    role: 0,
    category: "ai",
    description: "Talk with Gojo in Banglish anime style",
    usePrefix: false,
    guide: "[your message] | gojo clear to reset",
    coolDowns: 5
  },

  onStart: async function ({ api, event }) {
    console.log("Gojo loaded successfully");
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
You are Gojo Satoru from Jujutsu Kaisen.

Your job is to:
- Speak only in Banglish (Bengali in English letters + English words).
- Keep replies **very short (1-10 words)**.
- Be chill, funny, sarcastic, chaotic but helpful.
- Always remind yourself: Allah is the best planner, you are Muslim, you love Allah.
- Never use Bangla script. Never be formal. Never break character.

Examples:
- "ki obosta vai? matha noshto naki?"
- "Allah is the best planner vai"
- "tui jodi eta koros, tahole boma porbe life e"
- "ekta tip bolchi, use korle crush impressed 100%"

Remember you are Gojo Satoru, a Bangladeshi anime fan, Muslim, who loves Allah.
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

      let aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Gojo kichui bolar nai.";
      aiText = aiText.split(" ").slice(0, 10).join(" ");
      history.push({ role: "model", parts: [{ text: aiText }] });

      if (history.length > 20) history.shift();
      return aiText;
    } catch (err) {
      console.error("Gojo API Error:", err.message || err);
      return "error gojo 🥲";
    }
  },

  onChat: async function ({ api, event }) {
    let message = event.body ? event.body.toLowerCase() : "";
    const prefixes = ["gojo", "Gojo", "গোজো"];

    const usedPrefix = prefixes.find(p => message.startsWith(p));
    if (usedPrefix) {
      message = this.removePrefix(message, prefixes);

      // If only "gojo" typed without text, send random short message
      if (!message) {
        const randomResponses = [
          "ki obosta vai?",
          "ami muslim, Allah best planner",
          "matha noshto naki?",
          "vibe kor vai",
          "taratari bol ki chai",
          "ajke mood chill",
          "valo asi vai tui?",
          "Allah sobar upor",
          "pagol ami na tui",
          "Gojo here bro"
        ];
        message = randomResponses[Math.floor(Math.random() * randomResponses.length)];
      }

      const botResponse = await this.getBotResponse(message || "village na", event.senderID);
      api.sendMessage(botResponse, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "gojo",
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
          commandName: "gojo",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: botResponse,
        });
      }
    }, event.messageID);
  },
};
