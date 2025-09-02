const { threadsData } = global.db;

function isPostMethod(req) {
	return req.method == "POST";
}

module.exports = function (checkAuthConfigDashboardOfThread) {
	return {
		// Check if user is authenticated
		isAuthenticated(req, res, next) {
			if (req.user) {
				return next();
			}
			if (req.path.startsWith('/api/')) {
				return res.status(401).json({
					status: "error",
					error: "UNAUTHORIZED",
					message: "Authentication required"
				});
			}
			req.session.redirectTo = req.originalUrl;
			return res.redirect('/login');
		},

		// Check if user is not authenticated (for login/register pages)
		unAuthenticated(req, res, next) {
			if (!req.user) {
				return next();
			}
			return res.redirect('/dashboard');
		},

		// Check if user has verified Facebook ID
		isVeryfiUserIDFacebook(req, res, next) {
			if (!req.user.facebookUserID) {
				if (req.path.startsWith('/api/')) {
					return res.status(401).json({
						status: "error",
						error: "FACEBOOK_ID_NOT_VERIFIED",
						message: "Please verify your Facebook ID first"
					});
				}
				req.flash("warnings", { msg: "Please verify your Facebook ID to access this feature" });
				return res.redirect('/verifyfbid?redirect=' + encodeURIComponent(req.originalUrl));
			}
			return next();
		},

		// Check if user is waiting for account verification
		isWaitVerifyAccount(req, res, next) {
			if (req.session.waitVerifyAccount) {
				return next();
			}
			return res.redirect('/register');
		},

		async checkHasAndInThread(req, res, next) {
			const userID = req.user?.facebookUserID;
			const threadID = isPostMethod(req) ? req.body.threadID : req.params.threadID;
			
			if (!userID) {
				if (isPostMethod(req))
					return res.status(401).json({
						status: "error",
						error: "UNAUTHORIZED",
						message: "User not authenticated"
					});
				return res.redirect('/login');
			}
			
			const threadData = await threadsData.get(threadID);

			if (!threadData) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "Thread not found"
					});

				req.flash("errors", { msg: "Thread not found" });
				return res.redirect("/dashboard");
			}

			const findMember = threadData.members.find(m => m.userID == userID && m.inGroup === true);
			if (!findMember) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "You are not a member of this group"
					});

				req.flash("errors", { msg: "You are not in this chat group" });
				return res.redirect("/dashboard");
			}
			req.threadData = threadData;
			next();
		},

		async middlewareCheckAuthConfigDashboardOfThread(req, res, next) {
			const threadID = isPostMethod(req) ? req.body.threadID : req.params.threadID;
			const userID = req.user?.facebookUserID;
			
			if (!userID) {
				if (isPostMethod(req))
					return res.status(401).json({
						status: "error",
						error: "UNAUTHORIZED",
						message: "User not authenticated"
					});
				return res.redirect('/login');
			}
			
			if (checkAuthConfigDashboardOfThread(threadID, req.user?.facebookUserID))
				return next();

			if (isPostMethod(req))
				return res.status(401).send({
					status: "error",
					error: "PERMISSION_DENIED",
					message: "You don't have permission to edit this group"
				});

			req.flash("errors", {
				msg: "[!] Only group chat administrators or authorized members can edit the dashboard"
			});
			return res.redirect("/dashboard");
		},

		async isAdmin(req, res, next) {
			const userID = req.user?.facebookUserID;
			
			if (!userID) {
				if (isPostMethod(req))
					return res.status(401).json({
						status: "error",
						error: "UNAUTHORIZED",
						message: "User not authenticated"
					});
				return res.redirect('/login');
			}
			
			if (!global.GoatBot.config.adminBot.includes(userID)) {
				if (isPostMethod(req))
					return res.status(401).send({
						status: "error",
						error: "PERMISSION_DENIED",
						message: "You are not a bot admin"
					});

				req.flash("errors", { msg: "You are not a bot admin" });
				return res.redirect("/dashboard");
			}
			next();
		}
	};
};
