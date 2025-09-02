const stream = require("stream");
const express = require("express");
const path = require("path");
const mimeDB = require("mime-db");
const router = express.Router();

module.exports = function ({ isAuthenticated, isVeryfiUserIDFacebook, checkHasAndInThread, threadsData, drive, checkAuthConfigDashboardOfThread, usersData, createLimiter, middlewareCheckAuthConfigDashboardOfThread, isVideoFile }) {
	const apiLimiter = createLimiter(1000 * 60 * 5, 10);

	router
		// New 2025 Feature: Leave Group API
		.post("/thread/leave-group", [isAuthenticated, isVeryfiUserIDFacebook, apiLimiter], async function (req, res) {
			const { threadID } = req.body;
			const userID = req.user.facebookUserID;

			if (!threadID) {
				return res.status(400).json({
					status: "error",
					error: "THREAD_ID_REQUIRED",
					message: "Thread ID is required"
				});
			}

			try {
				const api = global.GoatBot?.fcaApi;
				if (!api) {
					return res.status(500).json({
						status: "error",
						error: "BOT_OFFLINE",
						message: "Bot is currently offline"
					});
				}

				// Check if user has permission (admin or authorized member)
				if (!checkAuthConfigDashboardOfThread(threadID, userID)) {
					return res.status(403).json({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "You don't have permission to make the bot leave this group"
					});
				}

				// Send goodbye message before leaving
				await api.sendMessage("👋 Bot is leaving this group as requested by an administrator. Thank you for using GoatBot!", threadID);
				
				// Wait a moment then leave
				setTimeout(async () => {
					try {
						await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
					} catch (leaveError) {
						console.error("Error leaving group:", leaveError);
					}
				}, 2000);

				return res.json({
					status: "success",
					message: "Bot will leave the group shortly"
				});
			} catch (error) {
				console.error("Leave group error:", error);
				return res.status(500).json({
					status: "error",
					error: "INTERNAL_ERROR",
					message: error.message || "An error occurred while leaving the group"
				});
			}
		})

		// New 2025 Feature: Bulk Group Management
		.post("/thread/bulk-action", [isAuthenticated, isVeryfiUserIDFacebook, apiLimiter], async function (req, res) {
			const { action, threadIDs } = req.body;
			const userID = req.user.facebookUserID;

			if (!action || !threadIDs || !Array.isArray(threadIDs)) {
				return res.status(400).json({
					status: "error",
					error: "INVALID_REQUEST",
					message: "Action and threadIDs array are required"
				});
			}

			// Only allow bot admins for bulk actions
			if (!global.GoatBot.config.adminBot.includes(userID)) {
				return res.status(403).json({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "Only bot administrators can perform bulk actions"
				});
			}

			try {
				const api = global.GoatBot?.fcaApi;
				if (!api) {
					return res.status(500).json({
						status: "error",
						error: "BOT_OFFLINE",
						message: "Bot is currently offline"
					});
				}

				const results = [];
				
				for (const threadID of threadIDs) {
					try {
						switch (action) {
							case "leave":
								await api.sendMessage("👋 Bot is leaving this group due to bulk management action.", threadID);
								setTimeout(() => api.removeUserFromGroup(api.getCurrentUserID(), threadID), 1000);
								results.push({ threadID, status: "success", message: "Left group" });
								break;
							case "archive":
								await api.changeArchivedStatus(threadID, true);
								results.push({ threadID, status: "success", message: "Archived thread" });
								break;
							case "unarchive":
								await api.changeArchivedStatus(threadID, false);
								results.push({ threadID, status: "success", message: "Unarchived thread" });
								break;
							default:
								results.push({ threadID, status: "error", message: "Unknown action" });
						}
					} catch (error) {
						results.push({ threadID, status: "error", message: error.message });
					}
				}

				return res.json({
					status: "success",
					results: results
				});
			} catch (error) {
				console.error("Bulk action error:", error);
				return res.status(500).json({
					status: "error",
					error: "INTERNAL_ERROR",
					message: "An error occurred during bulk action"
				});
			}
		})

		// Enhanced thread statistics API
		.get("/thread/stats/:threadID", [isAuthenticated, isVeryfiUserIDFacebook, checkHasAndInThread], async function (req, res) {
			const { threadID } = req.params;
			
			try {
				const threadData = await threadsData.get(threadID);
				const allUsers = await usersData.getAll();
				
				// Calculate thread statistics
				const threadMembers = threadData.members.filter(m => m.inGroup);
				const activeMembers = threadMembers.filter(m => m.count > 0);
				const totalMessages = threadMembers.reduce((sum, m) => sum + (m.count || 0), 0);
				
				// Gender distribution
				const genderStats = threadMembers.reduce((acc, member) => {
					const userData = allUsers.find(u => u.userID == member.userID);
					const gender = userData?.gender || 0;
					if (gender === 1) acc.female++;
					else if (gender === 2) acc.male++;
					else acc.unknown++;
					return acc;
				}, { male: 0, female: 0, unknown: 0 });

				// Activity stats
				const mostActiveUser = threadMembers.reduce((max, member) => 
					(member.count || 0) > (max.count || 0) ? member : max, threadMembers[0]);

				const stats = {
					threadName: threadData.threadName,
					totalMembers: threadMembers.length,
					activeMembers: activeMembers.length,
					totalMessages: totalMessages,
					averageMessages: Math.round(totalMessages / threadMembers.length) || 0,
					genderDistribution: genderStats,
					mostActiveUser: mostActiveUser ? {
						name: mostActiveUser.name,
						userID: mostActiveUser.userID,
						messageCount: mostActiveUser.count || 0
					} : null,
					createdAt: threadData.createdAt,
					lastActivity: threadData.updatedAt,
					settings: threadData.settings
				};

				return res.json({
					status: "success",
					data: stats
				});
			} catch (error) {
				console.error("Thread stats error:", error);
				return res.status(500).json({
					status: "error",
					error: "INTERNAL_ERROR",
					message: "Failed to get thread statistics"
				});
			}
		})

		.post("/delete/:slug", [isAuthenticated, isVeryfiUserIDFacebook, checkHasAndInThread, middlewareCheckAuthConfigDashboardOfThread, apiLimiter], async function (req, res) {
			const { fileIDs, threadID, location } = req.body;
			if (!fileIDs || !fileIDs.length)
				return res.status(400).send({
					status: "error",
					error: "FILE_ID_NOT_FOUND",
					message: "Please provide file IDs"
				});
			if (!threadID)
				return res.status(400).send({
					status: "error",
					error: "THREAD_ID_NOT_FOUND",
					message: "Please provide thread ID"
				});
			if (!location)
				return res.status(400).send({
					status: "error",
					error: "LOCATION_NOT_FOUND",
					message: "Please provide location"
				});
			if (!["data.welcomeAttachment", "data.leaveAttachment"].includes(location))
				return res.status(400).send({
					status: "error",
					error: "LOCATION_NOT_FOUND",
					message: "Location illegal"
				});

			const threadData = await threadsData.get(threadID);
			if (!threadData)
				return res.status(400).send({
					status: "error",
					error: "COULD_NOT_FOUND_THREAD",
					message: `Couldn\"t find thread data of thread ID ${threadID}`
				});

			let dataOfLocation = await threadsData.get(threadID, location);
			const fileIDsDeleted = [];

			const pendingDelete = fileIDs.map(async fileID => {
				try {
					const index = dataOfLocation.indexOf(fileID);
					if (index == -1)
						throw ({
							error: "FILE_ID_NOT_FOUND",
							message: `Couldn\"t find file ID ${fileID} in location ${location}`
						});

					await drive.deleteFile(fileID);
					fileIDsDeleted.push(fileID);
					return {
						id: fileID,
						status: "success"
					};
				}
				catch (err) {
					throw ({
						id: fileID,
						error: err.error,
						message: err.message
					});
				}
			});

			const successPromise = await Promise.allSettled(pendingDelete);
			dataOfLocation = dataOfLocation.filter(fileID => !fileIDsDeleted.includes(fileID));

			const success = successPromise
				.filter(item => item.status == "fulfilled")
				.map(({ value }) => value.id);
			const failed = successPromise
				.filter(item => item.status == "rejected")
				.map(({ reason }) => ({
					id: reason.id,
					error: reason.error,
					message: reason.message
				}));

			await threadsData.set(threadID, dataOfLocation, location);

			res.type("json").send(JSON.stringify({
				status: "success",
				success,
				failed
			}));
		})
		.post(
			"/upload/:type",
			[
				isAuthenticated,
				isVeryfiUserIDFacebook,
				checkHasAndInThread,
				apiLimiter
			],
			async function (req, res) {
				const { threadID, commandName } = req.body;
				const { type } = req.params;
				const userID = req.user.facebookUserID;

				if (!threadID)
					return res.status(400).json({
						status: "error",
						error: "THREAD_ID_NOT_FOUND",
						message: "Thread ID not found"
					});

				if (!commandName)
					return res.status(400).json({
						status: "error",
						error: "COMMAND_NAME_NOT_FOUND",
						message: "Command name not found"
					});

				if (!["welcomeAttachment", "leaveAttachment"].includes(type))
					return res.status(400).send({
						status: "error",
						error: "TYPE_ERROR",
						message: "type illegal"
					});

				if (!checkAuthConfigDashboardOfThread(threadID, userID))
					return res.status(400).json({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "You are not authorized to upload file in this thread"
					});

				let files = req.files;
				if (!files)
					return res.status(400).json({
						status: "error",
						error: "FILE_NOT_FOUND",
						message: "No files were uploaded."
					});

				let dataOfLocation = await threadsData.get(threadID, `data.${type}`, []);
				files = Object.values(files);
				if (files.length > 20) {
					return res.status(400).json({
						status: "error",
						error: "TOO_MANY_FILES",
						message: "You can only upload 20 files at a time"
					});
				}

				if (dataOfLocation.length + files.length > 20) {
					return res.status(400).json({
						status: "error",
						error: "TOO_MANY_FILES",
						message: "You can only upload 20 files, current files in this location is " + dataOfLocation.length
					});
				}

				let i = 0;

				const pendingUpload = files.reduce((arr, file) => {
					if (isVideoFile(file.mimetype)) {
						if (file.size > 83 * 1024 * 1024) {
							arr.push({
								count: i++,
								rootName: file.name,
								file: Promise.reject({
									error: "FILE_TOO_LARGE",
									message: "File too large, max size is 83MB"
								})
							});
							return arr;
						}
					}
					else {
						if (file.size > 25 * 1024 * 1024) {
							arr.push({
								count: i++,
								rootName: file.name,
								file: Promise.reject({
									error: "FILE_TOO_LARGE",
									message: "File too large, max size is 25MB"
								})
							});
							return arr;
						}
					}

					const bufferStream = new stream.PassThrough();
					bufferStream.end(file.data);
					const newFileName = `${commandName}_${threadID}_${userID}_${global.utils.getTime()}.${path.extname(file.name).split(".")[1] || mimeDB[file.mimetype]?.extensions?.[0] || "unknow"}`;
					arr.push({
						count: i++,
						rootName: file.name,
						file: drive.uploadFile(newFileName, bufferStream),
						newFileName
					});
					return arr;
				}, []);

				const success = [], failed = [];

				for (const item of pendingUpload) {
					try {
						const file = await item.file;
						success.push({
							// ...file,
							id: file.id,
							mimeType: file.mimeType,
							webContentLink: file.webContentLink,
							webViewLink: file.webViewLink,
							iconLink: file.iconLink,
							thumbnailLink: file.thumbnailLink,
							createdTime: file.createdTime,
							fileExtension: file.fileExtension,
							size: file.size,
							imageMediaMetadata: file.imageMediaMetadata || null,
							fullFileExtension: file.fullFileExtension,
							urlDownload: drive.getUrlDownload(file.id),
							rootName: item.rootName,
							count: item.count,
							newFileName: item.newFileName
						});
					}
					catch (err) {
						failed.push({
							error: err.error,
							message: err.message,
							rootName: item.rootName,
							count: item.count
						});
					}
				}

				const fileIDs = success.map(file => file.id);
				try {
					dataOfLocation = [...dataOfLocation, ...fileIDs];
					await threadsData.set(threadID, dataOfLocation, `data.${type}`);
				}
				catch (err) {
				}

				res.type("json").send(JSON.stringify({
					status: "success",
					success,
					failed
				}));
			}
		)

		.post("/thread/setData/:slug", [isAuthenticated, isVeryfiUserIDFacebook, checkHasAndInThread, apiLimiter], async function (req, res) {
			const { slug } = req.params;
			const { threadID, type } = req.body;
			if (!checkAuthConfigDashboardOfThread(threadID, req.user.facebookUserID))
				return res.status(400).json({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "Bạn không có quyền chỉnh sửa dữ liệu trong nhóm này"
				});
			const threadData = await threadsData.get(threadID);
			try {
				switch (slug) {
					case "welcomeAttachment":
					case "leaveAttachment": {
						const { attachmentIDs } = req.body;
						if (!threadData.data[slug])
							threadData.data[slug] = [];
						if (type === "add")
							threadData.data[slug].push(...attachmentIDs);
						else if (type === "delete")
							threadData.data[slug] = threadData.data[slug].filter(item => !attachmentIDs.includes(item));
						break;
					}
					case "welcomeMessage":
					case "leaveMessage": {
						const { message } = req.body;
						if (type === "update")
							threadData.data[slug] = message;
						else
							delete threadData.data[slug];
						break;
					}
					case "settings": {
						const { updateData } = req.body;
						for (const key in updateData)
							threadData.settings[key] = updateData[key] == "true";
						break;
					}
				}
			}
			catch (err) {
				return res.status(400).send({
					status: "error",
					error: "SERVER_ERROR",
					message: "Đã có lỗi xảy ra, vui lòng thử lại sau"
				});
			}

			try {
				await threadsData.set(threadID, threadData);
				res.json({
					status: "success"
				});
			}
			catch (e) {
				res.status(500).json({
					status: "error",
					error: "FAILED_TO_SAVE_DATA",
					message: "Đã có lỗi xảy ra, vui lòng thử lại sau"
				});
			}
		})
		.get("/getUserData", [isAuthenticated, isVeryfiUserIDFacebook], async (req, res) => {
			const uid = req.params.userID || req.user.facebookUserID;
			if (req.params.userID) {
				if (!req.user.isAdmin) {
					return res.status(401).send({
						status: "error",
						message: "Unauthorized"
					});
				}
			}

			let userData;
			try {
				userData = await usersData.get(uid);
				return res.status(200).send({
					status: "success",
					data: userData
				});
			}
			catch (e) {
				return res.status(500).send({
					status: "error",
					message: e.message
				});
			}
		})

	// .get("/getThreadsData/:userID", [isAuthenticated, isVeryfiUserIDFacebook], async (req, res) => {
	// 	if (!req.params.userID) {
	// 		return res.status(400).send({
	// 			status: "error",
	// 			message: "Bad request"
	// 		});
	// 	}
	// 	let allThread = await threadsData.getAll();
	// 	allThread = allThread.filter(t => t.members.some(m => m.userID == req.params.userID));
	// 	return res.status(200).send({
	// 		status: "success",
	// 		data: allThread
	// 	});
	// });

	return router;
};