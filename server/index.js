const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "tasks.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Helper functions
function getTasks() {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, "[]");
      return [];
    }
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading tasks:", err);
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
}

// Ensure all tasks have IDs and 'completed' status
function migrateTasks() {
  const tasks = getTasks();
  let needsUpdate = false;

  const migratedTasks = tasks.map(task => {
    const needsId = !task.id;
    const needsCompleted = typeof task.completed !== 'boolean';
    if (needsId || needsCompleted) {
      needsUpdate = true;
      return {
        id: task.id || uuidv4(),
        task: task.task,
        dueDate: task.dueDate,
        completed: needsCompleted ? false : task.completed
      };
    }
    return task;
  });

  if (needsUpdate) {
    console.log("Migrated tasks during startup");
    saveTasks(migratedTasks);
  }
}

// Initialize
migrateTasks();

// Routes
app.get("/api/tasks", (req, res) => {
  res.json(getTasks());
});

app.post("/api/tasks", (req, res) => {
  const { task, dueDate } = req.body;
  if (!task || !dueDate) {
    return res.status(400).json({ error: "Task and due date are required" });
  }
  const tasks = getTasks();
  const newTask = {
    id: uuidv4(),
    task: task.trim(),
    dueDate,
    completed: false
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id/complete", (req, res) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  task.completed = !task.completed;
  saveTasks(tasks);
  res.json({ success: true });
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = getTasks();
  const initialLength = tasks.length;
  const filteredTasks = tasks.filter(t => t.id !== req.params.id);
  if (filteredTasks.length === initialLength) {
    return res.status(404).json({ error: "Task not found" });
  }
  saveTasks(filteredTasks);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// At the end of index.js
process.on('SIGINT', () => {
  migrateTasks(); // Run migration before shutdown
  process.exit();
});