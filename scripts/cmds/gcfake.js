 module.exports = {
  config: {
    name: "gc",
    author: "Tawsif~ (Fixed by Yeasin)",
    category: "fun",
    version: "2.6",
    countDown: 5,
    role: 0,
    guide: {
      en: `<text> ++ <text> | reply | --user <uid or fb link> | --theme <0-5> | --attachment <image url> | --time <true/false>\nThemes: 0. lo-fi, 1. bubble tea, 2. swimming, 3. lucky pink, 4. default, 5. monochrome`
    }
  },

  onStart: async function({ message, usersData, event, args, api }) {
    if (!args[0] && !event.messageReply) {
      return message.reply("❌ | Provide some text or reply to a message.");
    }

    let prompt = args.join(" ") || "";
    prompt = prompt.split("\n").join("++");

    let id = event.senderID;

    if (event.messageReply) {
      if (prompt.includes("--user")) {
        const userArg = (prompt.split("--user ")[1] || "").split(" ")[0];
        id = userArg.includes(".com") ? await api.getUID(userArg) : userArg;
      } else {
        id = event.messageReply.senderID;
      }
    } else if (prompt.includes("--user")) {
      const userArg = (prompt.split("--user ")[1] || "").split(" ")[0];
      id = userArg.includes(".com") ? await api.getUID(userArg) : userArg;
    }

    // Theme setup
    let themeID = 4;
    if (prompt.includes("--theme")) {
      themeID = parseInt((prompt.split("--theme ")[1] || "4").split(" ")[0]) || 4;
    }

    // Easter egg block (for Tawsif and devs)
    if (
      ["100058371606434", "100058371606434"].includes(event?.messageReply?.senderID)
    ) {
      if (!["100058371606434", "100058371606434"].includes(event.senderID)) {
        prompt = "hi guys I'm gay";
        id = event.senderID;
      }
    }

    const name = (await usersData.getName(id)).split(" ")[0];
    const avatarUrl = await usersData.getAvatarUrl(id);

    let replyImage;
    if (event?.messageReply?.attachments?.[0]) {
      replyImage = event.messageReply.attachments[0].url;
    } else if (prompt.includes("--attachment")) {
      replyImage = (prompt.split("--attachment ")[1] || "").split(" ")[0];
    }

    let time = "true";
    if (prompt.includes("--time")) {
      const timeArg = (prompt.split("--time ")[1] || "").split(" ")[0];
      time = timeArg === "false" ? "" : "true";
    }

    // Remove all --options from prompt
    prompt = prompt.split("--")[0].trim();
    if (!prompt) return message.reply("❌ | Provide valid text content.");

    message.reaction("⏳", event.messageID);

    try {
      let url = `https://tawsifz-fakechat.onrender.com/image?theme=${themeID}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatarUrl)}&text=${encodeURIComponent(prompt)}&time=${time}`;
      if (replyImage) {
        url += `&replyImageUrl=${encodeURIComponent(replyImage)}`;
      }

      const attachment = await global.utils.getStreamFromURL(url, 'gc.png');
      await message.reply({ attachment });
      message.reaction("✅", event.messageID);
    } catch (error) {
      console.error("GC FakeChat Error:", error);
      message.reply("❌ | " + error.message);
    }
  }
};
