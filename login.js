const defaultUsers = {
  "admin@example.com": { password: "admin123", name: "Admin" },
  "player@example.com": { password: "player123", name: "Player" }
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function deriveNameFromEmail(email) {
  const localPart = email.split("@")[0].replace(/[._\d]+/g, " ");
  return localPart
    .split(" ")
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ") || "User";
}

function normalizeUsers(users) {
  if (!users || typeof users !== "object") return null;
  const normalized = {};
  Object.entries(users).forEach(([email, value]) => {
    if (typeof value === "string") {
      normalized[email] = { password: value, name: deriveNameFromEmail(email) };
    } else if (value && typeof value === "object") {
      normalized[email] = {
        password: value.password || "",
        name: value.name || deriveNameFromEmail(email)
      };
    }
  });
  return normalized;
}

function initUsers() {
  const saved = JSON.parse(localStorage.getItem("users") || "null");
  const normalized = normalizeUsers(saved);
  if (!normalized || Object.keys(normalized).length === 0) {
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  } else {
    localStorage.setItem("users", JSON.stringify(normalized));
  }
}

function showError(message) {
  const errorEl = document.getElementById("login-error");
  if (errorEl) {
    errorEl.innerText = message;
  }
}

function getTrimmedEmail() {
  return document.getElementById("email").value.trim().toLowerCase();
}

function login() {
  const email = getTrimmedEmail();
  const password = document.getElementById("password").value;
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!email || !password) {
    showError("Enter email and password.");
    return;
  }
  if (!isValidEmail(email)) {
    showError("Enter a valid email address.");
    return;
  }

  const user = users[email];
  if (user && user.password === password) {
    localStorage.setItem("currentUser", email);
    window.location.href = "index.html";
  } else {
    showError("Invalid email or password.");
  }
}

function signup() {
  const name = document.getElementById("name").value.trim();
  const email = getTrimmedEmail();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!name || !email || !password || !confirmPassword) {
    showError("Fill in name, email, password, and confirm password.");
    return;
  }
  if (!isValidEmail(email)) {
    showError("Enter a valid email address.");
    return;
  }
  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }
  if (users[email]) {
    showError("Email already registered. Please log in.");
    return;
  }

  users[email] = { password, name };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", email);
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  initUsers();
  redirectIfLoggedIn();

  const loginButton = document.getElementById("login-button");
  if (loginButton) {
    loginButton.addEventListener("click", login);
  }

  const signupButton = document.getElementById("signup-button");
  if (signupButton) {
    signupButton.addEventListener("click", signup);
  }

  ["password", "confirm-password"].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("keypress", event => {
        if (event.key === "Enter") {
          login();
        }
      });
    }
  });
});
