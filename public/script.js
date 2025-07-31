document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button");
  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

  const task = document.getElementById("task").value.trim();
  const dueDate = document.getElementById("due-date").value;

  if (!task || !dueDate) {
    alert("Please fill all fields");
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Task";
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, dueDate }),
    });

    if (!res.ok) throw new Error("Failed to add task");
    
    document.getElementById("task-form").reset();
    await loadTasks();
    alert("Task added!");
  } catch (err) {
    alert(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Task";
  }
});

async function loadTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "<li>Loading tasks...</li>";

  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error("Failed to load tasks");
    
    const tasks = await res.json();
    list.innerHTML = "";

    tasks.forEach((task) => {
      if (!task.id) return; // Skip tasks without id

      const li = document.createElement("li");
      li.dataset.id = task.id;
      li.innerHTML = `
        <span class="task-text ${task.completed ? 'completed' : ''}">
          ${task.task} (Due: ${task.dueDate})
        </span>
        <div class="task-actions">
          <button class="complete-btn">${task.completed ? "Undo" : "Done"}</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      li.querySelector(".complete-btn").addEventListener("click", () => toggleComplete(task.id));
      li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li class="error">${err.message}</li>`;
  }
}

async function toggleComplete(taskId) {
  try {
    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "PUT" });
    if (!res.ok) throw new Error("Failed to update task");
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteTask(taskId) {
  if (!confirm("Delete this task permanently?")) return;
  try {
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete task");
    await loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

// Initial load
loadTasks();