module.exports = {
	config: {
		name: "support",
		version: "1.0",
		author: "Loid Butter x nafij",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "📞 Request support"
		},
		longDescription: {
			en: "🆘 This command adds the user to the admin support group."
		},
		category: "support",
		guide: {
			en: "╔═════『 SUPPORT GUIDE 』═════╗\n\nTo get help, simply type: support\n\n╚════════════════════════════╝"
		}
	},

	onStart: async function ({ api, args, message, event }) {
		const supportGroupId = "9856539844435742"; // Replace with your actual support group ID

		const threadID = event.threadID;
		const userID = event.senderID;

		try {
			const threadInfo = await api.getThreadInfo(supportGroupId);
			const participantIDs = threadInfo.participantIDs;

			if (participantIDs.includes(userID)) {
				api.sendMessage(
					"✅ You are already in the support group!\n\nIf you can't find the conversation, please check your *message requests* or *spam box*.",
					threadID
				);
			} else {
				api.addUserToGroup(userID, supportGroupId, (err) => {
					if (err) {
						console.error("Error adding user to support group:", err);
						api.sendMessage(
							"⚠️ I couldn't add you to the group. This may be because:\n- Your account is private\n- You haven't messaged me yet\n\nPlease send me a message first and try again.",
							threadID
						);
					} else {
						api.sendMessage(
							"✅ You have been added to the *admin support group*!\n\nIf you don't see the chat, check your *message requests* or *spam folder*.",
							threadID
						);
					}
				});
			}
		} catch (err) {
			console.error("Failed to get thread info:", err);
			api.sendMessage("❌ An error occurred. Please try again later.", threadID);
		}
	}
};
