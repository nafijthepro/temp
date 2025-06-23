const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { google } = require("googleapis");
const mongoose = require("mongoose");

// ======== MongoDB Connection ========


// ======== Mongoose Schema & Model ========
const modelName = "Premium_picpro00";
const Premium = mongoose.models[modelName] || mongoose.model(modelName, new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  type: String,
  fileId: String,
  driveLink: String,
  uploader: String,
  timestamp: Number
}));

// ======== Google Drive Folder ID ========
const FOLDER_ID = "1v1nuOdXF0Djm7DWt2gWuCLxGMgH3Hwjg";

// ======== Google Service Account from env ========
if (!process.env.PREMIUM_CREDENTIALS)
  throw new Error("❌ PREMIUM_CREDENTIALS env variable is missing");

const serviceAccount = JSON.parse(process.env.PREMIUM_CREDENTIALS);

module.exports = {
  config: {
    name: "picpro00",
    version: "2.0",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upload, fetch, delete premium media" },
    category: "media",
    guide: {
      en: "{pn} add → reply with media\n{pn} → fetch random\n{pn} del <id(s)> → delete by ID"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const command = args[0]?.toLowerCase();

    try {
      // === Google Drive Auth ===
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ["https://www.googleapis.com/auth/drive"]
      });
      const drive = google.drive({ version: "v3", auth });

      // --- ADD MEDIA ---
      if (command === "add") {
        if (!messageReply?.attachments?.length)
          return api.sendMessage("⚠️ Reply to an image/video/audio to add.", threadID, messageID);

        const attachment = messageReply.attachments[0];
        const type = attachment.type;
        const extMap = { audio: "mp3", video: "mp4", photo: "jpg" };
        const ext = extMap[type] || "bin";
        const tempPath = path.join(__dirname, `temp.${ext}`);

        // Download media
        const res = await axios.get(attachment.url, { responseType: "stream" });
        const writer = fs.createWriteStream(tempPath);
        res.data.pipe(writer);
        await new Promise(resolve => writer.on("finish", resolve));

        // Upload to Google Drive
        const upload = await drive.files.create({
          resource: {
            name: `${Date.now()}.${ext}`,
            parents: [FOLDER_ID]
          },
          media: {
            mimeType: attachment.mimeType || "application/octet-stream",
            body: fs.createReadStream(tempPath)
          },
          fields: "id"
        });

        const fileId = upload.data.id;

        // Make public
        await drive.permissions.create({
          fileId,
          requestBody: { role: "reader", type: "anyone" }
        });

        // Save to DB with unique incremental ID
        const last = await Premium.findOne().sort({ id: -1 });
        const newId = last ? last.id + 1 : 1;
        const link = `https://drive.google.com/uc?id=${fileId}`;

        await Premium.create({
          id: newId,
          type,
          fileId,
          driveLink: link,
          uploader: senderID,
          timestamp: Date.now()
        });

        // Cleanup temp file
        fs.unlinkSync(tempPath);

        return api.sendMessage(`✅ File uploaded! ID: ${newId}`, threadID, messageID);
      }

      // --- DELETE MEDIA ---
      else if (command === "del" && args.length > 1) {
        const ids = args.slice(1).map(x => parseInt(x)).filter(Boolean);
        if (!ids.length)
          return api.sendMessage("❌ Provide valid ID(s) to delete.", threadID, messageID);

        const deleted = [];

        for (const id of ids) {
          const file = await Premium.findOne({ id });
          if (!file) continue;

          try {
            await drive.files.delete({ fileId: file.fileId });
          } catch (err) {
            console.warn(`⚠️ Drive delete failed for ID ${id}:`, err.message);
          }

          await Premium.deleteOne({ id });
          deleted.push(id);
        }

        return api.sendMessage(
          deleted.length ? `🗑️ Deleted ID(s): ${deleted.join(", ")}` : "❌ No matching files found.",
          threadID, messageID
        );
      }

      // --- FETCH RANDOM MEDIA ---
      else {
        const files = await Premium.find({});
        if (!files.length)
          return api.sendMessage("📂 No files in premium library yet.", threadID, messageID);

        const random = files[Math.floor(Math.random() * files.length)];

        if (!global.utils?.getStreamFromURL) {
          global.utils = global.utils || {};
          global.utils.getStreamFromURL = async (url) => {
            const res = await axios.get(url, { responseType: "stream" });
            return res.data;
          };
        }

        return api.sendMessage({
          body: `🎁 Here's your premium file (ID: ${random.id})`,
          attachment: await global.utils.getStreamFromURL(random.driveLink)
        }, threadID, messageID);
      }

    } catch (err) {
      console.error("💥 Error in picpro00 command:", err);
      return api.sendMessage(`❌ ERROR: ${err.message || err}`, threadID, messageID);
    }
  }
};
