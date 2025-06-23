const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		// Check if the bot is in the inbox and anti inbox is enabled
		if (
			global.GoatBot.config.antiInbox == true &&
			(event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
			(event.senderID || event.userID || event.isGroup == false)
		)
			return;

		// Global ban check for threads
		// Global ban check for threads
const fs = require("fs");
const banPath = __dirname + "/cmds/cache/thread-manage.json";

if (fs.existsSync(banPath)) {
	const banData = JSON.parse(fs.readFileSync(banPath));
	const isBanned = banData.banList.some(t => t.id === event.threadID);
	if (isBanned) {
		// Block all types of events from banned groups
		if (["message", "message_reply", "message_reaction", "event"].includes(event.type)) {
			return api.sendMessage("", event.threadID);
		}
		return; // silently block other types
	}
}
//new ban cheek code end here

		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);
		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat)
			return;

		const {
			onAnyEvent, onFirstChat, onStart, onChat,
			onReply, onEvent, handlerEvent, onReaction,
			typ, presence, read_receipt
		} = handlerChat;


		onAnyEvent();
		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				onFirstChat();
				onChat();
				onStart();
				onReply();
				break;
			case "event":
				handlerEvent();
				onEvent();
				break;
			case "message_reaction":
				onReaction();


  const adminBotList = global.GoatBot.config.adminBot || [];

  if (["🚮", "☠️", "😈"].includes(event.reaction)) {
    if (adminBotList.includes(event.userID)) {
      api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
        if (err) return console.log(err);
      });
    } else {
      message.send("");
    }
  }

  if (["🙂", "😠", "😡", "🤬"].includes(event.reaction)) {
    if (event.senderID === api.getCurrentUserID()) {
      if (adminBotList.includes(event.userID)) {
        api.unsendMessage(event.messageID);
      } else {
        message.send("");
      }
    }
  }

				
				break;
			case "typ":
				typ();
				break;
			case "presence":
				presence();
				break;
			case "read_receipt":
				read_receipt();
				break;
			// case "friend_request_received":
			// { /* code block */ }
			// break;

			// case "friend_request_cancel"
			// { /* code block */ }
			// break;
			default:
				break;
		}
	};
};
