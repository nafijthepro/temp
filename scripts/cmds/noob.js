module.exports = {
  config: {
    name: "noob",
    version: "1.0",
    role: 1,
    author: "unknown_pro",
    description: "__",
    category: "owner",
    guide: "{pn} on - enable\n{pn} off - disable\n{pn} find <name> - search user\nTag or reply target user",
    coolDown: 10
  },

  toggle: false,
  timers: [],

  insults: [
    `You’re as useless as the 'ueue' in 'queue', {name}.`,
    `Calling you an idiot would be an insult to stupid people, {name}.`,
    `Dogs are loyal, unlike you, {name}.`,
    `If you were any slower, you'd be moving backwards, {name}.`,
    `You're the reason they put directions on shampoo bottles, {name}.`,
    `Your secrets are safe with me. I never even listen when you talk, {name}.`,
    `You're like a cloud. When you disappear, it's a beautiful day, {name}.`,
    `You bring everyone so much joy… when you leave the room, {name}.`,
    `You're as sharp as a marble, {name}.`,
    `Some drink from the fountain of knowledge; you only gargled, {name}.`,
    `You have something on your chin… no, the third one down, {name}.`,
    `If I wanted to kill myself, I’d climb your ego and jump to your IQ, {name}.`,
    `You're about as useful as a screen door on a submarine, {name}.`,
    `If you were any more inbred, you’d be a sandwich, {name}.`,
    `You're as bright as a black hole, {name}.`,
    `You're the human version of a participation trophy, {name}.`,
    `If laughter is the best medicine, your face must be curing the world, {name}.`,
    `You're proof that evolution can go in reverse, {name}.`,
    `You have the perfect face for radio, {name}.`,
    `You're like a software update – whenever I see you, I think, 'Not now.', {name}.`,
    `You bring everyone so much happiness… when you log off, {name}.`,
    `You're like a puzzle with half the pieces missing, {name}.`,
    `If stupidity were an Olympic sport, you’d win gold, {name}.`,
    `You're as useless as a chocolate teapot, {name}.`,
    `Your brain's so small, it’s a miracle you can tie your shoes, {name}.`,
    `You’re the reason no one trusts mirrors, {name}.`,
    `You are as pointless as a broken pencil, {name}.`,
    `Your gene pool could use a little chlorine, {name}.`,
    `You're the kind of person who would trip over a cordless phone, {name}.`,
    `You're the human equivalent of a typo, {name}.`,
    `You're as fake as your personality, {name}.`,
    `You're as sharp as a bowling ball, {name}.`,
    `If ignorance is bliss, you must be the happiest person alive, {name}.`,
    `You're a gray sprinkle on a rainbow cupcake, {name}.`,
    `You're as useless as an ashtray on a motorcycle, {name}.`,
    `You’re like a slinky, not really good for anything but you bring a smile when pushed down the stairs, {name}.`,
    `You're the reason they put instructions on the back of shampoo bottles, {name}.`,
    `You’re about as useful as a knitted condom, {name}.`,
    `You're like a broken pencil: pointless, {name}.`,
    `You have the charisma of a damp rag, {name}.`,
    `You have the social skills of a rock, {name}.`,
    `You’re about as useful as a screen door on a submarine, {name}.`,
    `Your face makes onions cry, {name}.`,
    `You're the king of bad decisions, {name}.`,
    `If stupidity was a crime, you’d be serving a life sentence, {name}.`,
    `Your birth certificate is an apology letter from the condom factory, {name}.`,
    `You're a few fries short of a Happy Meal, {name}.`,
    `You have the elegance of a hippo on roller skates, {name}.`,
    `You're about as useful as a chocolate teapot, {name}.`,
    `You’re as sharp as a marble, {name}.`,
    `You're like a cloud — when you disappear, it’s a better day, {name}.`,
    `You're the human equivalent of a participation award, {name}.`,
    `If your brain was dynamite, there wouldn’t be enough to blow your hat off, {name}.`,
    `You're the reason behind the phrase ‘don’t try this at home’, {name}.`,
    `You're as charming as a rattlesnake, {name}.`,
    `Your IQ is lower than room temperature, {name}.`,
    `You're the definition of 'trainwreck', {name}.`,
    `You bring everyone so much joy… when you leave the room, {name}.`,
    `You're the reason why the gene pool needs a lifeguard, {name}.`,
    `You have the personality of a damp sponge, {name}.`,
    `You're as welcome as a fart in an elevator, {name}.`,
    `You're about as sharp as a marble, {name}.`,
    `You're the human equivalent of a broken pencil—pointless, {name}.`,
    `You have the charm of a dead fish, {name}.`,
    `You’re the reason there’s a warning label on everything, {name}.`,
    `You’re like a light bulb that's burned out, {name}.`,
    `You have the personality of stale bread, {name}.`,
    `You're as bright as a blackout, {name}.`,
    `You’re the human equivalent of a dial tone, {name}.`,
    `You’re the king of bad decisions, {name}.`,
    `You’re about as useful as a knitted condom, {name}.`,
    `Your brain’s so small, it needs a microscope, {name}.`,
    `You're as annoying as a mosquito in a sleeping bag, {name}.`,
    `You have the charisma of wet cardboard, {name}.`,
    `You’re the reason they invented earplugs, {name}.`,
    `You're like a broken compass — always lost, {name}.`,
    `You're the human version of a software bug, {name}.`,
    `You're about as useful as a screen door on a submarine, {name}.`,
    `You're as charming as a porcupine, {name}.`,
    `You bring everyone so much happiness… when you log off, {name}.`,
    `You're as useless as a chocolate teapot, {name}.`,
    `You're the reason why no one trusts mirrors, {name}.`,
    `You're as dull as dishwater, {name}.`,
    `You’re about as bright as a black hole, {name}.`,
    `You have the grace of a drunk elephant, {name}.`,
    `You're the human equivalent of a participation trophy, {name}.`,
    `You're as sharp as a marble, {name}.`,
    `You’re the reason behind the phrase ‘don’t try this at home’, {name}.`,
    `You’re as bright as a blackout, {name}.`,
    `You're like a puzzle with half the pieces missing, {name}.`,
    `You're the definition of trainwreck, {name}.`,
    `You're as charming as a rattlesnake, {name}.`
  ],

  onStart: async function ({ api, args, event, Users }) {
    const { threadID, messageID, senderID, mentions } = event;
    const ownerID = "100058371606434";

    if (senderID !== ownerID) return;

    const sub = args[0]?.toLowerCase();

    if (sub === "on") {
      this.toggle = true;
      return api.sendMessage("✅ Attack mode ON", threadID);
    }

    if (sub === "off") {
      this.toggle = false;
      this.timers.forEach(t => clearTimeout(t));
      this.timers = [];
      return api.sendMessage("I'll keep quiet for now. ", threadID);
    }

    if (sub === "find") {
      if (args.length < 2) return api.sendMessage("Enter a name to search.", threadID, messageID);
      const input = args.slice(1).join(" ").toLowerCase();
      const threadInfo = await api.getThreadInfo(threadID);
      let targetUsers = [];

      for (const user of threadInfo.userInfo) {
        if (user.name && user.name.toLowerCase().includes(input)) {
          targetUsers.push({ id: user.id, name: user.name });
        }
      }

      if (targetUsers.length === 0) return api.sendMessage("No users matched.", threadID, messageID);
      if (targetUsers.length > 15) return api.sendMessage("⚠ Too many matches, please be more specific.", threadID, messageID);

      let text = `🎯 ${targetUsers.length} user(s) found:\n`;
      targetUsers.forEach((user, i) => {
        text += `${i + 1}. ${user.name}\n`;
      });

      return api.sendMessage(text, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "select",
          targetUsers
        });
      });
    }

    if (!this.toggle) return api.sendMessage(" mode is OFF.", threadID);

    let targetID, targetName;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      try {
        targetName = await Users.getNameUser(targetID);
      } catch {
        const info = await api.getUserInfo(targetID);
        targetName = info[targetID]?.name || "Unknown";
      }
    } else {
      return;
    }

    if (!targetID) return;

    this.startInsultSpam(api, threadID, targetID, targetName);
  },

  startInsultSpam(api, threadID, targetID, targetName) {
    if (!this.toggle) return;
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    let delay = 0;

    for (let i = 0; i < this.insults.length; i++) {
      if (!this.toggle) break;
      const text = this.insults[i].replace(/{name}/g, targetName);
      this.timers.push(setTimeout(() => {
        api.sendMessage({
          body: text,
          mentions: [{ id: targetID, tag: targetName }]
        }, threadID);
      }, delay));
      delay += 3500;
    }
  },

  onReply: async function ({ event, api, Reply, Users }) {
    if (Reply.type !== "select") return;
    const { threadID, messageID, body, senderID } = event;
    const ownerID = "100058371606434";
    if (senderID !== ownerID) return;

    if (!body || isNaN(body)) return api.sendMessage("⚠ Reply with the number from the list.", threadID, messageID);

    const index = parseInt(body) - 1;
    const targetUsers = Reply.targetUsers;

    if (index < 0 || index >= targetUsers.length) return api.sendMessage("⚠ Invalid selection.", threadID, messageID);

    const user = targetUsers[index];

    api.sendMessage({
      body: `🧟‍♂️ noob selected: ${user.name}`,
      mentions: [{ tag: user.name, id: user.id }]
    }, threadID);

    this.startInsultSpam(api, threadID, user.id, user.name);
  }
};
