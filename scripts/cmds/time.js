const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");
const os = require("os");

function toFullWidthBold(str) {
  const map = {
    A:'𝐀',B:'𝐁',C:'𝐂',D:'𝐃',E:'𝐄',F:'𝐅',G:'𝐆',
    H:'𝐇',I:'𝐈',J:'𝐉',K:'𝐊',L:'𝐋',M:'𝐌',N:'𝐍',
    O:'𝐎',P:'𝐏',Q:'𝐐',R:'𝐑',S:'𝐒',T:'𝐓',U:'𝐔',
    V:'𝐕',W:'𝐖',X:'𝐗',Y:'𝐘',Z:'𝐙',
    a:'𝐚',b:'𝐛',c:'𝐜',d:'𝐝',e:'𝐞',f:'𝐟',g:'𝐠',
    h:'𝐡',i:'𝐢',j:'𝐣',k:'𝐤',l:'𝐥',m:'𝐦',n:'𝐧',
    o:'𝐨',p:'𝐩',q:'𝐪',r:'𝐫',s:'𝐬',t:'𝐭',u:'𝐮',
    v:'𝐯',w:'𝐰',x:'𝐱',y:'𝐲',z:'𝐳',
    0:'𝟎',1:'𝟏',2:'𝟐',3:'𝟑',4:'𝟒',5:'𝟓',
    6:'𝟔',7:'𝟕',8:'𝟖',9:'𝟗'
  };
  return str.split('').map(c => map[c] || c).join('');
}

function formatTime12Hour(date) {
  let hour = date.getHours();
  const min = date.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? "𝐏𝐌" : "𝐀𝐌";
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${min} ${ampm}`;
}

function getDhakaDate() {
  const now = new Date();
  const offset = 6 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + offset * 60000);
}

function getUptime() {
  const seconds = process.uptime();
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

async function createTimeCard() {
  const width = 800, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000d33";
  ctx.fillRect(0, 0, width, height);

  const now = getDhakaDate();
  const time = toFullWidthBold(formatTime12Hour(now));
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const date = toFullWidthBold(dateStr);
  const uptime = getUptime();

  // Time (larger)
  ctx.font = "74px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#00ccff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 30;
  ctx.fillText(time, width / 2, 140);

  // Date (gray)
  ctx.font = "28px Arial";
  ctx.fillStyle = "#cccccc";
  ctx.shadowColor = "transparent";
  ctx.fillText(date, width / 2, 200);

  // Bangladesh
  ctx.font = "24px Arial";
  ctx.fillStyle = "#00ccff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 10;
  ctx.fillText("𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡", width / 2, 240);

  // (Asia/Dhaka)
  ctx.font = "18px Arial";
  ctx.shadowBlur = 5;
  ctx.fillText("(Asia/Dhaka)", width / 2, 270);

  // Horizontal line
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#00ccff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 300);
  ctx.lineTo(width - 50, 300);
  ctx.stroke();

  // Uptime left
  ctx.textAlign = "left";
  ctx.font = "18px Arial";
  ctx.fillStyle = "#00ccff";
  ctx.shadowColor = "#00ccff";
  ctx.shadowBlur = 6;
  ctx.fillText(`Uptime: ${uptime}`, 50, 330);

  // Sakura Bot right
  ctx.textAlign = "right";
  ctx.font = "16px Arial";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Sakura Bot", width - 50, 330);

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "time",
    version: "1.1",
    author: "Ew'r Saim",
    role: 0,
    countDown: 3,
    shortDescription: "Stylish neon time card",
    category: "tools"
  },

  onStart: async ({ message }) => {
    const buffer = await createTimeCard();
    const filePath = path.join(__dirname, "cache", "time_card.png");
    fs.writeFileSync(filePath, buffer);
    return message.reply({ attachment: fs.createReadStream(filePath) });
  }
};
