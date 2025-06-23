const express = require('express');
const path = require('path');
const { spawn } = require("child_process");
const fs = require("fs");
const log = require("./logger/log.js");

const app = express();
const port = process.env.PORT || 3000;

const CACHE_DIR = path.join(__dirname, "cache");
const LOG_FILE = path.join(CACHE_DIR, "logs.txt");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
fs.writeFileSync(LOG_FILE, "", { flag: "a" });

const logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
let logLines = [];

// Override console.log to also store logs
const originalLog = console.log;
console.log = (...args) => {
  const message = args.map(x => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(" ");
  originalLog(message);
  logStream.write(message + "\n");
  logLines.push(message);
  if (logLines.length > 500) logLines.shift();
};

// Route: /test
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Route: /logs (viewer)
app.get("/logs", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GoatBot Logs</title>
        <style>
          body { background: #000; color: #0f0; font-family: monospace; padding: 10px; }
          #log { height: 80vh; overflow-y: auto; white-space: pre-wrap; border: 1px solid #444; padding: 10px; }
          button { background: #111; color: #0f0; border: 1px solid #0f0; padding: 5px 10px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <h3>📜 GoatBot Logs</h3>
        <div id="log">Loading...</div>
        <div>
          <button onclick="copyLogs()">📋 Copy</button>
          <a href="/logs_download" download><button>📥 Download</button></a>
          <button onclick="scrollToBottom()">⬇️ Bottom</button>
        </div>
        <script>
          const log = document.getElementById("log");
          fetch("/logs_download")
            .then(r => r.text())
            .then(t => {
              log.innerHTML = t.replace(/\\n/g, "<br>");
              log.scrollTop = log.scrollHeight;
            });

          function scrollToBottom() {
            log.scrollTop = log.scrollHeight;
          }

          function copyLogs() {
            const temp = document.createElement("textarea");
            temp.value = log.innerText;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand("copy");
            document.body.removeChild(temp);
            alert("✅ Logs copied!");
          }
        </script>
      </body>
    </html>
  `);
});

// Route: /logs_download (raw log data download)
app.get("/logs_download", (req, res) => {
  const text = logLines.join("\n");
  res.setHeader("Content-Disposition", "attachment; filename=logs.txt");
  res.setHeader("Content-Type", "text/plain");
  res.send(text);
});

// Start web server
app.listen(port, () => {
  console.log(`✅ Web server running at http://localhost:${port}`);
});

/**
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! If you do not download the source code from the above address, you are using an unknown version and at risk of having your account hacked
 *
 * English:
 * ! Please do not change the below code, it is very important for the project.
 * It is my motivation to maintain and develop the project for free.
 * ! If you change it, you will be banned forever
 * Thank you for using
 */

function startProject() {
	const child = spawn("node", ["Goat.js"], {
		cwd: __dirname,
		stdio: "inherit",
		shell: true
	});

	child.on("close", (code) => {
		if (code == 2) {
			log.info("Restarting Project...");
			startProject();
		}
	});
}

startProject();
