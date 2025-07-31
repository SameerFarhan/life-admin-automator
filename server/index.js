const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "tasks.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Load tasks
app.get("/api/tasks", (req, res) => {
  const data = fs.readFileSync(dataFile, "utf8");
  res.json(JSON.parse(data));
});

// Save task
app.post("/api/tasks", (req, res) => {
  const tasks = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  tasks.push(req.body);
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
