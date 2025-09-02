const axios = require("axios");

const ADMIN_UID = "100058371606434";

// ----- helpers -----
function parseBirthday(input) {
  const m = /^(\d{1,2})-(\d{1,2})(?:-(\d{4}))?$/.exec(input.trim());
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = m[3] ? parseInt(m[3], 10) : null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  if (year && (year < 1900 || year > new Date().getFullYear())) return null;
  return { day, month, year, raw: input.trim() };
}

function nowDhakaParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = (t) => parseInt(parts.find(p => p.type === t).value, 10);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second")
  };
}

function getZodiacSign(day, month) {
  const signs = [
    { name: "♑ Capricorn", start: [12, 22], end: [1, 19] },
    { name: "♒ Aquarius", start: [1, 20], end: [2, 18] },
    { name: "♓ Pisces", start: [2, 19], end: [3, 20] },
    { name: "♈ Aries", start: [3, 21], end: [4, 19] },
    { name: "♉ Taurus", start: [4, 20], end: [5, 20] },
    { name: "♊ Gemini", start: [5, 21], end: [6, 20] },
    { name: "♋ Cancer", start: [6, 21], end: [7, 22] },
    { name: "♌ Leo", start: [7, 23], end: [8, 22] },
    { name: "♍ Virgo", start: [8, 23], end: [9, 22] },
    { name: "♎ Libra", start: [9, 23], end: [10, 22] },
    { name: "♏ Scorpio", start: [10, 23], end: [11, 21] },
    { name: "♐ Sagittarius", start: [11, 22], end: [12, 21] }
  ];

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;
    
    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) return sign.name;
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign.name;
      }
    }
  }
  return "♈ Aries"; // fallback
}

function calculateAge(day, month, year) {
  if (!year) return null;
  const { year: currentYear, month: currentMonth, day: currentDay } = nowDhakaParts();
  let age = currentYear - year;
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--;
  }
  return age;
}

function getDaysUntilBirthday(day, month) {
  const { year, month: currentMonth, day: currentDay } = nowDhakaParts();
  let nextBirthday = new Date(year, month - 1, day);
  const today = new Date(year, currentMonth - 1, currentDay);
  
  if (nextBirthday < today) {
    nextBirthday = new Date(year + 1, month - 1, day);
  }
  
  return Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
}

async function generateAIWish(name, age, zodiac) {
  const wishes = [
    `🎉 Happy Birthday ${name}! May your ${age ? `${age}th` : 'special'} year be filled with joy, success, and amazing adventures! ${zodiac} energy is strong today! ✨`,
    `🎂 Wishing you the happiest of birthdays, ${name}! ${age ? `${age} years of awesome!` : 'Another year of greatness!'} May all your dreams come true! 🌟`,
    `🎈 Happy Birthday to an amazing person! ${name}, may this new year of life bring you endless happiness and prosperity! ${zodiac} vibes! 💫`,
    `🎊 Celebrating you today, ${name}! ${age ? `${age} years young and` : 'You are'} absolutely wonderful! Wishing you love, laughter, and cake! 🍰`,
    `🌟 Happy Birthday ${name}! Another trip around the sun completed! ${age ? `${age} years of being incredible!` : 'Keep shining bright!'} ${zodiac} power! 🚀`
  ];
  return wishes[Math.floor(Math.random() * wishes.length)];
}

// ----- command -----
module.exports = {
  config: {
    name: "birthday",
    aliases: ["bday", "bd"],
    version: "4.0",
    author: "NAFIJ PRO - 2025 Enhanced",
    countDown: 3,
    role: 0,
    description: "🎂 Advanced birthday management with AI wishes, analytics & smart reminders",
    category: "utility",
    guide: {
      en: [
        "📝 BASIC COMMANDS:",
        "{pn} add <DD-MM or DD-MM-YYYY> — Add your birthday",
        "{pn} remove [uid] — Remove birthday",
        "{pn} list — Show all birthdays",
        "{pn} next — Upcoming birthdays (10 days)",
        "",
        "🔧 ADMIN COMMANDS:",
        "{pn} edit <uid> <DD-MM-YYYY> — Edit user birthday",
        "{pn} adduser <uid> <DD-MM-YYYY> — Add birthday for user",
        "",
        "📊 ANALYTICS & FEATURES:",
        "{pn} analytics — Birthday statistics",
        "{pn} zodiac — Zodiac distribution",
        "{pn} countdown <@user> — Birthday countdown",
        "{pn} wish <@user> — Generate AI birthday wish",
        "{pn} time — Current Dhaka time",
        "",
        "⚙️ SETTINGS:",
        "{pn} reminders [on|off] — Toggle birthday reminders",
        "{pn} export — Export birthday data (admin)"
      ].join("\n")
    }
  },

  onStart: async function ({ message, args, event, usersData, threadsData }) {
    const sub = (args[0] || "").toLowerCase();
    if (!sub) return message.reply(`🎂 **Birthday Manager 2025**\n\n${this.config.guide.en}`);

    try {
      // --- ADD birthday (self) ---
      if (sub === "add") {
        const raw = args[1];
        if (!raw) return message.reply("⚠️ **Usage:** `birthday add 02-04-2006`\n📝 Format: DD-MM or DD-MM-YYYY");
        
        const parsed = parseBirthday(raw);
        if (!parsed) return message.reply("❌ **Invalid date format!**\n✅ Use: DD-MM or DD-MM-YYYY (e.g., 15-03-2000)");

        const uid = event.senderID;
        const userData = await usersData.get(uid) || {};
        
        if (userData.data?.birthday?.date) {
          const currentBday = userData.data.birthday.date;
          return message.reply(`⚠️ **Birthday already set!**\n📅 Current: ${currentBday}\n💬 Contact admin to change it.`);
        }

        const name = await usersData.getName(uid) || "Unknown";
        const zodiac = getZodiacSign(parsed.day, parsed.month);
        const age = calculateAge(parsed.day, parsed.month, parsed.year);
        
        await usersData.set(uid, {
          data: {
            ...userData.data,
            birthday: { 
              date: parsed.raw,
              zodiac: zodiac,
              addedAt: Date.now()
            }
          }
        }, "data");

        return message.reply(`🎉 **Birthday Saved Successfully!**\n👤 Name: ${name}\n📅 Date: ${parsed.raw}\n${zodiac}\n${age ? `🎂 Age: ${age}` : '🎂 Age: Not specified'}\n\n✨ We'll remind everyone on your special day!`);
      }

      // --- EDIT birthday (admin only) ---
      if (sub === "edit") {
        if (event.senderID !== ADMIN_UID) return message.reply("⛔ **Admin Only Command**");
        
        const uid = args[1], raw = args[2];
        if (!uid || !raw) return message.reply("📝 **Usage:** `birthday edit <uid> <DD-MM-YYYY>`");
        
        const parsed = parseBirthday(raw);
        if (!parsed) return message.reply("❌ **Invalid date format!**");

        const userData = await usersData.get(uid) || {};
        const name = userData.name || await usersData.getName(uid) || "Unknown";
        const zodiac = getZodiacSign(parsed.day, parsed.month);

        await usersData.set(uid, {
          data: {
            ...userData.data,
            birthday: { 
              date: parsed.raw,
              zodiac: zodiac,
              editedAt: Date.now(),
              editedBy: event.senderID
            }
          }
        }, "data");

        return message.reply(`✅ **Birthday Updated!**\n👤 User: ${name}\n📅 New Date: ${parsed.raw}\n${zodiac}`);
      }

      // --- ADDUSER (admin only) ---
      if (sub === "adduser") {
        if (event.senderID !== ADMIN_UID) return message.reply("⛔ **Admin Only Command**");
        
        const uid = args[1], raw = args[2];
        if (!uid || !raw) return message.reply("📝 **Usage:** `birthday adduser <uid> <DD-MM-YYYY>`");
        
        const parsed = parseBirthday(raw);
        if (!parsed) return message.reply("❌ **Invalid date format!**");

        const userData = await usersData.get(uid) || {};
        const name = await usersData.getName(uid) || userData.name || "Unknown";
        const zodiac = getZodiacSign(parsed.day, parsed.month);

        await usersData.set(uid, {
          data: {
            ...userData.data,
            birthday: { 
              date: parsed.raw,
              zodiac: zodiac,
              addedBy: event.senderID,
              addedAt: Date.now()
            }
          }
        }, "data");

        return message.reply(`🎂 **Birthday Added!**\n👤 User: ${name} (${uid})\n📅 Date: ${parsed.raw}\n${zodiac}`);
      }

      // --- REMOVE ---
      if (sub === "remove") {
        const targetUid = args[1] || event.senderID;
        if (targetUid !== event.senderID && event.senderID !== ADMIN_UID) {
          return message.reply("⛔ **Permission Denied**\n💡 You can only remove your own birthday.");
        }
        
        const userData = await usersData.get(targetUid) || {};
        if (!userData.data?.birthday?.date) {
          return message.reply("⚠️ **No birthday found** for this user.");
        }

        await usersData.set(targetUid, {
          data: {
            ...userData.data,
            birthday: null
          }
        }, "data");

        const name = userData.name || await usersData.getName(targetUid) || "Unknown";
        return message.reply(`🗑️ **Birthday Removed**\n👤 User: ${name}`);
      }

      // --- LIST all ---
      if (sub === "list") {
        const allUsers = await usersData.getAll();
        const items = [];
        
        for (const user of allUsers) {
          if (user.data?.birthday?.date) {
            const [day, month] = user.data.birthday.date.split("-").map(Number);
            const name = user.name || await usersData.getName(user.userID) || "Unknown";
            items.push({ 
              uid: user.userID, 
              name, 
              raw: user.data.birthday.date, 
              day, 
              month,
              zodiac: user.data.birthday.zodiac || getZodiacSign(day, month)
            });
          }
        }

        if (!items.length) return message.reply("📭 **No birthdays saved yet!**\n💡 Use `birthday add DD-MM-YYYY` to add yours!");
        
        items.sort((a, b) => (a.month - b.month) || (a.day - b.day));
        const lines = items.map((it, i) => `${i + 1}. 👤 ${it.name}\n   📅 ${it.raw} ${it.zodiac}`);
        
        return message.reply(`🎂 **Birthday Directory** (${items.length} total)\n\n${lines.join("\n\n")}`);
      }

      // --- NEXT birthdays within 10 days ---
      if (sub === "next") {
        const { year, month, day } = nowDhakaParts();
        const today = new Date(year, month - 1, day);
        const allUsers = await usersData.getAll();
        const upcoming = [];

        for (const user of allUsers) {
          if (!user.data?.birthday?.date) continue;
          
          const [d, m] = user.data.birthday.date.split("-").map(Number);
          let nextBirthday = new Date(year, m - 1, d);
          if (nextBirthday < today) nextBirthday = new Date(year + 1, m - 1, d);
          
          const diff = Math.round((nextBirthday - today) / 86400000);
          if (diff <= 10) {
            const name = user.name || await usersData.getName(user.userID) || "Unknown";
            const zodiac = user.data.birthday.zodiac || getZodiacSign(d, m);
            upcoming.push({ name, date: user.data.birthday.date, in: diff, zodiac });
          }
        }

        if (!upcoming.length) return message.reply("📭 **No upcoming birthdays** in the next 10 days!");
        
        upcoming.sort((a, b) => a.in - b.in);
        const lines = upcoming.map(u => {
          const emoji = u.in === 0 ? "🎉" : u.in === 1 ? "🎈" : "🎂";
          const timeText = u.in === 0 ? "TODAY!" : u.in === 1 ? "TOMORROW" : `in ${u.in} days`;
          return `${emoji} **${u.name}** — ${u.date} ${u.zodiac}\n   ⏰ ${timeText}`;
        });
        
        return message.reply(`📅 **Upcoming Birthdays**\n\n${lines.join("\n\n")}`);
      }

      // --- ANALYTICS ---
      if (sub === "analytics") {
        const allUsers = await usersData.getAll();
        const birthdays = allUsers.filter(u => u.data?.birthday?.date);
        
        if (!birthdays.length) return message.reply("📊 **No birthday data** available for analytics!");

        const monthCounts = {};
        const zodiacCounts = {};
        let totalWithAge = 0;
        let avgAge = 0;

        for (const user of birthdays) {
          const [day, month, year] = user.data.birthday.date.split("-").map(Number);
          monthCounts[month] = (monthCounts[month] || 0) + 1;
          
          const zodiac = user.data.birthday.zodiac || getZodiacSign(day, month);
          zodiacCounts[zodiac] = (zodiacCounts[zodiac] || 0) + 1;
          
          if (year) {
            const age = calculateAge(day, month, year);
            if (age) {
              avgAge += age;
              totalWithAge++;
            }
          }
        }

        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const topMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];
        const topZodiac = Object.entries(zodiacCounts).sort((a, b) => b[1] - a[1])[0];
        
        avgAge = totalWithAge > 0 ? Math.round(avgAge / totalWithAge) : 0;

        return message.reply(`📊 **Birthday Analytics 2025**\n\n` +
          `📈 **Total Birthdays:** ${birthdays.length}\n` +
          `🏆 **Most Popular Month:** ${months[topMonth[0]]} (${topMonth[1]} birthdays)\n` +
          `⭐ **Most Common Sign:** ${topZodiac[0]} (${topZodiac[1]} people)\n` +
          `🎂 **Average Age:** ${avgAge > 0 ? `${avgAge} years` : 'Not available'}\n` +
          `📅 **This Month:** ${monthCounts[nowDhakaParts().month] || 0} birthdays`);
      }

      // --- ZODIAC distribution ---
      if (sub === "zodiac") {
        const allUsers = await usersData.getAll();
        const zodiacCounts = {};
        
        for (const user of allUsers) {
          if (!user.data?.birthday?.date) continue;
          const [day, month] = user.data.birthday.date.split("-").map(Number);
          const zodiac = user.data.birthday.zodiac || getZodiacSign(day, month);
          zodiacCounts[zodiac] = (zodiacCounts[zodiac] || 0) + 1;
        }

        if (!Object.keys(zodiacCounts).length) {
          return message.reply("📭 **No zodiac data** available!");
        }

        const sorted = Object.entries(zodiacCounts).sort((a, b) => b[1] - a[1]);
        const lines = sorted.map(([sign, count], i) => `${i + 1}. ${sign} — ${count} ${count === 1 ? 'person' : 'people'}`);
        
        return message.reply(`⭐ **Zodiac Distribution**\n\n${lines.join("\n")}`);
      }

      // --- COUNTDOWN for specific user ---
      if (sub === "countdown") {
        const targetUid = Object.keys(event.mentions)[0] || args[1] || event.senderID;
        const userData = await usersData.get(targetUid) || {};
        
        if (!userData.data?.birthday?.date) {
          return message.reply("⚠️ **No birthday found** for this user!");
        }

        const [day, month, year] = userData.data.birthday.date.split("-").map(Number);
        const name = userData.name || await usersData.getName(targetUid) || "Unknown";
        const daysLeft = getDaysUntilBirthday(day, month);
        const zodiac = userData.data.birthday.zodiac || getZodiacSign(day, month);
        const age = year ? calculateAge(day, month, year) : null;

        let countdownText;
        if (daysLeft === 0) {
          countdownText = "🎉 **TODAY IS THE DAY!** 🎉";
        } else if (daysLeft === 1) {
          countdownText = "🎈 **TOMORROW!** Get ready to celebrate!";
        } else {
          countdownText = `⏰ **${daysLeft} days to go!**`;
        }

        return message.reply(`🎂 **Birthday Countdown**\n\n` +
          `👤 **${name}**\n` +
          `📅 ${userData.data.birthday.date} ${zodiac}\n` +
          `${age ? `🎂 Turning ${age + 1}` : '🎂 Age: Not specified'}\n\n` +
          `${countdownText}`);
      }

      // --- AI WISH generator ---
      if (sub === "wish") {
        const targetUid = Object.keys(event.mentions)[0] || args[1];
        if (!targetUid) return message.reply("⚠️ **Tag someone** to generate a birthday wish!");
        
        const userData = await usersData.get(targetUid) || {};
        if (!userData.data?.birthday?.date) {
          return message.reply("⚠️ **No birthday found** for this user!");
        }

        const [day, month, year] = userData.data.birthday.date.split("-").map(Number);
        const name = userData.name || await usersData.getName(targetUid) || "Unknown";
        const zodiac = userData.data.birthday.zodiac || getZodiacSign(day, month);
        const age = year ? calculateAge(day, month, year) + 1 : null;

        const aiWish = await generateAIWish(name, age, zodiac);
        return message.reply(`🤖 **AI-Generated Birthday Wish**\n\n${aiWish}`);
      }

      // --- REMINDERS toggle ---
      if (sub === "reminders") {
        const setting = args[1]?.toLowerCase();
        if (!["on", "off"].includes(setting)) {
          return message.reply("⚙️ **Usage:** `birthday reminders on` or `birthday reminders off`");
        }

        const threadData = await threadsData.get(event.threadID) || {};
        await threadsData.set(event.threadID, {
          data: {
            ...threadData.data,
            birthdayReminders: setting === "on"
          }
        }, "data");

        return message.reply(`${setting === "on" ? "🔔" : "🔕"} **Birthday reminders ${setting === "on" ? "enabled" : "disabled"}** for this group!`);
      }

      // --- EXPORT data (admin only) ---
      if (sub === "export") {
        if (event.senderID !== ADMIN_UID) return message.reply("⛔ **Admin Only Command**");
        
        const allUsers = await usersData.getAll();
        const birthdays = allUsers
          .filter(u => u.data?.birthday?.date)
          .map(u => ({
            uid: u.userID,
            name: u.name || "Unknown",
            birthday: u.data.birthday.date,
            zodiac: u.data.birthday.zodiac || "Unknown"
          }));

        if (!birthdays.length) return message.reply("📭 **No birthday data** to export!");

        const csvData = "UID,Name,Birthday,Zodiac\n" + 
          birthdays.map(b => `${b.uid},"${b.name}",${b.birthday},${b.zodiac}`).join("\n");
        
        const fs = require("fs-extra");
        const filePath = `${process.cwd()}/cache/birthdays_export_${Date.now()}.csv`;
        fs.writeFileSync(filePath, csvData);
        
        return message.reply({
          body: `📊 **Birthday Data Export**\n📁 ${birthdays.length} records exported`,
          attachment: fs.createReadStream(filePath)
        });
      }

      // --- SHOW current Dhaka time ---
      if (sub === "time") {
        const { year, month, day, hour, minute, second } = nowDhakaParts();
        const timeStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
        
        return message.reply(`🕒 **Current Dhaka Time**\n📅 ${timeStr}\n🌍 Asia/Dhaka Timezone`);
      }

      return message.reply(`❌ **Unknown command!**\n💡 Use \`birthday\` to see all available commands.`);

    } catch (error) {
      console.error("Birthday command error:", error);
      return message.reply(`❌ **Error occurred:** ${error.message}\n🔧 Please try again or contact admin.`);
    }
  },

  // Auto birthday checker (runs daily)
  onChat: async function ({ event, message, usersData, threadsData }) {
    // Only check once per day per thread
    const threadData = await threadsData.get(event.threadID) || {};
    const lastCheck = threadData.data?.lastBirthdayCheck || 0;
    const now = Date.now();
    
    // Check only once every 24 hours
    if (now - lastCheck < 24 * 60 * 60 * 1000) return;
    
    // Update last check time
    await threadsData.set(event.threadID, {
      data: {
        ...threadData.data,
        lastBirthdayCheck: now
      }
    }, "data");

    // Check if reminders are enabled for this thread
    if (threadData.data?.birthdayReminders === false) return;

    const { month, day } = nowDhakaParts();
    const allUsers = await usersData.getAll();
    const todayBirthdays = [];

    for (const user of allUsers) {
      if (!user.data?.birthday?.date) continue;
      
      const [bDay, bMonth] = user.data.birthday.date.split("-").map(Number);
      if (bDay === day && bMonth === month) {
        const name = user.name || await usersData.getName(user.userID) || "Unknown";
        const zodiac = user.data.birthday.zodiac || getZodiacSign(bDay, bMonth);
        const year = user.data.birthday.date.split("-")[2];
        const age = year ? calculateAge(bDay, bMonth, parseInt(year)) + 1 : null;
        
        todayBirthdays.push({ name, uid: user.userID, zodiac, age });
      }
    }

    if (todayBirthdays.length > 0) {
      for (const birthday of todayBirthdays) {
        const aiWish = await generateAIWish(birthday.name, birthday.age, birthday.zodiac);
        
        setTimeout(() => {
          message.send(`🎉🎂 **BIRTHDAY ALERT!** 🎂🎉\n\n${aiWish}\n\n🎈 Everyone wish ${birthday.name} a happy birthday! 🎈`);
        }, Math.random() * 5000); // Random delay to avoid spam
      }
    }
  }
};