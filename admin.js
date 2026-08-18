const exchangeMap = {
  LSE: ".L",
  LS: ".L",
  NYSE: ".N",
  NASDAQ: ".O",
  ASX: ".AX",
  TSX: ".TO",
  HKEX: ".HK",
  TSE: ".T",
  F: ".F",
  NSE: ".NS"
};

const DEFAULT_BALANCE = 10000;
let manualPrices = JSON.parse(localStorage.getItem("manualPrices") || "{}");
let ADMIN_ASSETS = [];
let adminAssetLookup = {};

const DEFAULT_ADMIN_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", type: "stock", sector: "Technology", price: 173.22 },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "stock", sector: "Technology", price: 324.80 },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock", sector: "Technology", price: 137.40 },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock", sector: "Consumer", price: 176.90 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "stock", sector: "Banking", price: 156.60 },
  { symbol: "HDFC", name: "HDFC Bank Ltd.", type: "stock", sector: "Banking", price: 1084.50 },
  { symbol: "BP", name: "BP plc", type: "stock", sector: "Energy", price: 29.50 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", type: "stock", sector: "Energy", price: 118.70 },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "stock", sector: "Healthcare", price: 161.25 },
  { symbol: "PFE", name: "Pfizer Inc.", type: "stock", sector: "Healthcare", price: 40.35 },
  { symbol: "TCS", name: "Tata Consultancy Services", type: "stock", sector: "IT", price: 3880.20 },
  { symbol: "INFY", name: "Infosys Ltd.", type: "stock", sector: "IT", price: 1510.40 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", type: "stock", sector: "Banking", price: 1066.90 },
  { symbol: "RELIANCE", name: "Reliance Industries Ltd.", type: "stock", sector: "Energy", price: 2853.20 },
  { symbol: "ADANIENT", name: "Adani Enterprises Ltd.", type: "stock", sector: "Infrastructure", price: 2568.50 },
  { symbol: "LT", name: "Larsen & Toubro Ltd.", type: "stock", sector: "Industrial", price: 3560.70 },
  { symbol: "ITC", name: "ITC Ltd.", type: "stock", sector: "Consumer", price: 438.30 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", type: "etf", sector: "Index Funds", price: 211.18 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "etf", sector: "Technology", price: 357.67 },
  { symbol: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", type: "etf", sector: "Others", price: 54.12 },
  { symbol: "VFIAX", name: "Vanguard 500 Index Fund Admiral Shares", type: "mutualfund", sector: "Index Funds", price: 382.90 },
  { symbol: "VTSAX", name: "Vanguard Total Stock Market Index Fund Admiral Shares", type: "mutualfund", sector: "Index Funds", price: 112.68 },
  { symbol: "FDGRX", name: "Fidelity Growth Company Fund", type: "mutualfund", sector: "Technology", price: 45.84 },
  { symbol: "ARKK", name: "ARK Innovation ETF", type: "etf", sector: "Technology", price: 28.19 }
];

function save() {
  localStorage.setItem("manualPrices", JSON.stringify(manualPrices));
  localStorage.setItem("manualPricesUpdate", Date.now().toString());
}

function getStorageKey(userEmail, key) {
  if (!userEmail) return key;
  return `user_${userEmail}_${key}`;
}

function getUsers() {
  const saved = JSON.parse(localStorage.getItem("users") || "{}") || {};
  return Object.entries(saved).map(([email, profile]) => ({
    email,
    name: profile?.name || email
  }));
}

function getDeletedAccounts() {
  return JSON.parse(localStorage.getItem("deletedAccounts") || "[]") || [];
}

function saveDeletedAccounts(accounts) {
  localStorage.setItem("deletedAccounts", JSON.stringify(accounts.slice(0, 20)));
}

function backupDeletedAccount(email) {
  if (!email) return;
  const users = JSON.parse(localStorage.getItem("users") || "{}") || {};
  const profile = users[email];
  if (!profile) return;

  const backup = {
    email,
    userProfile: profile,
    data: {
      balance: localStorage.getItem(getStorageKey(email, "balance")) || String(DEFAULT_BALANCE),
      portfolio: JSON.parse(localStorage.getItem(getStorageKey(email, "portfolio")) || "[]"),
      transactions: JSON.parse(localStorage.getItem(getStorageKey(email, "transactions")) || "[]"),
      portfolioHistory: JSON.parse(localStorage.getItem(getStorageKey(email, "portfolioHistory")) || "[]")
    },
    deletedAt: Date.now()
  };

  const existingBackups = getDeletedAccounts().filter(item => item.email !== email);
  existingBackups.unshift(backup);
  saveDeletedAccounts(existingBackups);
}

function populateDeletedAccounts() {
  const select = document.getElementById("deleted-account-select");
  if (!select) return;
  const deletedAccounts = getDeletedAccounts();
  select.innerHTML = "";
  if (deletedAccounts.length === 0) {
    select.innerHTML = '<option value="">No deleted accounts</option>';
    return;
  }

  deletedAccounts.forEach(account => {
    const option = document.createElement("option");
    const label = account.userProfile?.name || account.email;
    const deletedAt = new Date(account.deletedAt).toLocaleString();
    option.value = account.email;
    option.innerText = `${label} (${account.email}) — deleted ${deletedAt}`;
    select.appendChild(option);
  });
}

function getAdminNotifications() {
  return JSON.parse(localStorage.getItem("adminNotifications") || "[]");
}

function saveAdminNotifications(notifications) {
  localStorage.setItem("adminNotifications", JSON.stringify(notifications.slice(-20)));
}

function pushAdminNotification(message) {
  const notifications = getAdminNotifications();
  notifications.unshift({ message, timestamp: Date.now() });
  saveAdminNotifications(notifications);
}

function renderAdminNotifications() {
  const container = document.getElementById("admin-notifications");
  if (!container) return;
  const notifications = getAdminNotifications();
  if (notifications.length === 0) {
    container.innerHTML = '<div class="empty">No notifications yet.</div>';
    return;
  }

  let html = '<div class="notification-list">';
  notifications.slice(0, 10).forEach(entry => {
    html += `<div class="notification-item"><span>${new Date(entry.timestamp).toLocaleString()}</span><p>${entry.message}</p></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

async function loadAdminAssets() {
  try {
    const response = await fetch("assets.json");
    const data = await response.json();
    ADMIN_ASSETS = Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Could not load assets.json for admin leaderboard", error);
    ADMIN_ASSETS = [...DEFAULT_ADMIN_ASSETS];
  }

  adminAssetLookup = {};
  ADMIN_ASSETS.forEach(asset => {
    if (asset.symbol) {
      adminAssetLookup[asset.symbol.toUpperCase()] = asset;
    }
  });

  populateSymbolSelect();
}

function populateSymbolSelect() {
  const select = document.getElementById("symbol-select");
  if (!select) return;

  select.innerHTML = '<option value="">Select symbol</option>';
  const sortedAssets = [...ADMIN_ASSETS].sort((a, b) => {
    const aKey = (a.symbol || "").toUpperCase();
    const bKey = (b.symbol || "").toUpperCase();
    return aKey.localeCompare(bKey);
  });

  sortedAssets.forEach(asset => {
    if (!asset.symbol) return;
    const option = document.createElement("option");
    option.value = asset.symbol.toUpperCase();
    option.innerText = `${asset.symbol.toUpperCase()} — ${asset.name}`;
    select.appendChild(option);
  });
}

function stripExchangeSuffix(symbol) {
  return symbol.replace(/\.(NS|L|N|O|AX|TO|HK|T)$/i, "");
}

function getAssetPrice(symbol) {
  if (!symbol) return 0;
  const key = symbol.toUpperCase();
  const manual = Number.isFinite(manualPrices[key]) ? manualPrices[key] : manualPrices[stripExchangeSuffix(key)];
  if (Number.isFinite(manual)) return manual;
  const asset = adminAssetLookup[key];
  if (asset && Number.isFinite(asset.price)) return asset.price;
  return 0;
}

function getUserBalance(email) {
  return parseFloat(localStorage.getItem(getStorageKey(email, "balance")) || String(DEFAULT_BALANCE));
}

function getUserPortfolio(email) {
  return JSON.parse(localStorage.getItem(getStorageKey(email, "portfolio")) || "[]") || [];
}

function getUserStats(email, name) {
  const balance = getUserBalance(email);
  const portfolio = getUserPortfolio(email);
  const portfolioValue = portfolio.reduce((sum, holding) => {
    const price = getAssetPrice(holding.name);
    return sum + price * (holding.quantity || 0);
  }, 0);
  const netWorth = balance + portfolioValue;
  const profitPct = DEFAULT_BALANCE === 0 ? 0 : ((netWorth - DEFAULT_BALANCE) / DEFAULT_BALANCE) * 100;
  return {
    email,
    name,
    balance,
    portfolioValue,
    netWorth,
    profitPct
  };
}

function populateUserSelect() {
  const select = document.getElementById("user-select");
  if (!select) return;

  const users = getUsers();
  select.innerHTML = "";
  if (users.length === 0) {
    select.innerHTML = '<option value="">No users found</option>';
    renderLeaderboards();
    renderAdminNotifications();
    return;
  }

  users.forEach(user => {
    const option = document.createElement("option");
    option.value = user.email;
    option.innerText = `${user.name} (${user.email})`;
    select.appendChild(option);
  });

  renderLeaderboards();
  renderAdminNotifications();
}

function renderLeaderboardTable(containerId, stats, valueFormatter, valueLabel, netLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (stats.length === 0) {
    container.innerHTML = '<div class="empty">No user data available.</div>';
    return;
  }

  let html = `
    <div class="leaderboard-table">
      <div class="leaderboard-row leaderboard-header">
        <span>Rank</span>
        <span>User</span>
        <span>${valueLabel}</span>
        <span>${netLabel}</span>
      </div>
  `;

  stats.slice(0, 10).forEach((item, index) => {
    html += `
      <div class="leaderboard-row">
        <span>${index + 1}</span>
        <span>${item.name || item.email}</span>
        <span>${valueFormatter(item)}</span>
        <span>${netLabel === "Profit %" ? `₹${item.netWorth.toFixed(2)}` : `${item.profitPct.toFixed(2)}%`}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function renderLeaderboards() {
  const users = getUsers();
  const stats = users.map(user => getUserStats(user.email, user.name));
  const byNetWorth = [...stats].sort((a, b) => b.netWorth - a.netWorth);
  const byProfit = [...stats].sort((a, b) => b.profitPct - a.profitPct);

  renderLeaderboardTable("leaderboard-networth", byNetWorth, item => `₹${item.netWorth.toFixed(2)}`, "Net Worth", "Profit %");
  renderLeaderboardTable("leaderboard-profit", byProfit, item => `${item.profitPct.toFixed(2)}%`, "Profit %", "Net Worth");
}

function resetUserGame() {
  const select = document.getElementById("user-select");
  const status = document.getElementById("admin-status");
  if (!select) return;

  const email = select.value;
  if (!email) {
    alert("Please select a user.");
    return;
  }

  if (!confirm(`Reset game data for ${email}? This will clear only that user's balance, portfolio, transactions, and history.`)) {
    return;
  }

  localStorage.setItem(getStorageKey(email, "balance"), String(DEFAULT_BALANCE));
  localStorage.removeItem(getStorageKey(email, "portfolio"));
  localStorage.removeItem(getStorageKey(email, "transactions"));
  localStorage.removeItem(getStorageKey(email, "portfolioHistory"));

  renderLeaderboards();

  if (status) {
    status.innerText = `Reset complete for ${email}.`;
  }
  alert(`User ${email} has been reset.`);
}

function deleteUserAccount() {
  const select = document.getElementById("user-select");
  const status = document.getElementById("admin-status");
  if (!select) return;

  const email = select.value;
  if (!email) {
    alert("Please select a user.");
    return;
  }

  if (!confirm(`Delete account for ${email}? This will remove the account and all game data permanently.`)) {
    return;
  }
  // Backup the account first so we can restore later
  backupDeletedAccount(email);

  const saved = JSON.parse(localStorage.getItem("users") || "{}") || {};
  if (saved[email]) {
    delete saved[email];
    localStorage.setItem("users", JSON.stringify(saved));
  }

  const keys = ["balance", "portfolio", "transactions", "portfolioHistory"];
  keys.forEach(key => localStorage.removeItem(getStorageKey(email, key)));

  if (localStorage.getItem("currentUser") === email) {
    localStorage.removeItem("currentUser");
  }

  pushAdminNotification(`Admin deleted account: ${email}`);
  populateUserSelect();
  populateDeletedAccounts();
  renderLeaderboards();
  renderAdminNotifications();
  if (status) {
    status.innerText = `Deleted account for ${email}.`;
  }
  alert(`User ${email} has been deleted.`);
}

function restoreDeletedAccount() {
  const select = document.getElementById("deleted-account-select");
  const status = document.getElementById("deleted-status");
  if (!select) return;

  const email = select.value;
  if (!email) {
    alert("Please select a deleted account to restore.");
    return;
  }

  const backups = getDeletedAccounts();
  const backup = backups.find(b => b.email === email);
  if (!backup) {
    alert("Selected backup not found.");
    return;
  }

  // Restore users listing
  const users = JSON.parse(localStorage.getItem("users") || "{}") || {};
  users[email] = backup.userProfile || { name: email };
  localStorage.setItem("users", JSON.stringify(users));

  // Restore user data keys
  const data = backup.data || {};
  if (data.balance !== undefined) localStorage.setItem(getStorageKey(email, "balance"), String(data.balance));
  if (data.portfolio !== undefined) localStorage.setItem(getStorageKey(email, "portfolio"), JSON.stringify(data.portfolio || []));
  if (data.transactions !== undefined) localStorage.setItem(getStorageKey(email, "transactions"), JSON.stringify(data.transactions || []));
  if (data.portfolioHistory !== undefined) localStorage.setItem(getStorageKey(email, "portfolioHistory"), JSON.stringify(data.portfolioHistory || []));

  // Remove this backup from deleted list
  const remaining = backups.filter(b => b.email !== email);
  saveDeletedAccounts(remaining);

  pushAdminNotification(`Admin restored deleted account: ${email}`);
  populateUserSelect();
  populateDeletedAccounts();
  renderLeaderboards();
  renderAdminNotifications();
  if (status) status.innerText = `Restored account for ${email}.`;
  alert(`Restored account ${email}.`);
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadAdminAssets();
  populateUserSelect();
  populateDeletedAccounts();
});

window.addEventListener("storage", event => {
  if (event.key === "adminNotifications" || event.key === "users" || event.key === "deletedAccounts") {
    populateUserSelect();
    renderAdminNotifications();
    populateDeletedAccounts();
  }
});

function normalizeSymbol(input) {
  const symbol = input.trim().toUpperCase();
  if (!symbol) return "";
  const parts = symbol.split(/\s+|[-_:/]/).filter(Boolean);

  if (parts.length === 2 && exchangeMap[parts[1]]) {
    return `${parts[0]}${exchangeMap[parts[1]]}`;
  }
  if (parts.length === 2 && exchangeMap[parts[0]]) {
    return `${parts[1]}${exchangeMap[parts[0]]}`;
  }
  return symbol;
}

function updatePrice() {
  const symbol = normalizeSymbol(document.getElementById("symbol-select").value);
  const price = parseFloat(document.getElementById("price").value);

  if (!symbol || isNaN(price) || price <= 0) {
    alert("Enter a valid symbol and positive price.");
    return;
  }

  manualPrices[symbol] = price;
  save();

  if (adminAssetLookup[symbol]) {
    adminAssetLookup[symbol].price = price;
  }

  renderLeaderboards();
  pushAdminNotification(`Admin updated price for ${symbol} to ${price}`);
  alert(`${symbol} updated to ${price}`);
}

function marketCrash() {
  const keys = Object.keys(manualPrices);
  if (keys.length === 0) {
    alert("No manual prices set yet.");
    return;
  }
  keys.forEach(key => {
    manualPrices[key] = parseFloat((manualPrices[key] * 0.9).toFixed(2));
  });
  save();
  alert("Market crashed 🔻");
}

function marketBoom() {
  const keys = Object.keys(manualPrices);
  if (keys.length === 0) {
    alert("No manual prices set yet.");
    return;
  }
  keys.forEach(key => {
    manualPrices[key] = parseFloat((manualPrices[key] * 1.1).toFixed(2));
  });
  save();
  alert("Market boomed 🔺");
}
