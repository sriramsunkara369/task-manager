let isLogin = true;

/* LOGIN */
function toggleMode() {
  isLogin = !isLogin;
  modeText.innerText = isLogin
    ? "Login to continue"
    : "Create an account to continue";
  authBtn.innerText = isLogin ? "Login" : "Create Account";
  switchText.innerText = isLogin
    ? "Create new account"
    : "Already have an account? Login";
}

function handleAuth() {
  const user = username.value.trim();
  const pass = password.value.trim();
  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (isLogin) {
    if (!users[user] || users[user].password !== pass) {
      alert("Invalid credentials");
      return;
    }
  } else {
    if (users[user]) {
      alert("User already exists");
      return;
    }
    users[user] = { password: pass, tasks: [], profilePic: "" };
  }

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", user);
  location.href = "index.html";
}

/* AUTH CHECK */
const currentUser = localStorage.getItem("currentUser");
if (!currentUser && !location.pathname.includes("login")) {
  location.href = "login.html";
}

/* MENU */
function toggleMenu() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/* NAV */
function goProfile() { location.href = "profile.html"; }
function goSettings() { location.href = "settings.html"; }
function goDashboard() { location.href = "index.html"; }

/* DASHBOARD */
if (document.getElementById("welcome")) {
  welcome.innerText = "Welcome, " + currentUser;

  let users = JSON.parse(localStorage.getItem("users"));
  let userData = users[currentUser];
  let tasks = userData.tasks;
  let filter = "all";

  /* Profile picture */
  const profilePic = document.getElementById("profilePic");
  const upload = document.getElementById("profileUpload");

  if (userData.profilePic) profilePic.src = userData.profilePic;

  upload.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = () => {
      userData.profilePic = reader.result;
      profilePic.src = reader.result;
      localStorage.setItem("users", JSON.stringify(users));
    };
    reader.readAsDataURL(upload.files[0]);
  });

  /* Quote */
  const quotes = [
    "Small steps every day lead to big results.",
    "Your future is created by what you do today.",
    "Stay focused. Stay consistent.",
    "Dream it. Plan it. Do it."
  ];
  document.getElementById("quoteText").innerText =
    quotes[Math.floor(Math.random() * quotes.length)];

  function save() {
    users[currentUser].tasks = tasks;
    localStorage.setItem("users", JSON.stringify(users));
  }

  window.addTask = function () {
    if (!title.value || !dueDate.value) return;
    tasks.push({
      id: Date.now(),
      title: title.value,
      desc: description.value,
      date: dueDate.value,
      done: false
    });
    save();
    display();
  };

  window.filterTasks = f => {
    filter = f;
    display();
  };

  function display() {
    taskList.innerHTML = "";
    emptyMessage.style.display = tasks.length ? "none" : "block";

    tasks
      .filter(t => filter === "all" || (filter === "completed" ? t.done : !t.done))
      .forEach(t => {
        const li = document.createElement("li");
        if (t.done) li.classList.add("completed");
        li.innerHTML = `
          <b>${t.title}</b><br>${t.desc}<br>${t.date}
          <div class="task-actions">
            <button onclick="toggleTask(${t.id})">✔</button>
            <button onclick="editTask(${t.id})">✏️</button>
            <button onclick="deleteTask(${t.id})">🗑</button>
          </div>`;
        taskList.appendChild(li);
      });
  }

  window.toggleTask = id => {
    tasks.find(t => t.id === id).done ^= true;
    save();
    display();
  };

  window.editTask = id => {
    const t = tasks.find(t => t.id === id);
    title.value = t.title;
    description.value = t.desc;
    dueDate.value = t.date;
    tasks = tasks.filter(x => x.id !== id);
    save();
    display();
  };

  window.deleteTask = id => {
    tasks = tasks.filter(t => t.id !== id);
    save();
    display();
  };

  display();
}

/* PROFILE */
if (document.getElementById("profileName")) {
  profileName.innerText = currentUser;
}

/* SETTINGS */
function clearTasks() {
  let users = JSON.parse(localStorage.getItem("users"));
  users[currentUser].tasks = [];
  localStorage.setItem("users", JSON.stringify(users));
  alert("All tasks cleared");
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}
/* ===== SETTINGS ACCORDION TOGGLE ===== */
function toggleAccordion(button) {
  const body = button.nextElementSibling;
  body.style.display = body.style.display === "block" ? "none" : "block";
}
/* ===== PROFILE PAGE LOGIC ===== */
if (document.getElementById("profilePicLarge")) {
  const users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");
  const userData = users[currentUser];

  const img = document.getElementById("profilePicLarge");
  const input = document.getElementById("profilePicInput");

  // Load existing profile picture
  if (userData.profilePic) {
    img.src = userData.profilePic;
  }

  // Update profile picture
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      userData.profilePic = reader.result;
      img.src = reader.result;
      localStorage.setItem("users", JSON.stringify(users));
      alert("Profile picture updated");
    };
    reader.readAsDataURL(file);
  });
}

/* Update username */
function updateUsername() {
  const newName = document.getElementById("newUsername").value.trim();
  if (!newName) return alert("Enter a username");

  let users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");

  if (users[newName]) {
    alert("Username already exists");
    return;
  }

  users[newName] = users[currentUser];
  delete users[currentUser];

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", newName);

  alert("Username updated successfully");
  location.reload();
}

/* Update password */
function updatePassword() {
  const newPass = document.getElementById("newPassword").value.trim();
  if (!newPass) return alert("Enter a password");

  let users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");

  users[currentUser].password = newPass;
  localStorage.setItem("users", JSON.stringify(users));

  alert("Password updated successfully");
}
/* ===== PROFILE PAGE ENHANCEMENTS ===== */
let pendingAction = null;

/* Load profile pic */
if (document.getElementById("profilePicLarge")) {
  const users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");
  const userData = users[currentUser];

  const img = document.getElementById("profilePicLarge");
  const input = document.getElementById("profilePicInput");

  if (userData.profilePic) img.src = userData.profilePic;

  input.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = () => {
      pendingAction = () => {
        userData.profilePic = reader.result;
        localStorage.setItem("users", JSON.stringify(users));
        img.src = reader.result;
      };
      openModal("Update profile picture?");
    };
    reader.readAsDataURL(input.files[0]);
  });
}

function openPicUpload() {
  document.getElementById("profilePicInput").click();
}

/* Password strength */
function checkPasswordStrength() {
  const val = newPassword.value;
  const text = document.getElementById("strengthText");

  if (val.length < 6) {
    text.textContent = "Weak password";
    text.className = "strength weak";
  } else if (/[A-Z]/.test(val) && /\d/.test(val)) {
    text.textContent = "Strong password";
    text.className = "strength strong";
  } else {
    text.textContent = "Medium password";
    text.className = "strength medium";
  }
}

/* Confirm username change */
function confirmUsernameChange() {
  const newName = document.getElementById("newUsername").value.trim();

  if (!newName) {
    alert("Please enter a new username first.");
    return;
  }

  pendingAction = updateUsername;
  openModal("Are you sure you want to change your username?");
}


/* Confirm password change */
function confirmPasswordChange() {
  const newPass = document.getElementById("newPassword").value.trim();

  if (!newPass) {
    alert("Please enter a new password first.");
    return;
  }

  pendingAction = updatePassword;
  openModal("Are you sure you want to change your password?");
}


/* Username update */
function updateUsername() {
  const newName = newUsername.value.trim();
  if (!newName) return;

  let users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");

  if (users[newName]) {
    alert("Username already exists");
    return;
  }

  users[newName] = users[currentUser];
  delete users[currentUser];

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", newName);
  location.reload();
}

/* Password update */
function updatePassword() {
  const newPass = newPassword.value.trim();
  if (!newPass) return;

  let users = JSON.parse(localStorage.getItem("users"));
  const currentUser = localStorage.getItem("currentUser");

  users[currentUser].password = newPass;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Password updated");
}

/* Modal logic */
function openModal(text) {
  modalText.innerText = text;
  confirmModal.style.display = "flex";
}

function closeModal() {
  confirmModal.style.display = "none";
  pendingAction = null;
}

function confirmAction() {
  if (pendingAction) pendingAction();
  closeModal();
}
/* ===== PASSWORD VISIBILITY (3 SECONDS) ===== */
function showPassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.type = "text";

  setTimeout(() => {
    input.type = "password";
  }, 3000);
}
/* ===== DELETE ACCOUNT ===== */
function confirmDeleteAccount() {
  const ok = confirm(
    "Are you sure?\nThis will permanently delete your account and all data."
  );
  if (!ok) return;

  deleteAccount();
}

function deleteAccount() {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const currentUser = localStorage.getItem("currentUser");

  delete users[currentUser];

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem("currentUser");

  alert("Your account has been deleted permanently.");
  location.href = "login.html";
}
/* ===== SUGGEST STRONG PASSWORD ===== */
function suggestPassword(inputId) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let password = "";

  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const input = document.getElementById(inputId);
  if (input) {
    input.value = password;
  }

  alert("Strong password generated. You can preview it using the eye icon.");
}