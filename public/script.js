document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const task = document.getElementById("task").value;
  const dueDate = document.getElementById("due-date").value;

  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, dueDate }),
  });

  if (res.ok) {
    loadTasks();
    document.getElementById("task-form").reset();
  }
});

async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();

  const list = document.getElementById("task-list");
  list.innerHTML = "";
  tasks.forEach(({ task, dueDate }) => {
    const li = document.createElement("li");
    li.textContent = `${task} (Due: ${dueDate})`;
    list.appendChild(li);
  });
}

loadTasks();
