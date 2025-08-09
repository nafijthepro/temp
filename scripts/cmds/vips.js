const axios = require("axios");

function asciiBox(contentLines) {
  const maxLength = Math.max(...contentLines.map(line => line.length));
  const top = `╭${"─".repeat(maxLength + 2)}╮`;
  const bottom = `╰${"─".repeat(maxLength + 2)}╯`;
  const middle = contentLines
    .map(line => `│ ${line}${" ".repeat(maxLength - line.length)} │`)
    .join("\n");
  return `${top}\n${middle}\n${bottom}`;
}

module.exports = {
  config: {
    name: "vips",
    version: "1.0",
    author: "NAFIJ",
    description: "__",
    category: "admin",
    guide: {
      en: "vips → Display the VIPs list with special badges inside an ASCII art box",
    },
  },

  onStart: async function ({ message }) {
    const VIP_URL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/json/VIPs.json";

    try {
      const { data } = await axios.get(VIP_URL, { timeout: 7000 });

      if (!Array.isArray(data) || data.length === 0) {
        return message.reply("⚠️ VIP list is empty or invalid.");
      }

      const badge = "⭐️";
      const lines = ["VIP LIST'S", ""];

      const maxNameLength = Math.max(...data.map(vip => (vip.name || "").length));

      data.forEach((vip, i) => {
        const name = vip.name || "__";
        const paddedName = name + " ".repeat(maxNameLength - name.length);
        lines.push(`${i + 1}. ${paddedName} ${badge}`);
      });

      const boxed = asciiBox(lines);

      return message.reply(boxed);
    } catch {
      return message.reply("❌ Failed to fetch VIP list from server.");
    }
  },
};
