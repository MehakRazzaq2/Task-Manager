const tasksContainer = document.getElementById("tasks-container");
let tasks = loadTasks();

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const prioritySelect = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const searchBox = document.getElementById("search-box");

const filterAllBtn = document.getElementById("filter-all");
const filterPendingBtn = document.getElementById("filter-pending");
const filterCompletedBtn = document.getElementById("filter-completed");
const filterHighPriorityBtn = document.getElementById("filter-high-priority");

const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statHighPriority = document.getElementById("stat-high-priority");

tasksContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("task-delete-btn")) {
    const cardElement = event.target.closest(".task-card");
    const taskId = Number(cardElement.getAttribute("data-id"));
    deleteTask(taskId);
  }
});

tasksContainer.addEventListener("change", function (event) {
  if (event.target.classList.contains("task-complete-checkbox")) {
    const cardElement = event.target.closest(".task-card");
    const taskId = Number(cardElement.getAttribute("data-id"));
    toggleComplete(taskId);
  }
});

searchBox.addEventListener("input", function (event) {
  const text = event.target.value;
  searchTasks(text);
});

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();
  addTask();
});

function addTask() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (title === "") {
    alert("Task title is required.");
    return;
  }

  const newTask = {
    id: Date.now(),
    title: title,
    description: description,
    priority: priority,
    dueDate: dueDate,
    completed: false,
    createdAt: new Date()
  };

  tasks.push(newTask);
  saveTasks();
  console.log("Current tasks:", tasks);

  titleInput.value = "";
  descriptionInput.value = "";
  prioritySelect.value = "medium";
  dueDateInput.value = "";
  displayTasks();
  updateStats();
}

function displayTasks(taskList = tasks) {
  tasksContainer.innerHTML = "";

  if (taskList.length === 0) {
    tasksContainer.innerHTML = "<p>No tasks to show. Try adding a task or changing the filter.</p>";
    return;
  }

  taskList.forEach(function (task) {
    let priorityClass = "priority-low";
    let priorityLabel = "Low";

    if (task.priority === "high") {
      priorityClass = "priority-high";
      priorityLabel = "High";
    } else if (task.priority === "medium") {
      priorityClass = "priority-medium";
      priorityLabel = "Medium";
    }

    const completedClass = task.completed ? "completed" : "";
    const isCheckedAttribute = task.completed ? "checked" : "";
    const dueDateText = task.dueDate ? task.dueDate : "No due date";

    const taskCardHTML = `
      <div class="task-card ${priorityClass} ${completedClass}" data-id="${task.id}">
        <div class="task-header">
          <h3 class="task-title">${task.title}</h3>
          <span class="task-status">${priorityLabel} Priority</span>
        </div>
        <p class="task-description">
          ${task.description || "No description"}
        </p>
        <div class="task-meta">
          <span>📅 Due: ${dueDateText}</span>
          <span>🕒 Created: ${task.createdAt.toLocaleString()}</span>
        </div>
        <div class="task-actions">
          <label>
            <input 
              type="checkbox" 
              class="task-complete-checkbox"
              ${isCheckedAttribute}
            />
            Mark complete
          </label>
          <button class="task-edit-btn" title="Edit task">
            🖊️
          </button>
          <button class="task-delete-btn btn-danger" title="Delete task">
            🗑️
          </button>
        </div>
      </div>
    `;

    tasksContainer.insertAdjacentHTML("beforeend", taskCardHTML);
  });
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  console.log("After delete, tasks:", tasks);
  displayTasks();
  updateStats();
}

function toggleComplete(id) {
  tasks = tasks.map(function (task) {
    if (task.id !== id) {
      return task;
    }

    return {
      ...task,
      completed: !task.completed
    };
  });

  console.log("After toggle, tasks:", tasks);
  saveTasks();
  displayTasks();
  updateStats();
}

function saveTasks() {
  const tasksJSON = JSON.stringify(tasks);
  localStorage.setItem('tasks', tasksJSON);
}

function loadTasks() {
  const stored = localStorage.getItem('tasks');

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(function (task) {
      return {
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
      };
    });
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
    return [];
  }
}

function updateStats() {
  const totalCount = tasks.length;
  statTotal.textContent = totalCount;

  const completedTasks = tasks.filter(function (task) {
    return task.completed === true;
  });
  const completedCount = completedTasks.length;
  statCompleted.textContent = completedCount;

  const pendingTasks = tasks.filter(function (task) {
    return task.completed === false;
  });
  const pendingCount = pendingTasks.length;
  statPending.textContent = pendingCount;

  const highPriorityTasks = tasks.filter(function (task) {
    return task.priority === "high";
  });
  const highPriorityCount = highPriorityTasks.length;
  statHighPriority.textContent = highPriorityCount;

  console.log("Stats updated:", {
    total: totalCount,
    completed: completedCount,
    pending: pendingCount,
    highPriority: highPriorityCount
  });
}

function filterTasks(filterType) {
  let filteredTasks = tasks;

  if (filterType === "completed") {
    filteredTasks = tasks.filter(function (task) {
      return task.completed === true;
    });
  } else if (filterType === "pending") {
    filteredTasks = tasks.filter(function (task) {
      return task.completed === false;
    });
  } else if (filterType === "high") {
    filteredTasks = tasks.filter(function (task) {
      return task.priority === "high";
    });
  } else {
    filteredTasks = tasks;
  }

  console.log("Filter type:", filterType, "Filtered tasks:", filteredTasks);
  displayTasks(filteredTasks);
}

function searchTasks(searchText) {
  const query = searchText.trim().toLowerCase();

  if (query === "") {
    displayTasks(tasks);
    return;
  }

  const filteredTasks = tasks.filter(function (task) {
    const title = String(task.title).toLowerCase();
    const description = String(task.description || "").toLowerCase();
    return title.includes(query) || description.includes(query);
  });

  console.log("Search query:", query, "Search results:", filteredTasks);
  displayTasks(filteredTasks);
}

filterAllBtn.addEventListener("click", function () {
  filterTasks("all");
});

filterPendingBtn.addEventListener("click", function () {
  filterTasks("pending");
});

filterCompletedBtn.addEventListener("click", function () {
  filterTasks("completed");
});

filterHighPriorityBtn.addEventListener("click", function () {
  filterTasks("high");
});

updateStats();
