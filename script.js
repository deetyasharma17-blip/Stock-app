import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9cUTDboqw3hENshHYInulAdMfO4HXQ0U",
  authDomain: "stockapp-8cdd9.firebaseapp.com",
  databaseURL: "https://stockapp-8cdd9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stockapp-8cdd9",
  storageBucket: "stockapp-8cdd9.firebasestorage.app",
  messagingSenderId: "243094755136",
  appId: "1:243094755136:web:0e8aa6f0de22f12b5f0ca5"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


const DEFAULT_STOCKS = [
  { label: "AAPL", symbol: "AAPL" },
  { label: "MSFT", symbol: "MSFT" },
  { label: "GOOGL", symbol: "GOOGL" },
  { label: "AMZN", symbol: "AMZN" },
  { label: "TCS", symbol: "TCS.NS" },
  { label: "INFY", symbol: "INFY.NS" },
  { label: "HDFCBANK", symbol: "HDFCBANK.NS" },
  { label: "ICICIBANK", symbol: "ICICIBANK.NS" },
  { label: "ADANIENT", symbol: "ADANIENT.NS" },
  { label: "LT", symbol: "LT.NS" },
  { label: "ITC", symbol: "ITC.NS" },
  { label: "RELIANCE", symbol: "RELIANCE.NS" }
];

const FALLBACK_ASSETS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "stock",
    sector: "Technology",
    price: 173.22
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    type: "stock",
    sector: "Technology",
    price: 324.80
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "stock",
    sector: "Technology",
    price: 137.40
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    type: "stock",
    sector: "Banking",
    price: 156.60
  },
  {
    symbol: "HDFC",
    name: "HDFC Bank Ltd.",
    type: "stock",
    sector: "Banking",
    price: 1084.50
  },
  {
    symbol: "BP",
    name: "BP plc",
    type: "stock",
    sector: "Energy",
    price: 29.50
  },
  {
    symbol: "XOM",
    name: "Exxon Mobil Corp.",
    type: "stock",
    sector: "Energy",
    price: 118.70
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    type: "stock",
    sector: "Healthcare",
    price: 161.25
  },
  {
    symbol: "PFE",
    name: "Pfizer Inc.",
    type: "stock",
    sector: "Healthcare",
    price: 40.35
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    type: "etf",
    sector: "Index Funds",
    price: 211.18
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    type: "etf",
    sector: "Technology",
    price: 357.67
  },
  {
    symbol: "IEMG",
    name: "iShares Core MSCI Emerging Markets ETF",
    type: "etf",
    sector: "Others",
    price: 54.12
  },
  {
    symbol: "VFIAX",
    name: "Vanguard 500 Index Fund Admiral Shares",
    type: "mutualfund",
    sector: "Index Funds",
    price: 382.90
  },
  {
    symbol: "VTSAX",
    name: "Vanguard Total Stock Market Index Fund Admiral Shares",
    type: "mutualfund",
    sector: "Index Funds",
    price: 112.68
  },
  {
    symbol: "FDGRX",
    name: "Fidelity Growth Company Fund",
    type: "mutualfund",
    sector: "Technology",
    price: 45.84
  },
  {
    symbol: "ARKK",
    name: "ARK Innovation ETF",
    type: "etf",
    sector: "Technology",
    price: 28.19
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd.",
    type: "stock",
    sector: "Banking",
    price: 1066.90
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    type: "stock",
    sector: "Energy",
    price: 2853.20
  }
];

const FALLBACK_PRICES = {
  AAPL: 271.06,
  MSFT: 424.62,
  GOOGL: 344.40,
  AMZN: 263.99,
  "TCS.NS": 2396.90,
  "INFY.NS": 1154.60,
  "HDFCBANK.NS": 784.85,
  "ICICIBANK.NS": 1326.20,
  "ADANIENT.NS": 2287.60,
  "LT.NS": 4014.30,
  "ITC.NS": 301.60,
  "RELIANCE.NS": 1327.80
};

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
const REFRESH_INTERVAL = 30000;

function getStorageKey(key) {
  if (typeof getCurrentUser !== "function") {
    return key;
  }

  const currentUser = getCurrentUser();

  return currentUser
    ? `user_${currentUser}_${key}`
    : key;
}

let balance = parseFloat(
  localStorage.getItem(
    getStorageKey("balance")
  ) || String(DEFAULT_BALANCE)
);

let portfolio = JSON.parse(
  localStorage.getItem(
    getStorageKey("portfolio")
  ) || "[]"
);

let transactions = JSON.parse(
  localStorage.getItem(
    getStorageKey("transactions")
  ) || "[]"
);

let portfolioHistory = JSON.parse(
  localStorage.getItem(
    getStorageKey("portfolioHistory")
  ) || "[]"
);

let manualPrices = {};

let STOCKS = [...DEFAULT_STOCKS];
let currentPrices = {};
let ASSETS = [];
let LOCAL_ASSETS = [];

let assetFilterType = "all";
let assetSearchTerm = "";

let pendingBuy = null;
let stockChart = null;
let portfolioChart = null;
let refreshTimer = null;
let currentAcademyQuiz = null;


/* =========================================================
   ASSETS
========================================================= */

async function loadAssets() {
  try {
    const response = await fetch("assets.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    ASSETS = Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      "Failed to load assets.json:",
      error
    );

    ASSETS = [];
  }

  if (ASSETS.length === 0) {
    ASSETS = FALLBACK_ASSETS;
  }

  LOCAL_ASSETS = [...ASSETS];

  ASSETS.forEach(asset => {
    if (
      asset.symbol &&
      Number.isFinite(Number(asset.price))
    ) {
      currentPrices[asset.symbol] = {
        price: Number(asset.price),
        change: 0,
        percent: 0,
        source: "Mock API"
      };
    }
  });

  renderAssetSearchResults();
}


function matchesAssetSearch(asset, term) {
  if (!term) {
    return true;
  }

  const text = term.toLowerCase();

  return (
    asset.symbol?.toLowerCase().includes(text) ||
    asset.name?.toLowerCase().includes(text) ||
    asset.sector?.toLowerCase().includes(text) ||
    asset.type?.toLowerCase().includes(text)
  );
}


function filterAssets() {
  return ASSETS.filter(asset => {
    const matchesType =
      assetFilterType === "all" ||
      asset.type === assetFilterType;

    return (
      matchesType &&
      matchesAssetSearch(
        asset,
        assetSearchTerm
      )
    );
  });
}


function groupAssetsBySector(assets) {
  const sectors = [
    "Technology",
    "Banking",
    "Energy",
    "Healthcare",
    "Index Funds",
    "Others"
  ];

  const grouped = {};

  sectors.forEach(
    sector => {
      grouped[sector] = [];
    }
  );

  assets.forEach(asset => {
    const sectorName =
      sectors.includes(asset.sector)
        ? asset.sector
        : "Others";

    grouped[sectorName].push(asset);
  });

  return grouped;
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function renderAssetSearchResults() {
  const resultContainer =
    document.getElementById("asset-results");

  const message =
    document.getElementById("search-message");

  if (!resultContainer || !message) {
    return;
  }

  const filtered = filterAssets();

  if (filtered.length === 0) {
    resultContainer.innerHTML = "";

    message.innerText = assetSearchTerm
      ? "No assets match your search."
      : "Search among stocks, ETFs, and mutual funds.";

    return;
  }

  message.innerText =
    `${filtered.length} results found.`;

  const grouped =
    groupAssetsBySector(filtered);

  let html = "";

  Object.entries(grouped).forEach(
    ([sector, assets]) => {
      if (assets.length === 0) {
        return;
      }

      html += `
        <div class="sector-group">
          <h3>${escapeHTML(sector)}</h3>
          <div class="sector-grid">
      `;

      assets.forEach(asset => {
        const priceText =
          Number.isFinite(Number(asset.price))
            ? formatCurrency(Number(asset.price))
            : "Price N/A";

        const safeSymbol =
          escapeHTML(asset.symbol);

        html += `
          <div class="asset-card">

            <div class="asset-card-header">
              <div>
                <div class="asset-name">
                  ${escapeHTML(asset.name)}
                </div>

                <div class="asset-symbol">
                  ${safeSymbol}
                </div>
              </div>

              <span class="asset-type-badge">
                ${escapeHTML(
                  String(asset.type).toUpperCase()
                )}
              </span>
            </div>

            <div class="asset-sector">
              ${escapeHTML(asset.sector)}
            </div>

            <div class="asset-price">
              ${priceText}
            </div>

            <button
              onclick="buyAsset('${safeSymbol}')"
            >
              Buy
            </button>

          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }
  );

  resultContainer.innerHTML = html;
}


function setFilterType(type) {
  assetFilterType = type;

  document
    .querySelectorAll(".asset-filter")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.type === type
      );
    });

  renderAssetSearchResults();
}


function normalizeYahooAssetType(quoteType) {
  if (!quoteType) {
    return "stock";
  }

  const normalized =
    quoteType.toLowerCase();

  if (normalized === "etf") {
    return "etf";
  }

  if (normalized === "mutualfund") {
    return "mutualfund";
  }

  if (normalized.includes("fund")) {
    return "mutualfund";
  }

  return "stock";
}


function normalizeAssetSector(asset) {
  if (asset.sector) {
    return asset.sector;
  }

  if (asset.industry) {
    return asset.industry;
  }

  if (
    asset.type === "etf" ||
    asset.type === "mutualfund"
  ) {
    return "Index Funds";
  }

  return "Others";
}


async function searchGlobalAssets(term) {
  if (!term) {
    return [];
  }

  try {
    const url =
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        term
      )}&quotesCount=30&newsCount=0`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Yahoo search HTTP ${response.status}`
      );
    }

    const data = await response.json();

    const quotes =
      Array.isArray(data.quotes)
        ? data.quotes
        : [];

    return quotes
      .map(item => ({
        symbol: item.symbol || "",
        name:
          item.longname ||
          item.shortname ||
          item.symbol ||
          "Unknown",

        type: normalizeYahooAssetType(
          item.quoteType
        ),

        sector:
          normalizeAssetSector(item),

        price: Number(
          item.regularMarketPrice ||
          item.rawQuote?.regularMarketPrice ||
          item.regularMarketPreviousClose ||
          0
        )
      }))
      .filter(
        asset => asset.symbol
      );

  } catch (error) {
    console.warn(
      "Global search failed, falling back to local assets",
      error
    );

    return [];
  }
}


async function searchMarket() {
  assetSearchTerm =
    document
      .getElementById("search")
      ?.value
      .trim() || "";

  const message =
    document.getElementById("search-message");

  if (message) {
    message.innerText =
      "Searching global market...";
  }

  if (!assetSearchTerm) {
    ASSETS = [...LOCAL_ASSETS];
    renderAssetSearchResults();
    return;
  }

  const results =
    await searchGlobalAssets(
      assetSearchTerm
    );

  if (results.length > 0) {
    ASSETS = results;

    results.forEach(asset => {
      if (
        asset.symbol &&
        Number.isFinite(asset.price) &&
        asset.price > 0
      ) {
        ensureCurrentPrice(
          asset.symbol,
          asset.price,
          {
            source: "Market search"
          }
        );
      }
    });

    renderAssetSearchResults();
    return;
  }

  const fallbackAssets =
    LOCAL_ASSETS.length
      ? LOCAL_ASSETS
      : FALLBACK_ASSETS;

  ASSETS =
    fallbackAssets.filter(
      asset =>
        matchesAssetSearch(
          asset,
          assetSearchTerm
        )
    );

  renderAssetSearchResults();
}


/* =========================================================
   PRICES
========================================================= */

function ensureCurrentPrice(
  symbol,
  price,
  options = {}
) {
  if (
    !symbol ||
    !Number.isFinite(Number(price))
  ) {
    return;
  }

  const value = Number(price);
  const current =
    currentPrices[symbol] || {};

  currentPrices[symbol] = {
    ...current,

    price: value,

    change:
      Number.isFinite(
        Number(options.change)
      )
        ? Number(options.change)
        : current.change ?? 0,

    percent:
      Number.isFinite(
        Number(options.percent)
      )
        ? Number(options.percent)
        : current.percent ?? 0,

    source:
      options.source ||
      current.source ||
      "Current"
  };
}


function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return `₹${number.toFixed(2)}`;
}


function formatPercent(value) {
  const number = Number(value) || 0;
  const sign =
    number >= 0 ? "+" : "";

  return `${sign}${number.toFixed(2)}%`;
}


function formatDateTime(timestamp) {
  return new Date(
    timestamp
  ).toLocaleString();
}


/* =========================================================
   FIREBASE MANUAL PRICES
========================================================= */

function loadState() {
  /*
    State is already loaded from localStorage
    when the variables are initialized.

    This function is kept for compatibility
    with the existing DOMContentLoaded flow.
  */

  updateUI();
}


function subscribeToManualPrices() {
  const pricesRef =
    ref(database, "manualPrices");

  onValue(
    pricesRef,
    snapshot => {
      manualPrices =
        snapshot.val() || {};

      localStorage.setItem(
        "manualPrices",
        JSON.stringify(
          manualPrices
        )
      );

      /*
        Important:
        This subscription is created only once.
        It does NOT recursively create another
        Firebase listener.
      */

      loadStockPrices();
    },
    error => {
      console.error(
        "Firebase manual price listener failed:",
        error
      );
    }
  );
}


function stripExchangeSuffix(symbol) {
  return symbol.replace(
    /\.(NS|L|N|O|AX|TO|HK|T)$/i,
    ""
  );
}


function getManualPrice(symbol) {
  const exact =
    Number(manualPrices?.[symbol]);

  if (Number.isFinite(exact)) {
    return exact;
  }

  const stripped =
    stripExchangeSuffix(symbol);

  const fallback =
    Number(manualPrices?.[stripped]);

  if (Number.isFinite(fallback)) {
    return fallback;
  }

  return null;
}


function applyManualPriceOverride(
  symbol,
  data
) {
  if (
    !data ||
    data.price === null ||
    data.price === undefined
  ) {
    return data;
  }

  const override =
    getManualPrice(symbol);

  if (override === null) {
    return data;
  }

  const originalPrice =
    data.originalPrice ??
    data.price;

  const diff =
    override - originalPrice;

  return {
    ...data,

    originalPrice,

    price: override,

    change: diff,

    percent:
      originalPrice === 0
        ? 0
        : (diff / originalPrice) * 100,

    source: "Manual override"
  };
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveState() {
  localStorage.setItem(
    getStorageKey("balance"),
    balance.toFixed(2)
  );

  localStorage.setItem(
    getStorageKey("portfolio"),
    JSON.stringify(portfolio)
  );

  localStorage.setItem(
    getStorageKey("transactions"),
    JSON.stringify(transactions)
  );

  localStorage.setItem(
    getStorageKey("portfolioHistory"),
    JSON.stringify(
      portfolioHistory.slice(-32)
    )
  );
}


/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

function getAdminNotifications() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "adminNotifications"
      ) || "[]"
    );
  } catch {
    return [];
  }
}


function saveAdminNotifications(
  notifications
) {
  localStorage.setItem(
    "adminNotifications",
    JSON.stringify(
      notifications.slice(-20)
    )
  );
}


function pushAdminNotification(message) {
  const notifications =
    getAdminNotifications();

  notifications.unshift({
    message,
    timestamp: Date.now()
  });

  saveAdminNotifications(
    notifications
  );
}


function deleteUserStorage(email) {
  const prefix =
    `user_${email}_`;

  const keysToRemove =
    Object.keys(localStorage)
      .filter(
        key =>
          key.startsWith(prefix)
      );

  keysToRemove.forEach(
    key =>
      localStorage.removeItem(key)
  );
}


function deleteCurrentUserAccount() {
  const currentUserEmail =
    typeof getCurrentUser === "function"
      ? getCurrentUser()
      : null;

  if (!currentUserEmail) {
    return;
  }

  const confirmed = confirm(
    "Delete your account and all your saved portfolio data? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  let users = {};

  try {
    users =
      JSON.parse(
        localStorage.getItem("users") ||
        "{}"
      ) || {};
  } catch {
    users = {};
  }

  /*
    Backup user data before deleting it.
  */

  const backup = {
    email: currentUserEmail,

    userProfile:
      users[currentUserEmail] ||
      {
        name: currentUserEmail
      },

    data: {
      balance:
        localStorage.getItem(
          `user_${currentUserEmail}_balance`
        ) ||
        String(DEFAULT_BALANCE),

      portfolio:
        JSON.parse(
          localStorage.getItem(
            `user_${currentUserEmail}_portfolio`
          ) || "[]"
        ),

      transactions:
        JSON.parse(
          localStorage.getItem(
            `user_${currentUserEmail}_transactions`
          ) || "[]"
        ),

      portfolioHistory:
        JSON.parse(
          localStorage.getItem(
            `user_${currentUserEmail}_portfolioHistory`
          ) || "[]"
        )
    },

    deletedAt: Date.now()
  };

  let existing = [];

  try {
    existing =
      JSON.parse(
        localStorage.getItem(
          "deletedAccounts"
        ) || "[]"
      ) || [];
  } catch {
    existing = [];
  }

  const filtered =
    existing.filter(
      item =>
        item.email !==
        currentUserEmail
    );

  filtered.unshift(backup);

  localStorage.setItem(
    "deletedAccounts",
    JSON.stringify(
      filtered.slice(0, 20)
    )
  );

  if (users[currentUserEmail]) {
    delete users[currentUserEmail];

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );
  }

  deleteUserStorage(
    currentUserEmail
  );

  localStorage.removeItem(
    "currentUser"
  );

  pushAdminNotification(
    `User deleted account: ${currentUserEmail}`
  );

  window.location.href =
    "login.html";
}


/* =========================================================
   SEARCH
========================================================= */

function clearSearchResult(message) {
  const messageEl =
    document.getElementById(
      "search-message"
    );

  const resultEl =
    document.getElementById(
      "search-result"
    );

  if (messageEl) {
    messageEl.innerText =
      message || "";
  }

  if (resultEl) {
    resultEl.innerHTML = "";
  }
}


function normalizeSearchSymbol(input) {
  const symbol =
    input
      .trim()
      .toUpperCase();

  if (!symbol) {
    return "";
  }

  const parts =
    symbol.split(
      /\s+|[-_:/]/
    ).filter(Boolean);

  if (
    parts.length === 2 &&
    exchangeMap[parts[1]]
  ) {
    return (
      `${parts[0]}${exchangeMap[parts[1]]}`
    );
  }

  if (
    parts.length === 2 &&
    exchangeMap[parts[0]]
  ) {
    return (
      `${parts[1]}${exchangeMap[parts[0]]}`
    );
  }

  return symbol;
}


function getStockLabel(symbol) {
  if (!symbol) {
    return "";
  }

  return symbol.replace(
    /\.NS$|\.L$|\.N$|\.O$|\.AX$|\.TO$|\.HK$|\.T$/i,
    ""
  );
}


/* =========================================================
   TRANSACTIONS
========================================================= */

function addTransaction(
  type,
  symbol,
  quantity,
  price
) {
  transactions.unshift({
    type,
    symbol,
    quantity,
    price,
    timestamp: Date.now()
  });

  if (transactions.length > 50) {
    transactions.pop();
  }

  saveState();
  renderHistory();
}


function recordPortfolioValue() {
  const equityValue =
    portfolio.reduce(
      (sum, holding) =>
        sum +
        getHoldingValue(holding),
      0
    );

  const total =
    balance + equityValue;

  portfolioHistory.push({
    time: Date.now(),
    value: parseFloat(
      total.toFixed(2)
    )
  });

  if (portfolioHistory.length > 30) {
    portfolioHistory.shift();
  }

  saveState();
}


function renderHistory() {
  const historyDiv =
    document.getElementById(
      "history"
    );

  if (!historyDiv) {
    return;
  }

  if (transactions.length === 0) {
    historyDiv.innerHTML =
      '<div class="empty">No transactions yet.</div>';

    return;
  }

  let html = `
    <div class="history-header">
      <span>Date</span>
      <span>Type</span>
      <span>Stock</span>
      <span>Qty</span>
      <span>Price</span>
    </div>
  `;

  transactions
    .slice(0, 20)
    .forEach(tx => {
      html += `
        <div class="history-row">
          <span>
            ${escapeHTML(
              formatDateTime(
                tx.timestamp
              )
            )}
          </span>

          <span class="${escapeHTML(
            String(tx.type).toLowerCase()
          )}">
            ${escapeHTML(tx.type)}
          </span>

          <span>
            ${escapeHTML(tx.symbol)}
          </span>

          <span>
            ${escapeHTML(tx.quantity)}
          </span>

          <span>
            ${formatCurrency(tx.price)}
          </span>
        </div>
      `;
    });

  historyDiv.innerHTML = html;
}


/* =========================================================
   BUY / SELL
========================================================= */

function getHoldingValue(holding) {
  const current =
    currentPrices[
      holding.name
    ]?.price;

  const price =
    current === null ||
    current === undefined
      ? holding.avgCost
      : current;

  return (
    Number(price) *
    Number(holding.quantity)
  );
}


function getHoldingPL(holding) {
  const current =
    currentPrices[
      holding.name
    ]?.price;

  const marketPrice =
    current === null ||
    current === undefined
      ? holding.avgCost
      : current;

  return (
    (marketPrice -
      holding.avgCost) *
    holding.quantity
  );
}


function getHoldingAdjustedPL(
  holding
) {
  const basePL =
    getHoldingPL(holding);

  const adjustment =
    parseFloat(
      holding.manualAdjustment || 0
    ) || 0;

  return (
    basePL + adjustment
  );
}


function getHoldingPercent(
  holding
) {
  const current =
    currentPrices[
      holding.name
    ]?.price;

  const marketPrice =
    current === null ||
    current === undefined
      ? holding.avgCost
      : current;

  if (!holding.avgCost) {
    return 0;
  }

  return (
    ((marketPrice -
      holding.avgCost) /
      holding.avgCost) *
    100
  );
}


function buyAsset(symbol) {
  const asset =
    ASSETS.find(
      item =>
        item.symbol === symbol
    );

  if (!asset) {
    alert("Asset not found.");
    return;
  }

  const price =
    currentPrices[symbol]?.price ??
    asset.price;

  ensureCurrentPrice(
    symbol,
    price,
    {
      source: "Asset lookup"
    }
  );

  if (
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {
    alert(
      "Current price not available yet. Please refresh prices."
    );

    return;
  }

  if (
    balance <
    Number(price)
  ) {
    alert(
      "Not enough virtual cash to buy this asset."
    );

    return;
  }

  showBuyModal(
    symbol,
    Number(price),
    qty =>
      completeBuy(
        symbol,
        Number(price),
        {
          type: asset.type,
          sector: asset.sector
        },
        qty
      )
  );
}


function completeBuy(
  symbol,
  price,
  metadata = {},
  quantity = 1
) {
  quantity =
    parseInt(
      quantity,
      10
    ) || 1;

  if (quantity <= 0) {
    alert(
      "Enter a valid quantity."
    );

    return;
  }

  const marketPrice =
    currentPrices[
      symbol
    ]?.price ?? price;

  const totalCost =
    marketPrice * quantity;

  if (
    balance <
    totalCost
  ) {
    alert(
      "Not enough virtual cash to buy that quantity."
    );

    return;
  }

  ensureCurrentPrice(
    symbol,
    marketPrice,
    {
      source: "Portfolio buy"
    }
  );

  balance -= totalCost;

  const existing =
    portfolio.find(
      item =>
        item.name === symbol
    );

  if (existing) {
    existing.quantity += quantity;

    existing.totalCost +=
      totalCost;

    existing.avgCost =
      existing.totalCost /
      existing.quantity;

    Object.assign(
      existing,
      metadata
    );
  } else {
    portfolio.push({
      name: symbol,
      quantity,
      avgCost: marketPrice,
      totalCost,
      manualAdjustment: 0,
      ...metadata
    });
  }

  addTransaction(
    "Buy",
    symbol,
    quantity,
    marketPrice
  );

  saveState();
  updateUI();
  recordPortfolioValue();
}


function showBuyModal(
  symbol,
  price,
  callback
) {
  const modal =
    document.getElementById(
      "buy-modal"
    );

  const text =
    document.getElementById(
      "buy-modal-text"
    );

  const confirmButton =
    document.getElementById(
      "buy-confirm-btn"
    );

  const qtyInput =
    document.getElementById(
      "buy-quantity"
    );

  if (
    !modal ||
    !text ||
    !confirmButton ||
    !qtyInput
  ) {
    return;
  }

  pendingBuy = {
    symbol,
    price,
    callback
  };

  text.innerText =
    `Buy ${symbol} at ${formatCurrency(price)}?`;

  qtyInput.value = 1;

  confirmButton.onclick = () => {
    const qty =
      parseInt(
        qtyInput.value,
        10
      ) || 1;

    if (qty <= 0) {
      alert(
        "Enter a valid quantity (1 or more)."
      );

      return;
    }

    const totalCost =
      price * qty;

    if (
      balance <
      totalCost
    ) {
      alert(
        "Not enough virtual cash to buy that quantity."
      );

      return;
    }

    if (
      pendingBuy &&
      typeof pendingBuy.callback ===
        "function"
    ) {
      pendingBuy.callback(qty);
    }

    pendingBuy = null;

    hideBuyModal();
  };

  modal.classList.add(
    "visible"
  );
}


function hideBuyModal() {
  const modal =
    document.getElementById(
      "buy-modal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    "visible"
  );

  pendingBuy = null;
}


function buyStock(index) {
  const symbol =
    STOCKS[index]?.symbol;

  if (!symbol) {
    return;
  }

  buyStockBySymbol(symbol);
}


function buyStockBySymbol(symbol) {
  const data =
    currentPrices[symbol];

  const price =
    data?.price;

  if (
    price === null ||
    price === undefined ||
    price <= 0
  ) {
    alert(
      "Current price not available yet. Please refresh prices."
    );

    return;
  }

  if (
    balance < price
  ) {
    alert(
      "Not enough virtual cash to buy this stock."
    );

    return;
  }

  showBuyModal(
    symbol,
    price,
    qty =>
      completeBuy(
        symbol,
        price,
        {},
        qty
      )
  );
}


function sellStock(index) {
  const holding =
    portfolio[index];

  if (!holding) {
    return;
  }

  const current =
    currentPrices[
      holding.name
    ]?.price ??
    holding.avgCost;

  const proceed =
    current *
    holding.quantity;

  const confirmed =
    confirm(
      `Sell ${holding.quantity} ${holding.name} for ${formatCurrency(proceed)}?`
    );

  if (!confirmed) {
    return;
  }

  balance += proceed;

  addTransaction(
    "Sell",
    holding.name,
    holding.quantity,
    current
  );

  portfolio.splice(
    index,
    1
  );

  saveState();
  updateUI();
  recordPortfolioValue();

  loadStockPrices();
}


function updateManualPL(
  index,
  value
) {
  const amount =
    parseFloat(value);

  const holding =
    portfolio[index];

  if (!holding) {
    return;
  }

  holding.manualAdjustment =
    Number.isFinite(amount)
      ? amount
      : 0;

  saveState();
  updateUI();
}


/* =========================================================
   AI SUGGESTIONS
========================================================= */

function getAiSuggestion(
  symbol,
  data
) {
  if (
    !data ||
    data.price === null ||
    data.price === undefined
  ) {
    return {
      action: "Wait",
      reason:
        "Waiting for fresh price data"
    };
  }

  const holding =
    portfolio.find(
      item =>
        item.name === symbol
    );

  const momentum =
    Number(data.percent) || 0;

  const currentChange =
    Number(data.change) || 0;

  if (holding) {
    const gainPercent =
      getHoldingPercent(
        holding
      );

    if (
      gainPercent >= 3 ||
      momentum >= 2
    ) {
      return {
        action: "Sell",
        reason:
          "Lock in gains while trend is strong"
      };
    }

    if (
      gainPercent <= -3 ||
      momentum <= -2
    ) {
      return {
        action: "Sell",
        reason:
          "Cut losses before a deeper decline"
      };
    }

    if (
      momentum <= -1
    ) {
      return {
        action: "Hold",
        reason:
          "Market pulled back; holding may recover"
      };
    }

    return {
      action: "Hold",
      reason:
        "No strong sell signal right now"
    };
  }

  if (
    momentum <= -2 ||
    currentChange < -1
  ) {
    return {
      action: "Buy",
      reason:
        "Dip buying opportunity"
    };
  }

  if (
    momentum >= 2
  ) {
    return {
      action: "Hold",
      reason:
        "Price is strong; wait for a pullback"
    };
  }

  return {
    action: "Hold",
    reason:
      "Market is stable; monitor before trading"
  };
}


function getSuggestionClass(
  action
) {
  if (action === "Buy") {
    return "ai-buy";
  }

  if (action === "Sell") {
    return "ai-sell";
  }

  return "ai-hold";
}


function getChangeClass(data) {
  if (!data) {
    return "";
  }

  if (data.change > 0) {
    return "up";
  }

  if (data.change < 0) {
    return "down";
  }

  return "";
}


function renderAiSummary() {
  const panel =
    document.getElementById(
      "suggestion-panel"
    );

  if (!panel) {
    return;
  }

  const suggestions =
    STOCKS.map(record => {
      const data =
        currentPrices[
          record.symbol
        ];

      const suggestion =
        getAiSuggestion(
          record.symbol,
          data
        );

      return {
        symbol: record.symbol,
        label: record.label,
        ...suggestion
      };
    });

  const strong =
    suggestions.filter(
      item =>
        item.action === "Buy" ||
        item.action === "Sell"
    );

  if (strong.length === 0) {
    panel.innerHTML = `
      <div class="panel-header">
        <h2>AI suggestions</h2>
      </div>

      <div class="empty">
        Market is quiet. No strong buy/sell recommendation right now.
      </div>
    `;

    return;
  }

  const rows =
    strong
      .slice(0, 6)
      .map(item => `
        <div class="ai-summary-row ${getSuggestionClass(
          item.action
        )}">
          <span>
            ${escapeHTML(item.label)}
          </span>

          <span>
            ${escapeHTML(item.action)}
          </span>

          <span>
            ${escapeHTML(item.reason)}
          </span>
        </div>
      `)
      .join("");

  panel.innerHTML = `
    <div class="panel-header">
      <h2>AI suggestions</h2>
    </div>

    <div class="ai-summary-header">
      <span>Stock</span>
      <span>Action</span>
      <span>Why</span>
    </div>

    ${rows}
  `;
}


/* =========================================================
   MARKET DATA
========================================================= */

async function fetchFirebasePrice(symbol) {
  try {
    const snapshot = await get(
      ref(database, "manualPrices")
    );

    const prices = snapshot.val() || {};

    const key = symbol.toUpperCase();
    const baseSymbol = key.replace(/\.(NS|L|N|O|AX|TO|HK|T)$/i, "");

    const price =
      prices[key] ??
      prices[baseSymbol];

    if (price === undefined || price === null) {
      return null;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return null;
    }

    return applyManualPriceOverride(symbol, {
      price: numericPrice,
      change: 0,
      percent: 0,
      source: "Admin"
    });

  } catch (error) {
    console.error("Firebase price failed:", error);
    return null;
  }
}

async function fetchStockData(symbol) {
  try {
    // FIRST: Check Firebase for the price set by Admin
    const firebaseData = await fetchFirebasePrice(symbol);

    if (firebaseData) {
      return firebaseData;
    }

    // SECOND: Use your existing fallback price
    return applyManualPriceOverride(symbol, {
      price: FALLBACK_PRICES[symbol] || 0,
      change: 0,
      percent: 0,
      source: "Fallback"
    });

  } catch (error) {
    console.error("Stock data failed:", error);

    return applyManualPriceOverride(symbol, {
      price: FALLBACK_PRICES[symbol] || 0,
      change: 0,
      percent: 0,
      source: "Fallback"
    });
  }
}

async function loadStockPrices() {
  const stockDiv =
    document.getElementById(
      "stocks"
    );

  if (!stockDiv) {
    return;
  }

  stockDiv.innerHTML =
    '<div class="loading">Loading stock prices…</div>';

  let html = "";

  for (
    let i = 0;
    i < STOCKS.length;
    i++
  ) {
    const record =
      STOCKS[i];

    let data =
      await fetchStockData(
        record.symbol
      );

    if (!data) {
      data = {
        price:
          FALLBACK_PRICES[
            record.symbol
          ] || 0,

        change: 0,
        percent: 0,
        source: "Unavailable"
      };
    }

    currentPrices[
      record.symbol
    ] = data;

    const suggestion =
      getAiSuggestion(
        record.symbol,
        data
      );

    const suggestionClass =
      getSuggestionClass(
        suggestion.action
      );

    const hasPrice =
      Number.isFinite(
        Number(data.price)
      ) &&
      Number(data.price) > 0;

    const priceText =
      hasPrice
        ? formatCurrency(
            data.price
          )
        : "⚠️ Price unavailable";

    const changeClass =
      getChangeClass(data);

    const changeText =
      data.change === 0
        ? "0.00%"
        : formatPercent(
            data.percent
          );

    html += `
      <div class="stock">

        <div class="stock-title">
          ${escapeHTML(
            record.label
          )}
        </div>

        <div class="stock-price">
          ${priceText}
        </div>

        <div class="source">
          ${escapeHTML(
            data.source ||
            "Unknown"
          )}
        </div>

        <div class="suggestion ${suggestionClass}">
          ${escapeHTML(
            suggestion.action
          )}:
          ${escapeHTML(
            suggestion.reason
          )}
        </div>

        <div class="stock-change ${changeClass}">
          ${
            data.change >= 0
              ? "🟢"
              : "🔴"
          }

          ${changeText}
        </div>

        <button
          ${
            !hasPrice
              ? 'class="button-disabled" disabled'
              : ""
          }
          onclick="buyStock(${i})"
        >
          Buy
        </button>

        <button
          onclick="drawChart('${escapeHTML(
            record.symbol
          )}')"
        >
          Chart
        </button>

      </div>
    `;
  }

  stockDiv.innerHTML =
    html;

  updateUI();
  recordPortfolioValue();
  setLastUpdate();
}


/* =========================================================
   PORTFOLIO HEALTH
========================================================= */

function calculatePortfolioHealth() {
  if (portfolio.length === 0) {
    return {
      score: 0,

      reason:
        "No investments yet. Start with a diversified first set of holdings.",

      tips: [
        "Add at least 3 different investments.",
        "Spread risk across sectors."
      ]
    };
  }

  const portfolioValue =
    portfolio.reduce(
      (sum, holding) =>
        sum +
        getHoldingValue(
          holding
        ),
      0
    );

  const uniqueSectors =
    new Set(
      portfolio.map(
        item =>
          item.sector ||
          "Other"
      )
    ).size;

  const diversificationScore =
    Math.min(
      35,
      portfolio.length * 7 +
        uniqueSectors * 8
    );

  const returnValues =
    portfolio.map(
      holding => {
        const current =
          currentPrices[
            holding.name
          ]?.price ??
          holding.avgCost;

        const gain =
          (
            (current -
              holding.avgCost) /
            holding.avgCost
          ) * 100;

        return Math.abs(gain);
      }
    );

  const avgVolatility =
    returnValues.length
      ? returnValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        returnValues.length
      : 0;

  const volatilityScore =
    Math.max(
      0,
      30 -
        avgVolatility * 1.6
    );

  const sectorWeights =
    portfolio.reduce(
      (map, holding) => {
        const sector =
          holding.sector ||
          "Other";

        const current =
          currentPrices[
            holding.name
          ]?.price ??
          holding.avgCost;

        const value =
          current *
          holding.quantity;

        map[sector] =
          (map[sector] || 0) +
          value;

        return map;
      },
      {}
    );

  const totalSectorValue =
    Object.values(
      sectorWeights
    ).reduce(
      (sum, value) =>
        sum + value,
      0
    ) || 1;

  const concentration =
    Object.values(
      sectorWeights
    )
      .map(
        value =>
          (
            value /
            totalSectorValue
          ) ** 2
      )
      .reduce(
        (sum, value) =>
          sum + value,
        0
      );

  const concentrationScore =
    Math.max(
      0,
      20 -
        concentration * 100
    );

  const debtScore = 15;

  const historyBaseline =
    portfolioHistory.length > 1
      ? portfolioHistory[0].value
      : DEFAULT_BALANCE;

  const latestHistory =
    portfolioHistory[
      portfolioHistory.length - 1
    ]?.value ||
    portfolioValue +
      balance;

  const historyDelta =
    historyBaseline
      ? (
          (
            latestHistory -
            historyBaseline
          ) /
          historyBaseline
        ) * 100
      : 0;

  const historicalScore =
    Math.max(
      0,
      Math.min(
        25,
        12.5 +
          historyDelta * 1.5
      )
    );

  const score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          diversificationScore +
          volatilityScore +
          concentrationScore +
          debtScore +
          historicalScore
        )
      )
    );

  let reason =
    "Your portfolio is balanced and diversified.";

  if (score >= 85) {
    reason =
      "Strong diversification and healthy balance suggest a resilient portfolio.";
  } else if (score >= 70) {
    reason =
      "Good structure, but a stronger mix of sectors would improve stability.";
  } else if (score >= 50) {
    reason =
      "Your holdings are workable, but concentration and volatility are still reducing resilience.";
  } else if (score > 0) {
    reason =
      "The portfolio is still developing. More diversification will improve your risk profile.";
  }

  return {
    score,
    reason,

    tips: [
      `Diversification: ${uniqueSectors} sectors represented.`,

      `Volatility: ${avgVolatility.toFixed(
        1
      )}% average move from your cost basis.`,

      "Debt exposure: none recorded in this simulator."
    ]
  };
}


/* =========================================================
   ACADEMY
========================================================= */

const ACADEMY_LEVELS = [
  {
    id: 1,
    name: "Money Basics",
    xpRequired: 0,

    description:
      "Understand cash flow, savings, emergency funds, and compounding before investing.",

    lesson:
      "Budgeting and saving come before investing. A strong foundation helps you handle risk and protect long-term gains.",

    xpReward: 50,

    questions: [
      {
        id: 1,
        question:
          "What is cash flow?",

        options: [
          "The amount of money you own",
          "Money moving in and out of your finances",
          "The price of a stock",
          "Money invested in a company"
        ],

        correctIndex: 1
      },

      {
        id: 2,
        question:
          "What is the main purpose of an emergency fund?",

        options: [
          "To buy stocks quickly",
          "To pay for unexpected expenses",
          "To increase your credit score",
          "To avoid paying taxes"
        ],

        correctIndex: 1
      },

      {
        id: 3,
        question:
          "Which is generally the best description of saving?",

        options: [
          "Setting aside money for future needs or goals",
          "Buying expensive items",
          "Borrowing money from a bank",
          "Investing exclusively in stocks"
        ],

        correctIndex: 0
      },

      {
        id: 4,
        question:
          "What does compound growth mean?",

        options: [
          "Your returns can themselves generate additional returns",
          "Your money stays exactly the same",
          "You lose money every year",
          "You only earn interest once"
        ],

        correctIndex: 0
      },

      {
        id: 5,
        question:
          "Which person is generally in the strongest financial position?",

        options: [
          "Someone with no savings but many investments",
          "Someone who has an emergency fund and manages expenses responsibly",
          "Someone who spends all their income",
          "Someone who borrows money for everyday expenses"
        ],

        correctIndex: 1
      }
    ]
  },

  {
    id: 2,
    name: "Understanding Stocks",
    xpRequired: 100,

    description:
      "Learn what a stock is, why prices move, and how ownership works.",

    lesson:
      "A stock represents ownership in a company. When prices move, it usually reflects expectations about profit, growth, and risk.",

    xpReward: 60,

    questions: [
      {
        id: 1,
        question:
          "What does owning a stock generally represent?",

        options: [
          "A loan to the government",
          "Partial ownership in a company",
          "A guaranteed return",
          "A bank deposit"
        ],

        correctIndex: 1
      },

      {
        id: 2,
        question:
          "Why might a stock's price rise?",

        options: [
          "More investors want to buy it",
          "The company stopped operating",
          "Nobody is interested in it",
          "Prices can only rise because of dividends"
        ],

        correctIndex: 0
      },

      {
        id: 3,
        question:
          "What is a dividend?",

        options: [
          "A company's debt",
          "A payment some companies make to shareholders",
          "A stock exchange",
          "A government tax"
        ],

        correctIndex: 1
      },

      {
        id: 4,
        question:
          "What does a shareholder own?",

        options: [
          "The company's entire bank account",
          "A portion of the company's equity",
          "The company's employees",
          "A guaranteed percentage of its profits"
        ],

        correctIndex: 1
      },

      {
        id: 5,
        question:
          "Which statement is TRUE about stock prices?",

        options: [
          "They always increase over time",
          "They can rise or fall based on many factors",
          "They are fixed by the company forever",
          "They cannot change during a trading day"
        ],

        correctIndex: 1
      }
    ]
  },

  {
    id: 3,
    name: "Financial Statements",
    xpRequired: 200,

    description:
      "Read revenue, expenses, profit margins, assets, and liabilities.",

    lesson:
      "Financial statements show how a business performs and how it finances itself. They help investors judge quality and risk.",

    xpReward: 80,

    questions: [
      {
        id: 1,
        question:
          "What is revenue?",

        options: [
          "Money a company earns from its business activities",
          "Money the company owes",
          "The company's stock price",
          "The company's total debt"
        ],

        correctIndex: 0
      },

      {
        id: 2,
        question:
          "What is profit?",

        options: [
          "Revenue minus relevant expenses",
          "Revenue plus expenses",
          "Total assets",
          "Total liabilities"
        ],

        correctIndex: 0
      },

      {
        id: 3,
        question:
          "Which of these is an asset?",

        options: [
          "A company loan",
          "Money owed to suppliers",
          "Cash owned by the company",
          "A company's unpaid bill"
        ],

        correctIndex: 2
      },

      {
        id: 4,
        question:
          "Which of these is a liability?",

        options: [
          "Cash",
          "Inventory",
          "Equipment",
          "Debt owed by the company"
        ],

        correctIndex: 3
      },

      {
        id: 5,
        question:
          "A company has ₹10 lakh in revenue and ₹7 lakh in expenses. What is its profit?",

        options: [
          "₹3 lakh",
          "₹7 lakh",
          "₹10 lakh",
          "₹17 lakh"
        ],

        correctIndex: 0
      }
    ]
  },

  {
    id: 4,
    name: "Valuation",
    xpRequired: 350,

    description:
      "Learn how to compare prices and determine whether a stock is expensive or fairly valued.",

    lesson:
      "Valuation compares a company’s price to its earnings, growth, and assets. A lower price relative to value can mean better value.",

    xpReward: 90,

    questions: [
      {
        id: 1,
        question:
          "Why do investors look at valuation ratios like P/E?",

        options: [
          "To see how much investors are paying for each rupee of earnings",
          "To predict the weather",
          "To decide office locations",
          "To count company employees"
        ],

        correctIndex: 0
      },

      {
        id: 2,
        question:
          "What does valuation attempt to determine?",

        options: [
          "How popular a company is",
          "What a company or stock may be worth",
          "How many employees a company has",
          "How much cash investors have"
        ],

        correctIndex: 1
      },

      {
        id: 3,
        question:
          "What does the P/E ratio compare?",

        options: [
          "Profit and expenses",
          "Share price and earnings per share",
          "Assets and liabilities",
          "Revenue and cash flow"
        ],

        correctIndex: 1
      },

      {
        id: 4,
        question:
          "Why shouldn't investors rely on a single valuation metric?",

        options: [
          "Every metric is always incorrect",
          "Different metrics provide different perspectives",
          "Valuation doesn't matter",
          "Stock prices never change"
        ],

        correctIndex: 1
      },

      {
        id: 5,
        question:
          "A stock trading below an estimate of its intrinsic value might be described as:",

        options: [
          "Potentially undervalued",
          "Guaranteed to rise",
          "Overvalued",
          "Risk-free"
        ],

        correctIndex: 0
      }
    ]
  },

  {
    id: 5,
    name: "Portfolio Management",
    xpRequired: 500,

    description:
      "Build diversification, balance risk, and create a more resilient portfolio.",

    lesson:
      "A good portfolio spreads risk across sectors and asset types, instead of betting everything on one stock.",

    xpReward: 120,

    questions: [
      {
        id: 1,
        question:
          "What is diversification?",

        options: [
          "Putting all your money into one company",
          "Spreading investments across different assets or companies",
          "Buying only technology stocks",
          "Selling everything when prices fall"
        ],

        correctIndex: 1
      },

      {
        id: 2,
        question:
          "Why can diversification reduce risk?",

        options: [
          "Different investments may not all perform the same way at the same time",
          "It guarantees profits",
          "It eliminates all market risk",
          "It guarantees that prices will rise"
        ],

        correctIndex: 0
      },

      {
        id: 3,
        question:
          "What is asset allocation?",

        options: [
          "Deciding how to distribute investments among different asset classes",
          "Choosing a company's CEO",
          "Calculating revenue",
          "Predicting tomorrow's stock price"
        ],

        correctIndex: 0
      },

      {
        id: 4,
        question:
          "What does rebalancing a portfolio mean?",

        options: [
          "Completely selling your portfolio",
          "Adjusting investments to bring the portfolio back toward its intended allocation",
          "Buying only the best-performing stock",
          "Avoiding all investments"
        ],

        correctIndex: 1
      },

      {
        id: 5,
        question:
          "Which portfolio is generally more diversified?",

        options: [
          "100% invested in one company",
          "100% invested in one industry",
          "Investments spread across different assets and sectors",
          "100% invested in one stock"
        ],

        correctIndex: 2
      }
    ]
  }
];


function getAcademyState() {
  const defaultState = {
    xp: 0,
    completed: [],
    unlocked: [1],
    maxXpReached: false
  };

  try {
    const stored =
      JSON.parse(
        localStorage.getItem(
          getStorageKey(
            "academyState"
          )
        ) || "null"
      );

    if (
      !stored ||
      typeof stored !== "object"
    ) {
      return defaultState;
    }

    return {
      xp:
        Number(stored.xp) || 0,

      completed:
        Array.isArray(
          stored.completed
        )
          ? stored.completed
          : [],

      unlocked:
        Array.isArray(
          stored.unlocked
        )
          ? stored.unlocked
          : [1],

      maxXpReached:
        Boolean(
          stored.maxXpReached
        )
    };

  } catch {
    return defaultState;
  }
}


function saveAcademyState(
  state
) {
  localStorage.setItem(
    getStorageKey(
      "academyState"
    ),
    JSON.stringify(state)
  );
}


function getAcademyLevelName(xp) {
  if (xp >= 1000) {
    return "Master Investor 👑";
  }

  if (xp >= 500) {
    return "Investor";
  }

  if (xp >= 250) {
    return "Market Explorer";
  }

  if (xp >= 100) {
    return "Learner";
  }

  return "Beginner";
}


function openAcademyQuiz(
  levelId
) {
  const level =
    ACADEMY_LEVELS.find(
      item =>
        item.id === levelId
    );

  if (
    !level ||
    !level.questions ||
    level.questions.length === 0
  ) {
    return;
  }

  const modal =
    document.getElementById(
      "academy-quiz-modal"
    );

  const lessonEl =
    document.getElementById(
      "academy-lesson-copy"
    );

  const questionEl =
    document.getElementById(
      "academy-quiz-question"
    );

  const optionsEl =
    document.getElementById(
      "academy-quiz-options"
    );

  const submitBtn =
    document.getElementById(
      "academy-quiz-submit"
    );

  if (
    !modal ||
    !lessonEl ||
    !questionEl ||
    !optionsEl ||
    !submitBtn
  ) {
    return;
  }

  if (
    !currentAcademyQuiz ||
    currentAcademyQuiz.id !== levelId
  ) {
    currentAcademyQuiz = {
      ...level,
      currentQuestionIndex: 0,
      answers: [],
      selectedIndex: null
    };
  }

  const currentQuestion =
    level.questions[
      currentAcademyQuiz
        .currentQuestionIndex
    ];

  if (!currentQuestion) {
    return;
  }

  lessonEl.innerText =
    `Lesson: ${level.lesson}`;

  questionEl.innerText =
    `Question ${
      currentAcademyQuiz.currentQuestionIndex + 1
    }/${level.questions.length}: ${
      currentQuestion.question
    }`;

  optionsEl.innerHTML = "";

  currentAcademyQuiz.selectedIndex =
    null;

  currentQuestion.options.forEach(
    (option, index) => {
      const optionButton =
        document.createElement(
          "button"
        );

      optionButton.className =
        "academy-option";

      optionButton.type =
        "button";

      optionButton.innerText =
        option;

      optionButton.onclick =
        () => {
          document
            .querySelectorAll(
              ".academy-option"
            )
            .forEach(btn =>
              btn.classList.remove(
                "selected"
              )
            );

          optionButton.classList.add(
            "selected"
          );

          currentAcademyQuiz.selectedIndex =
            index;
        };

      optionsEl.appendChild(
        optionButton
      );
    }
  );

  submitBtn.innerText =
    currentAcademyQuiz.currentQuestionIndex ===
    level.questions.length - 1
      ? "Complete Level"
      : "Next Question";

  submitBtn.onclick = () => {
    if (
      currentAcademyQuiz.selectedIndex ===
      null
    ) {
      alert(
        "Select an answer first."
      );

      return;
    }

    currentAcademyQuiz.answers.push({
      questionIndex:
        currentAcademyQuiz.currentQuestionIndex,

      selectedIndex:
        currentAcademyQuiz.selectedIndex,

      correct:
        currentAcademyQuiz.selectedIndex ===
        currentQuestion.correctIndex
    });

    if (
      currentAcademyQuiz.selectedIndex ===
      currentQuestion.correctIndex
    ) {
      if (
        currentAcademyQuiz.currentQuestionIndex <
        level.questions.length - 1
      ) {
        currentAcademyQuiz.currentQuestionIndex++;

        openAcademyQuiz(
          levelId
        );

        return;
      }

      const correctCount =
        currentAcademyQuiz.answers.filter(
          a => a.correct
        ).length;

      const totalQuestions =
        level.questions.length;

      const allCorrect =
        correctCount ===
        totalQuestions;

      const answerState =
        getAcademyState();

      if (allCorrect) {
        const xpGain =
          level.xpReward;

        const previousXp =
          answerState.xp;

        answerState.xp +=
          xpGain;

        if (
          !answerState.completed.includes(
            level.id
          )
        ) {
          answerState.completed.push(
            level.id
          );
        }

        const nextUnlocked =
          Math.max(
            ...answerState.unlocked,
            level.id + 1
          );

        answerState.unlocked =
          Array.from(
            new Set(
              [
                ...answerState.unlocked,
                nextUnlocked
              ].filter(
                item =>
                  item <=
                  ACADEMY_LEVELS.length
              )
            )
          );

        if (
          previousXp < 1000 &&
          answerState.xp >= 1000 &&
          !answerState.maxXpReached
        ) {
          answerState.maxXpReached =
            true;

          saveAcademyState(
            answerState
          );

          alert(
            `🏆 MASTER INVESTOR UNLOCKED! 🏆\n\nYou have mastered StockN Academy!\n\nTotal XP: ${answerState.xp}\nLessons Completed: ${answerState.completed.length}\n\nYou are now a Master Investor! 👑`
          );

        } else {
          saveAcademyState(
            answerState
          );

          alert(
            `Excellent! You got ${correctCount}/${totalQuestions} correct. +${xpGain} XP 🎉`
          );
        }

      } else {
        alert(
          `You got ${correctCount}/${totalQuestions} correct. Try again to master this level!`
        );
      }

      renderAcademy();
      closeAcademyQuiz();

    } else {
      alert(
        `Not quite. The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}\n\nTry the next question!`
      );

      if (
        currentAcademyQuiz.currentQuestionIndex <
        level.questions.length - 1
      ) {
        currentAcademyQuiz.currentQuestionIndex++;

        openAcademyQuiz(
          levelId
        );

      } else {
        const correctCount =
          currentAcademyQuiz.answers.filter(
            a => a.correct
          ).length;

        const totalQuestions =
          level.questions.length;

        alert(
          `Level complete! You got ${correctCount}/${totalQuestions} correct. Review the lesson and try again!`
        );

        renderAcademy();
        closeAcademyQuiz();
      }
    }
  };

  modal.classList.add(
    "visible"
  );
}


function closeAcademyQuiz() {
  const modal =
    document.getElementById(
      "academy-quiz-modal"
    );

  if (modal) {
    modal.classList.remove(
      "visible"
    );
  }

  currentAcademyQuiz =
    null;
}


function renderAcademy() {
  const state =
    getAcademyState();

  const academySteps =
    document.getElementById(
      "academy-steps"
    );

  const xpEl =
    document.getElementById(
      "academy-xp"
    );

  const levelNameEl =
    document.getElementById(
      "academy-level-name"
    );

  const progressFill =
    document.getElementById(
      "academy-progress-fill"
    );

  const metaEl =
    document.getElementById(
      "academy-meta"
    );

  if (
    !academySteps ||
    !xpEl ||
    !levelNameEl ||
    !progressFill ||
    !metaEl
  ) {
    return;
  }

  const totalXp = 1000;

  const progress =
    Math.min(
      100,
      (state.xp /
        totalXp) *
        100
    );

  const levelName =
    getAcademyLevelName(
      state.xp
    );

  xpEl.innerText =
    `${state.xp} / ${totalXp}`;

  levelNameEl.innerText =
    levelName;

  progressFill.style.width =
    `${progress}%`;

  metaEl.innerText =
    `XP: ${state.xp} • Badges: ${state.completed.length} • Certificates: ${Math.min(
      3,
      Math.floor(
        state.completed.length /
          2
      )
    )}`;

  academySteps.innerHTML =
    ACADEMY_LEVELS.map(
      level => {
        const isUnlocked =
          state.unlocked.includes(
            level.id
          ) ||
          level.id === 1;

        const isCompleted =
          state.completed.includes(
            level.id
          );

        const isLocked =
          !isUnlocked;

        return `
          <div
            class="academy-step ${
              isCompleted
                ? "completed"
                : ""
            } ${
              isLocked
                ? "locked"
                : ""
            }"
            data-level="${level.id}"
            tabindex="0"
          >

            <span class="level-badge">
              Level ${level.id}
            </span>

            <h3>
              ${escapeHTML(
                level.name
              )}
            </h3>

            <p>
              ${escapeHTML(
                level.description
              )}
            </p>

            <div class="academy-detail">

              <strong>
                Lesson:
              </strong>

              ${escapeHTML(
                level.lesson
              )}

              <div class="academy-actions">

                ${
                  isLocked
                    ? `
                      <button
                        class="button button-disabled"
                        disabled
                      >
                        Locked
                      </button>
                    `
                    : `
                      <button
                        type="button"
                        class="button academy-open-quiz"
                        data-level-id="${level.id}"
                        onclick="openAcademyQuiz(${level.id})"
                      >
                        ${
                          isCompleted
                            ? "Review"
                            : "Open lesson"
                        }
                      </button>
                    `
                }

              </div>
            </div>
          </div>
        `;
      }
    ).join("");

  academySteps
    .querySelectorAll(
      ".academy-open-quiz"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        event => {
          event.stopPropagation();

          const levelId =
            Number(
              button.dataset.levelId
            );

          openAcademyQuiz(
            levelId
          );
        }
      );
    });

  document
    .querySelectorAll(
      ".academy-step"
    )
    .forEach(step => {
      step.addEventListener(
        "click",
        () => {
          const isLocked =
            step.classList.contains(
              "locked"
            );

          if (isLocked) {
            return;
          }

          const isOpen =
            step.classList.contains(
              "active"
            );

          document
            .querySelectorAll(
              ".academy-step"
            )
            .forEach(item =>
              item.classList.remove(
                "active"
              )
            );

          if (!isOpen) {
            step.classList.add(
              "active"
            );
          }
        }
      );

      step.addEventListener(
        "keydown",
        event => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            step.click();
          }
        }
      );
    });
}


/* =========================================================
   UI
========================================================= */

function updateUI() {
  const equityValue =
    portfolio.reduce(
      (sum, holding) =>
        sum +
        getHoldingValue(
          holding
        ),
      0
    );

  const totalPL =
    portfolio.reduce(
      (sum, holding) =>
        sum +
        getHoldingAdjustedPL(
          holding
        ),
      0
    );

  const health =
    calculatePortfolioHealth();

  const balanceEl =
    document.getElementById(
      "balance"
    );

  const equityEl =
    document.getElementById(
      "equity"
    );

  const plEl =
    document.getElementById(
      "pl"
    );

  if (balanceEl) {
    balanceEl.innerText =
      formatCurrency(
        balance
      );
  }

  if (equityEl) {
    equityEl.innerText =
      formatCurrency(
        balance +
          equityValue
      );
  }

  if (plEl) {
    plEl.innerText =
      formatCurrency(
        totalPL
      );
  }

  const healthScoreEl =
    document.getElementById(
      "portfolio-health-score"
    );

  const healthReasonEl =
    document.getElementById(
      "portfolio-health-reason"
    );

  if (healthScoreEl) {
    healthScoreEl.innerText =
      `${health.score}/100`;
  }

  if (healthReasonEl) {
    healthReasonEl.innerText =
      health.reason;
  }

  const portfolioDiv =
    document.getElementById(
      "portfolio"
    );

  if (!portfolioDiv) {
    return;
  }

  if (portfolio.length === 0) {
    portfolioDiv.innerHTML =
      '<div class="empty">No holdings yet. Buy a stock to start tracking profit/loss.</div>';

  } else {
    let html = `
      <div class="portfolio-header">
        <span>Stock</span>
        <span>Qty</span>
        <span>Avg Cost</span>
        <span>Current</span>
        <span>P/L %</span>
        <span>P/L</span>
        <span>Adj.</span>
        <span>Action</span>
      </div>
    `;

    portfolio.forEach(
      (item, index) => {
        const current =
          currentPrices[
            item.name
          ]?.price;

        const marketPrice =
          current === null ||
          current === undefined
            ? item.avgCost
            : current;

        const plValue =
          getHoldingAdjustedPL(
            item
          );

        const plPercent =
          getHoldingPercent(
            item
          );

        const plClass =
          plValue >= 0
            ? "positive"
            : "negative";

        const adjustment =
          parseFloat(
            item.manualAdjustment ||
              0
          ) || 0;

        html += `
          <div class="portfolio-row">

            <span>
              ${escapeHTML(
                item.name
              )}
            </span>

            <span>
              ${item.quantity}
            </span>

            <span>
              ${formatCurrency(
                item.avgCost
              )}
            </span>

            <span>
              ${formatCurrency(
                marketPrice
              )}
            </span>

            <span class="${plClass}">
              ${formatPercent(
                plPercent
              )}
            </span>

            <span class="${plClass}">
              ${formatCurrency(
                plValue
              )}
            </span>

            <span>
              <input
                class="manual-input"
                type="number"
                step="1"
                value="${adjustment}"
                onchange="updateManualPL(${index}, this.value)"
              >
            </span>

            <button
              class="sell-button"
              onclick="sellStock(${index})"
            >
              Sell
            </button>

          </div>
        `;
      }
    );

    portfolioDiv.innerHTML =
      html;
  }

  renderHistory();

  drawPortfolioChart();

  renderAiSummary();
}


/* =========================================================
   ADD STOCK
========================================================= */

async function addStock() {
  const input =
    document.getElementById(
      "search"
    );

  if (!input) {
    return;
  }

  const rawSymbol =
    input.value.trim();

  const symbol =
    normalizeSearchSymbol(
      rawSymbol
    );

  if (!symbol) {
    clearSearchResult(
      "Enter a stock symbol to add."
    );

    return;
  }

  if (
    STOCKS.some(
      stock =>
        stock.symbol ===
        symbol
    )
  ) {
    clearSearchResult(
      `${symbol} is already in the list.`
    );

    return;
  }

  clearSearchResult(
    "Looking up symbol..."
  );

  const data =
    await fetchStockData(
      symbol
    );

  if (
    !data ||
    !data.price
  ) {
    clearSearchResult(
      `Symbol not found or price unavailable for ${rawSymbol}.`
    );

    return;
  }

  const label =
    getStockLabel(symbol);

  STOCKS.push({
    label,
    symbol
  });

  currentPrices[
    symbol
  ] = data;

  clearSearchResult(
    `${label} added. Scroll down to buy or chart.`
  );

  renderSearchResult(
    symbol,
    data
  );

  await loadStockPrices();
}


/* =========================================================
   SEARCH RESULT
========================================================= */

function renderSearchResult(
  symbol,
  data
) {
  const label =
    getStockLabel(symbol);

  const result =
    document.getElementById(
      "search-result"
    );

  if (!result) {
    return;
  }

  const suggestion =
    getAiSuggestion(
      symbol,
      data
    );

  const suggestionClass =
    getSuggestionClass(
      suggestion.action
    );

  result.innerHTML = `
    <div class="stock search-result-card">

      <div class="stock-title">
        ${escapeHTML(label)}
      </div>

      <div class="stock-price">
        ${formatCurrency(
          data.price
        )}
      </div>

      <div class="source">
        ${escapeHTML(
          data.source
        )}
      </div>

      <div class="suggestion ${suggestionClass}">
        ${escapeHTML(
          suggestion.action
        )}:
        ${escapeHTML(
          suggestion.reason
        )}
      </div>

      <div class="stock-change ${
        data.change >= 0
          ? "up"
          : "down"
      }">

        ${
          data.change >= 0
            ? "🟢"
            : "🔴"
        }

        ${formatPercent(
          data.percent
        )}

      </div>

      <button
        onclick="buyStockBySymbol('${escapeHTML(
          symbol
        )}')"
      >
        Buy
      </button>

      <button
        onclick="drawChart('${escapeHTML(
          symbol
        )}')"
      >
        Chart
      </button>

    </div>
  `;
}


/* =========================================================
   CHARTS
========================================================= */

async function drawChart(
  symbol
) {
  const chartData =
    await fetchChartSeries(
      symbol
    );

  if (!chartData) {
    alert(
      "Chart data unavailable. Please try again later or refresh prices."
    );

    return;
  }

  const chartCanvas =
    document.getElementById(
      "chart"
    );

  if (!chartCanvas) {
    return;
  }

  const ctx =
    chartCanvas.getContext(
      "2d"
    );

  const sourceLabel =
    chartData.source ===
    "simulated"
      ? "Simulated data"
      : "Real data";

  const sourceEl =
    document.getElementById(
      "chart-source"
    );

  if (sourceEl) {
    sourceEl.innerText =
      `Data source: ${sourceLabel}`;
  }

  if (stockChart) {
    stockChart.destroy();
  }

  stockChart =
    new Chart(
      ctx,
      {
        type: "line",

        data: {
          labels:
            chartData.labels,

          datasets: [
            {
              label:
                `${symbol} (${sourceLabel})`,

              data:
                chartData.prices,

              borderColor:
                "#00ffcc",

              backgroundColor:
                "rgba(0, 255, 204, 0.2)",

              fill: true,
              tension: 0.2,
              pointRadius: 3
            }
          ]
        },

        options: {
          responsive: true,

          scales: {
            x: {
              ticks: {
                color: "#aaa"
              }
            },

            y: {
              ticks: {
                color: "#aaa"
              }
            }
          }
        }
      }
    );
}


function drawPortfolioChart() {
  const canvas =
    document.getElementById(
      "portfolio-chart"
    );

  if (!canvas) {
    return;
  }

  const labels =
    portfolioHistory.map(
      point =>
        new Date(
          point.time
        ).toLocaleTimeString()
    );

  const values =
    portfolioHistory.map(
      point =>
        point.value
    );

  const ctx =
    canvas.getContext(
      "2d"
    );

  if (portfolioChart) {
    portfolioChart.destroy();
  }

  portfolioChart =
    new Chart(
      ctx,
      {
        type: "line",

        data: {
          labels,

          datasets: [
            {
              label:
                "Portfolio Value",

              data: values,

              borderColor:
                "#7dd2ff",

              backgroundColor:
                "rgba(125, 210, 255, 0.2)",

              fill: true,
              tension: 0.3,
              pointRadius: 3
            }
          ]
        },

        options: {
          responsive: true,

          scales: {
            x: {
              ticks: {
                color: "#aaa"
              }
            },

            y: {
              ticks: {
                color: "#aaa"
              }
            }
          }
        }
      }
    );
}


/* =========================================================
   HISTORICAL CHART DATA
========================================================= */

async function fetchChartSeries(
  symbol
) {
  try {
    const dailyUrl =
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
        symbol
      )}&apikey=${API_KEY}`;

    const dailyResponse =
      await fetch(
        dailyUrl
      );

    if (!dailyResponse.ok) {
      throw new Error(
        `Alpha Vantage chart HTTP ${dailyResponse.status}`
      );
    }

    const dailyData =
      await dailyResponse.json();

    if (
      dailyData.Note ||
      dailyData["Error Message"] ||
      !dailyData[
        "Time Series (Daily)"
      ]
    ) {
      console.warn(
        "Alpha Vantage warning:",
        dailyData.Note ||
          dailyData[
            "Error Message"
          ]
      );

      return generateFallbackChart(
        symbol
      );
    }

    const series =
      dailyData[
        "Time Series (Daily)"
      ];

    const labels =
      Object.keys(
        series
      )
        .slice(0, 10)
        .reverse();

    return {
      labels,

      prices:
        labels.map(
          time =>
            parseFloat(
              series[time][
                "4. close"
              ]
            )
        ),

      source: "real"
    };

  } catch (error) {
    console.warn(
      "Chart data failed:",
      error
    );

    return generateFallbackChart(
      symbol
    );
  }
}


function generateFallbackChart(
  symbol
) {
  const current =
    currentPrices[
      symbol
    ]?.price ||
    FALLBACK_PRICES[
      symbol
    ] ||
    100;

  const labels =
    Array.from(
      {
        length: 10
      },
      (_, idx) => {
        const date =
          new Date();

        date.setDate(
          date.getDate() -
            (9 - idx)
        );

        return date
          .toISOString()
          .slice(0, 10);
      }
    );

  let price =
    current * 0.98;

  const prices =
    labels.map(
      () => {
        price *=
          1 +
          (
            Math.random() -
            0.45
          ) *
            0.03;

        return parseFloat(
          price.toFixed(2)
        );
      }
    );

  return {
    labels,
    prices,
    source: "simulated"
  };
}


function setLastUpdate() {
  const now =
    new Date();

  const lastUpdateEl =
    document.getElementById(
      "last-update"
    );

  if (lastUpdateEl) {
    lastUpdateEl.innerText =
      now.toLocaleTimeString();
  }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    loadState();

    const currentUserName =
      typeof getCurrentUserName ===
      "function"
        ? getCurrentUserName()
        : null;

    const currentUserEmail =
      typeof getCurrentUser ===
      "function"
        ? getCurrentUser()
        : null;

    const loginInfo =
      document.getElementById(
        "logged-in-as"
      );

    if (loginInfo) {
      if (currentUserName) {
        loginInfo.innerText =
          `Welcome, ${currentUserName}`;
      } else if (
        currentUserEmail
      ) {
        loginInfo.innerText =
          `Signed in as ${currentUserEmail}`;
      }
    }

    renderAcademy();

    const refreshButton =
      document.getElementById(
        "refresh"
      );

    if (refreshButton) {
      refreshButton.addEventListener(
        "click",
        loadStockPrices
      );
    }

    const deleteButton =
      document.getElementById(
        "delete-account"
      );

    if (deleteButton) {
      deleteButton.addEventListener(
        "click",
        deleteCurrentUserAccount
      );
    }

    const searchButton =
      document.getElementById(
        "search-button"
      );

    if (searchButton) {
      searchButton.addEventListener(
        "click",
        searchMarket
      );
    }

    const searchInput =
      document.getElementById(
        "search"
      );

    if (searchInput) {
      searchInput.addEventListener(
        "keypress",
        event => {
          if (
            event.key ===
            "Enter"
          ) {
            event.preventDefault();
            searchMarket();
          }
        }
      );
    }

    document
      .querySelectorAll(
        ".asset-filter"
      )
      .forEach(button => {
        button.addEventListener(
          "click",
          () =>
            setFilterType(
              button.dataset.type
            )
        );
      });

    await loadAssets();

    /*
      Firebase listener is started ONCE.
      It will automatically react whenever
      manualPrices changes.
    */
    subscribeToManualPrices();

    /*
      Initial market-price load.
    */
    await loadStockPrices();

    if (
      portfolioHistory.length ===
      0
    ) {
      recordPortfolioValue();
    }

    refreshTimer =
      setInterval(
        loadStockPrices,
        REFRESH_INTERVAL
      );
  }
);


/* =========================================================
   CROSS-TAB UPDATES
========================================================= */

window.addEventListener(
  "storage",
  event => {
    if (
      event.key ===
        "manualPrices" ||
      event.key ===
        "manualPricesUpdate"
    ) {
      /*
        Do not create another Firebase
        listener here.

        Just refresh the current data.
      */

      try {
        manualPrices =
          JSON.parse(
            localStorage.getItem(
              "manualPrices"
            ) || "{}"
          );
      } catch {
        manualPrices = {};
      }

      loadStockPrices();
      updateUI();
      renderHistory();
window.buyAsset = buyAsset;
window.sellAsset = sellAsset;
window.updatePrice = updatePrice;
window.marketCrash = marketCrash;
window.marketBoom = marketBoom;
<script type="module" src="script.js"></script>

    }
  }
git add .; git commit -m "Fix buy sell functions"; git push