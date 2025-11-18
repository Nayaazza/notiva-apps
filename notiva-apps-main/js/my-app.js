// Load saved tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
renderTasks();

// Add Task
function addTask() {
  let name = document.getElementById("taskInput").value.trim();
  let priority = document.getElementById("priority").value;
  let date = document.getElementById("taskDate").value;
  let remind = document.getElementById("taskReminder").checked;

  if (!name) return;

  tasks.push({ name, priority, date, remind });
  saveData();
  renderTasks();
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";

  if (remind && date) scheduleReminder(name, date);
}

// Render UI
function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    list.innerHTML += `
        <div class="task-item">
            <div>
                <span class="priority-${task.priority}">${task.name}</span><br>
                <small style="opacity:0.7;">📅 ${
                  task.date || "Tidak ditentukan"
                }</small>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">✕</button>
        </div>`;
  });
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveData();
  renderTasks();
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// Notification Permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Schedule Reminder
function scheduleReminder(name, date) {
  const reminderTime = new Date(date + " 09:00:00"); // default jam 09.00

  const now = new Date();
  const timeout = reminderTime - now;

  if (timeout > 0) {
    setTimeout(() => {
      showNotification(name);
    }, timeout);
  }
}

function showNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("🔔 Pengingat NOTIVA", {
      body: msg,
      icon: "../assets/notiva_icon.png", // optional
    });
  }
}
// REGISTER
function register() {
  let name = document.getElementById("regName").value;
  let email = document.getElementById("regEmail").value;
  let pass = document.getElementById("regPassword").value;

  if (name === "" || email === "" || pass === "") {
    alert("Semua field harus diisi!");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ name, email, pass }));
  alert("Registrasi berhasil! Silakan login.");
  window.location.href = "../index.html";
}

// LOGIN
function login() {
  let email = document.getElementById("loginEmail").value;
  let pass = document.getElementById("loginPassword").value;
  let user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Akun belum terdaftar!");
    return;
  }

  if (email === user.email && pass === user.pass) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "pages/dashboard.html";
  } else {
    alert("Email atau password salah!");
  }
}

// CEK LOGIN STATUS
if (window.location.pathname.includes("dashboard.html")) {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "../index.html";
  }
}

// highlight menu active
const navItems = document.querySelectorAll(".nav-item");
navItems.forEach((item) => {
  if (item.href.includes(window.location.pathname.split("/").pop())) {
    item.classList.add("active");
  }
});

function renderMiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const dateToday = today.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const container = document.getElementById("miniCalendar");
  container.innerHTML = "";

  for (let d = 1; d <= daysInMonth; d++) {
    const div = document.createElement("div");
    div.classList.add("mini-day");
    if (d === dateToday) div.classList.add("today");

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const total = tasks.filter((t) => new Date(t.date).getDate() === d).length;

    div.innerHTML = d;
    if (total > 0) {
      const badge = document.createElement("span");
      badge.classList.add("day-badge");
      badge.innerText = total;
      div.appendChild(badge);
    }

    div.onclick = () => {
      document
        .querySelectorAll(".mini-day")
        .forEach((el) => el.classList.remove("active"));
      div.classList.add("active");
      loadActivities(d);
    };

    container.appendChild(div);
  }
}

function loadStatisticsData() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Progress weekly goal (7 tasks/week)
  const completed = tasks.filter((t) => t.status === "done").length;
  const percent = Math.min(Math.round((completed / 7) * 100), 100);

  document.getElementById("progressPercent").innerText = percent + "%";
  document.getElementById(
    "progressStatus"
  ).innerText = `${completed} / 7 Completed`;

  document.querySelector(".progress-circle").style.borderColor =
    percent >= 100 ? "var(--success)" : "var(--primary)";

  // Count priority
  const level = { low: 0, medium: 0, high: 0 };
  tasks.forEach((t) => level[t.priority]++);

  new Chart(document.getElementById("priorityChart"), {
    type: "bar",
    data: {
      labels: ["Low", "Medium", "High"],
      datasets: [
        {
          data: [level.low, level.medium, level.high],
        },
      ],
    },
  });
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("userProfile"));

  if (profile) {
    document.getElementById("profileName").innerText = profile.name;
    document.getElementById("profileUsername").innerText =
      "@" + profile.username;
    document.getElementById("profileBio").innerText = profile.bio || "";
    document.getElementById("profileGender").innerText = profile.gender || "";
    document.getElementById("profileGoal").innerText = profile.goal
      ? `🎯 Target Harian: ${profile.goal} task`
      : "";

    if (profile.photo) {
      document.getElementById("profilePic").src = profile.photo;
    }

    // Apply Theme
    document.body.setAttribute("data-theme", profile.theme || "auto");
  }
}

function openEditProfile() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {};

  document.getElementById("inputName").value = profile.name || "";
  document.getElementById("inputUsername").value = profile.username || "";
  document.getElementById("inputGender").value = profile.gender || "";
  document.getElementById("inputBio").value = profile.bio || "";
  document.getElementById("inputTheme").value = profile.theme || "auto";
  document.getElementById("inputGoal").value = profile.goal || "";

  document.getElementById("editModal").style.display = "flex";
}

function closeEditProfile() {
  document.getElementById("editModal").style.display = "none";
}

function previewPhoto(event) {
  const reader = new FileReader();
  reader.onload = function () {
    document.getElementById("profilePic").src = reader.result;
    localStorage.setItem("tempPhoto", reader.result);
  };
  reader.readAsDataURL(event.target.files[0]);
}

function saveProfile() {
  const profile = {
    name: document.getElementById("inputName").value,
    username: document.getElementById("inputUsername").value,
    gender: document.getElementById("inputGender").value,
    bio: document.getElementById("inputBio").value,
    theme: document.getElementById("inputTheme").value,
    goal: document.getElementById("inputGoal").value,
    photo:
      localStorage.getItem("tempPhoto") ||
      document.getElementById("profilePic").src,
  };

  localStorage.setItem("userProfile", JSON.stringify(profile));
  localStorage.removeItem("tempPhoto");
  closeEditProfile();
  loadProfile();
}

function openEditProfile() {
  document.getElementById("editModal").style.display = "flex";
}

function closeEditProfile() {
  document.getElementById("editModal").style.display = "none";
}

