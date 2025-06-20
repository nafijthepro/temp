const express = require('express');
const path = require('path');
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");
const log = require("./logger/log.js");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Ensure log storage
if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
const logPath = path.join(__dirname, "cache", "logs.txt");
fs.writeFileSync(logPath, "", { flag: "a" });
const logStream = fs.createWriteStream(logPath, { flags: "a" });

let clients = [];

const originalLog = console.log;
console.log = (...args) => {
  const logMsg = args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ");
  originalLog(logMsg);
  logStream.write(logMsg + "\n");
  clients.forEach(ws => ws.readyState === 1 && ws.send(logMsg));
};


//this project is created by ntkhang and i modified it for my easyness author @ntkhang.


// WebSocket for live logs
const wss = new WebSocket.Server({ server });
wss.on("connection", ws => {
  clients.push(ws);
  ws.send("[Connected] ✅ GoatBot log viewer active");
  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

// Route: /test
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Route: /logs viewer
app.get("/logs", (req, res) => {
  res.send(`
    <html><head><title>GoatBot Logs</title>
    <style>
      body { font-family: monospace; background: #000; color: #0f0; padding: 10px; }
      #log { height: 90vh; overflow-y: scroll; white-space: pre-wrap; }
    </style></head><body>
    <h2>📜 GoatBot Logs (Realtime)</h2>
    <div id="log">Loading...</div>
    <script>
      const log = document.getElementById('log');
      fetch('/logs.txt').then(r => r.text()).then(t => log.textContent = t);
      const ws = new WebSocket("wss://" + location.host);
      ws.onmessage = e => { log.textContent += "\\n" + e.data; log.scrollTop = log.scrollHeight; };
    </script>
    </body></html>
  `);
});

// Route: Serve saved logs
app.use("/logs.txt", express.static(logPath));

// Start web server
server.listen(port, () => {
  console.log(`Web server running at http://localhost:${port}`);
});

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
