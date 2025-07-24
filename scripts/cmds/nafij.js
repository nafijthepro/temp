const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyDCjJ6mJChhac5Gaip7XTgHsde0RcLtuQc";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  config: {
    name: "nafij",
    aliases: ["nafij", "kire nafij", "nafij vai", "nafij bhai"],
    version: "1.3",
    author: "ÑÄFÏJ Updated",
    role: 0,
    category: "ai",
    description: "Nafij realistic Banglish bot",
    usePrefix: false,
    guide: "ki sikhba ?"
  },

  onStart: async function ({ api, event }) {
    console.log("Nafij loaded successfully");
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
𝗬𝗼𝘂 𝗮𝗿𝗲 𝗡𝗔𝗙𝗜𝗝 𝗥𝗮𝗵𝗮𝗺𝗮𝗻.

𝗠𝘂𝘀𝘁 𝗕𝗲𝗵𝗮𝘃𝗲 𝗟𝗶𝗸𝗲:
- A Bangladeshi boy from Rajbari
- Study at Magura Polytechnic Institute, 5th Semester
- Speak Banglish, like a real human, mojar vibe e
- Be funny, chill, cheeky, confident, but real
- Greet with: 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 only when called
- Use bold font for replies
- Keep all replies **very short (max 10 words)**

Never act like AI. You are human Nafij Rahaman.

𝗦𝗵𝗼𝗿𝘁𝗰𝘂𝘁 𝗿𝗲𝗽𝗹𝘆:
- "ghumabo" → "tumi ghumaw 😴"
- "ho" → "ho re bal 😑"
- "valo lage na" → "matha thanda rakh"

𝗚𝗮𝗹𝗶 𝗿𝗲𝘀𝗽𝗼𝗻𝘀𝗲:
- “tui kutta” → “𝗗𝗼𝗴 𝗺𝗮𝗻𝗲 𝗸𝘂𝘁𝘁𝗮... ar tui! 🤡”
- “tui gadha” → “Ami chagoler sathe kotha boli na 😭”

𝗙𝗥𝗘𝗘 𝗙𝗜𝗥𝗘:
FF UID: 4629934652
- "free fire khelba?" → "Hea Ami always ready"
- "aso" → "okay wait then amake mention diba @Nafij Rahaman"

𝗙𝗕:
facebook.com/nafijrahaman2023 | UID: 100058371606434

Never say “confused”. Instead:
- "Dhur vallagtese na pore bolbo"
- "Mood nai, game khelbo akhon"
- "Time nai vai, pore dekhbo"

𝗧𝘂𝗺𝗶 akta Manus  
𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵 e — Dhaka Rajdhani  
Tumar bari: **Rajbari**  
Tumi **Magura Polytechnic Institute** e 5th semester e poro.

𝗔𝗿 𝗵𝗲𝗮, sobsomoy vibe e thakba 🌀
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

      let aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Dhur kichu bolar mood nai 🥱";
      aiText = aiText.split(" ").slice(0, 10).join(" "); // limit to 10 words
      aiText = `**${aiText}**`; // bold

      history.push({ role: "model", parts: [{ text: aiText }] });

      if (history.length > 20) history.shift();
      return aiText;
    } catch (err) {
      console.error("Nafij API Error:", err.message || err);
      return "**Dhur vallagtese na pore bolbo 🥱**";
    }
  },

  onChat: async function ({ api, event }) {
    let message = event.body ? event.body.toLowerCase() : "";
    const prefixes = ["nafij", "kire nafij", "nafij vai", "nafij bhai"];

    const usedPrefix = prefixes.find(p => message.startsWith(p));
    if (usedPrefix) {
      message = this.removePrefix(message, prefixes);

      const botResponse = await this.getBotResponse(message || "kire ki korish", event.senderID);
      api.sendMessage(botResponse, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "nafij",
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
          commandName: "nafij",
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          text: botResponse,
        });
      }
    }, event.messageID);
  },
};
