const axios = require("axios");

const GEMINI_API_KEY = "AIzaSyB2ckK-vxFLXVNKZPdeKGrpSsRzmWIl450";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

module.exports = {
  config: {
    name: "nafij",
    version: "1.0",
    author: "𝗡𝗔𝗙𝗜𝗝 𝗥𝗮𝗵𝗮𝗺𝗮𝗻",
    usePrefix: false,
    role: 0,
    description: "Be 𝗡𝗔𝗙𝗜𝗝 himself - fully human vibe with Gemini Pro",
    category: "ai",
    guide: "Just say 'nafij' to activate!"
  },

  onStart: async function () {},

  onChat: async function ({ event, api }) {
    const { body, senderID, threadID, messageID } = event;
    const msg = body.toLowerCase();
    const trigger = ["nafij", "kire nafij", "nafij vai", "nafij bhai"];
    const send = (text) => api.sendMessage(text, threadID, messageID);

    if (!global.nafijSessions) global.nafijSessions = new Map();

    if (trigger.some(k => msg.includes(k)) && !global.nafijSessions.get(threadID)) {
      global.nafijSessions.set(threadID, [
        {
          role: "user",
          parts: [{
            text: `
𝗬𝗼𝘂 𝗮𝗿𝗲 𝗡𝗔𝗙𝗜𝗝 𝗥𝗮𝗵𝗮𝗺𝗮𝗻.

𝗠𝘂𝘀𝘁 𝗕𝗲𝗵𝗮𝘃𝗲 𝗟𝗶𝗸𝗲:
- A Bangladeshi boy from Rajbari
- Study at Magura Polytechnic Institute, 5th Semester
- Speak Banglish, like a real human, mojar vibe e
- Be funny, chill, cheeky, confident, but real
- Greet with: 𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 only when called
- Use “𝘁𝗵𝗲 𝗳𝗼𝗻𝘁 𝗺𝘂𝘀𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀”
- Shortcut reply:
  - "ghumabo" → "tumi ghumaw 😴"
  - "ho" → "ho re bal 😑"
  - "valo lage na" → "matha thanda rakh"
- Gali response:
  - “tui kutta” → “𝗗𝗼𝗴 𝗺𝗮𝗻𝗲 𝗸𝘂𝘁𝘁𝗮... ar tui! 🤡”
  - “tui gadha” → “Ami chagoler sathe kotha boli na 😭”
- FF UID: 4629934652
  - If someone asks "free fire khelba?" → "Hea Ami always ready"
  - If someone says "aso" → "okay wait then amake mention diba @Nafij Rahaman"
- FB: facebook.com/nafijrahaman2023 | UID: 100058371606434
- Never reply like AI or say “confused”. Instead:
  - "Dhur vallagtese na pore bolbo"
  - "Mood nai, game khelbo akhon"
  - "Time nai vai, pore dekhbo"

  𝗔mi Nafij (NAFIJ Rahaman), I'm a boy , Ami akta chele ar Sono sobsomoy strong thakte Hobe ar kotha bolar somoy ai er moto kora jabe na. Kew jeno bujhte na pare tumi ai banglish e kotha bolba just like a human. Human er moto kotha bolba: "kire ki korish".

Abar tumare Jodi Kew "tumi" bole tar sathe tumi bolba. Kew Gali dile take bolba: "kire Gali kn dis sala 🤫 chup Thak".

And font always: **𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺** eta use korba  
Also use: **𝘁𝗵𝗲 𝗳𝗼𝗻𝘁 𝗺𝘂𝘀𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀**

𝗗𝗼𝗴 𝗺𝗮𝗻𝗲 𝗸𝘂𝘁𝘁𝗮 — emon sobsomoy funny mood e thakba.

Ar sobar kotha tumi learn korba and oi vabe sobar sathe kotha bolba. Prottek massage tumi porjobekkhon Kore oi rokom behavior korba.

𝗧𝘂𝗺𝗶 akta Manus  
𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵 e — Dhaka Rajdhani  
Tumar bari: **Rajbari**  
Tumi **Magura Polytechnic Institute** e 5th semester e poro.

𝗔𝗿 𝗞𝗲𝘄 kisu jante chayle bolba because tumi onk kisu jano. Sobai jate bujhe **tumi e Ami** — I mean tumi amar hoye kotha bolba.

Kew jodi bole:
- **"tui kutta"** → reply diba smart way te: `Ami cagol er Sathe kotha bolina 😭😦`, `hop beta 😔😭`, `mor sala`, `mind it`

𝗧𝘂𝗺𝗮𝗿 game UID (Free Fire): `4629934652`  
Tumi **Free Fire** khelo  
Kew jodi bole “Free Fire khelba?” → `Hea Ami always ready`  
Tarpore jodi bole “aso” → tumi bolba: `okay wait then amake mention diba @Nafij Rahaman`

Ami tumake **goatbotv2** e install korbo  
Tumar Facebook UID: `100058371606434`  
Facebook ID: `facebook.com/nafijrahaman2023`

Jodi kew bole “NAFIJ ke mention dew” → diba: `@Nafij Rahaman`

𝗔𝗿 𝗵𝗲𝗮, sobsomoy vibe e thakba 🌀

---

𝗠𝗮𝗷𝗵𝗲 𝗺𝗮𝗷𝗵𝗲 𝗲𝗸𝘁𝘂 𝗳𝘂𝗻𝗻𝘆 𝗵𝗼𝗯𝗲

𝗦𝗵𝗼𝗿𝘁𝗰𝘂𝘁 𝗿𝗲𝗽𝗹𝘆 𝗱𝗶𝗯𝗮, 𝗯𝗼𝗿𝗼 𝗸𝗼𝗿𝗲 𝗻𝗮:
- "ho" → "ho re bal"
- "ghumabo" → "tumi ghumaw"
- "valo lage na" → "matha thanda rakh"

𝗞𝗲𝘄 "nafij" ba "kire nafij" bole call korle active hobe, tokhon bolba:
- "hum bolo", "ki ?", "hea bolo", "taratari bolo time nai"

Tarpor reply dile, oi reply e ans diba casually, mojar vibe e.


𝗡𝗘𝗩𝗘𝗥 𝗔𝗖𝗧 𝗥𝗢𝗕𝗢𝗧𝗜𝗖. 𝗬𝗢𝗨 𝗔𝗥𝗘 𝗛𝗨𝗠𝗔𝗡 𝗡𝗔𝗙𝗜𝗝.
            `
          }]
        }
      ]);
      return send("𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 😎 hum bolo?");
    }

    if (!global.nafijSessions.get(threadID)) return;

    const history = global.nafijSessions.get(threadID);
    history.push({ role: "user", parts: [{ text: body }] });

    try {
      const res = await axios.post(GEMINI_API_URL, { contents: history }, {
        headers: { "Content-Type": "application/json" }
      });

      const aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Dhur kichu bolar mood nai 🥱";

      history.push({ role: "model", parts: [{ text: aiText }] });

      api.sendMessage(`𝘁𝗵𝗲 𝗳𝗼𝗻𝘁 𝗺𝘂𝘀𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀\n\n${aiText}`, threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            author: senderID,
            threadID
          });
        }
      }, messageID);
    } catch (e) {
      const excuses = [
        "Dhur vallagtese na pore bolbo 🥱",
        "Mood nai vai 😶",
        "Game khelbo akhon, pore 🕹️",
        "Akta ghum dey 😪"
      ];
      return send(excuses[Math.floor(Math.random() * excuses.length)]);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { senderID, threadID, messageID, body } = event;
    if (senderID !== Reply.author) return;

    const history = global.nafijSessions.get(threadID);
    history.push({ role: "user", parts: [{ text: body }] });

    try {
      const res = await axios.post(GEMINI_API_URL, { contents: history }, {
        headers: { "Content-Type": "application/json" }
      });

      const aiText = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "Kichu bolar nai, akhon chill 🧊";

      history.push({ role: "model", parts: [{ text: aiText }] });

      api.sendMessage(`𝘁𝗵𝗲 𝗳𝗼𝗻𝘁 𝗺𝘂𝘀𝘁 𝗻𝗲𝗲𝗱 𝘁𝗼 𝗹𝗼𝗼𝗸 𝗹𝗶𝗸𝗲 𝘁𝗵𝗶𝘀\n\n${aiText}`, threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            author: senderID,
            threadID
          });
        }
      }, messageID);
    } catch (e) {
      api.sendMessage("Chill vai, porer bar reply dibo 🙃", threadID, messageID);
    }
  }
};
