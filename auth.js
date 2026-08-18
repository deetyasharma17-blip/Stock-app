function getCurrentUser() {
  return localStorage.getItem("currentUser");
}

function getCurrentUserName() {
  const email = getCurrentUser();
  if (!email) return null;
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const userEntry = users[email];
  return userEntry?.name || null;
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

function redirectIfLoggedIn() {
  if (getCurrentUser()) {
    window.location.href = "index.html";
  }
}
