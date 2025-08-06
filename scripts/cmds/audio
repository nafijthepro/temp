const fs = require('fs');
const path = require('path');
const axios = require('axios');

const userCooldowns = new Map(); 

module.exports = {
  config: {
    name: "audio",
    version: "2.2",
    author: "ÑÄFÏJ",
    countDown: 0,
    role: 0,
    shortDescription: "emoji to audio",
    longDescription: "reply with Bangla audio when specific emojis are sent",
    category: "reply"
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    const { senderID, body } = event;
    if (!body) return;

    const word = body.trim();
    const folderPath = path.join(__dirname, "NAFIJ");

    // Check cooldown (5 minutes = 300000 ms)
    const lastUsed = userCooldowns.get(senderID);
    if (lastUsed && Date.now() - lastUsed < 15 * 60 * 1000) return;

    const audioResponses = {
      "🐒": { text: "কিরে বানর তোর কি হলো🐒", file: "banortor.mp3" },
      "🙂": { text: "সেন্টি খাও কেনো 🙂💔", file: "banortor.mp3" },
      "🖕": { text: "আঙুল তোমার পেছনে ভরে দিবো 😹", file: "angul79.mp3" },
      "😒": { text: "চোখ টা অনেক সুন্দর আমার মত😩🌷", file: "attitude.mp3" },
      "🥵": { text: "ছাড়ো না বেবি ব্যথা লাগে😧", file: "betha.mp3" },
      "😺": { text: "😚🫶 কিউট বিল্লু টা আমার 😩", file: "billitah.mp3" },
      "👙": { text: "ছিহ কি দেও এইসব ভালো হও বাচ্চা 😒💔", file: "kinedaw.mp3" },
      "💔": { text: "তোমার কি ব্রেকাপ হয়েছে 😭💔", file: "brkup.mp3" },
      "👻": { text: "ভুত কই থেকে আসলো 😑", file: "buth.mp3" },
      "😙": { text: "লুচ্চামি ছাড় ভালো হ 🙂", file: "cumah.mp3" },
      "🍼": { text: "ফিডার খাও বাবু তুমি এখনো বাচ্চা😺", file: "fider.mp3" },
      "🤰": { text: "এইটা তুমি কি করলা বাবু", file: "pregnant.mp3" },
      "🐰": { text: "খরগোশ আসছে reeeeee 😘", file: "korgus.mp3" },
      "😡": { text: "রাগ কোরো না আমার সাথে🤦🏽‍♂️😡", file: "angry.mp3" },
      "😹": { text: "এইভাবে? 😹", file: "Evabe8.mp3" },
      "🤫": { text: "চুপ হয়লাম তারপর 😑🙂😶", file: "sorom.mp3" },
      "😂": { text: "দাঁত পড়ে যাবে রে 🙂🙏🏽", file: "pagolnaki.mp3" },
      "🙈": { text: "লজ্জা পাস? 🙈", file: "sorom.mp3" },
      "😳": { text: "শরমে পরে গেছি 😳", file: "sorom.mp3" },
      "🥲": { text: "কেন্দে দিলাম 😢", file: "sale.mp3" },
      "😮": { text: "ওয়াও! 😮", file: "ragkoro.mp3" },
      "🤐": { text: "এটা কি করছো 😶", file: "sabdan.mp3" },
      "😈": { text: "ডাক কিসের? 😈", file: "dakoknogo.mp3" },
      "👁": { text: "কি দেখছো? 👀", file: "jhal.mp3" },
      "🤭": { text: "সরম পাচ্ছো? 🤭", file: "sorom.mp3" },
      "😵": { text: "ভেতরে যা হইসে! 😵", file: "datcokcok.mp3" },
      "🥴": { text: "আমি কি ভুত? 🥴", file: "amikivut.mp3" },
      "🤯": { text: "মাথা গরম 🤯", file: "amiotmkonk.mp3" },
      "🙃": { text: "উল্টাপাল্টা করো না 🙃", file: "yamate.mp3" },
      "👀": { text: "ফোকাস ওন কেরিয়ার 🤕", file: "Focus on career.mp3" }
    };

    const matched = audioResponses[word];
    if (!matched) return;

    const fileName = matched.file;
    const filePath = path.join(folderPath, fileName);
    const textMsg = matched.text;

    try {
      await fs.promises.mkdir(folderPath, { recursive: true });

      if (!fs.existsSync(filePath)) {
        const fileURL = getObscuredURL("nafij") + "/" + encodeURIComponent(fileName);
        const response = await axios.get(fileURL, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          response.data.pipe(writer);
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      }

      userCooldowns.set(senderID, Date.now()); // Set cooldown
      return message.reply({
        body: `「 ${textMsg} 」`,
        attachment: fs.createReadStream(filePath)
      });

    } catch (err) {
      console.error("❌ Audio send failed:", err.message);
      return message.reply(`「 ${textMsg} +😑💔 」`);
    }
  }
};

function getObscuredURL(seed) {
  const base64 = "aHR0cHM6Ly9naXRodWIuY29tL2Fsa2FtYTg0NC9yZXMvcmF3L21haW4vdm9pY2VwYWNr";
  return Buffer.from(base64, "base64").toString("utf8");
}
