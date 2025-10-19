// ===== Quotes Array =====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself!", category: "Motivation" },
  { text: "The best way to learn is to teach.", category: "Wisdom" },
  { text: "Keep pushing forward.", category: "Inspiration" }
];

// ===== DOM Elements =====
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ===== Save Quotes to Local Storage =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===== Display Quotes =====
function displayQuotes(quotesArray) {
  quoteDisplay.innerHTML = "";
  quotesArray.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quote-item");
    div.textContent = `${q.text} (${q.category})`;
    quoteDisplay.appendChild(div);
  });
}

// ===== Add New Quote =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newQuote = { text: textInput.value.trim(), category: categoryInput.value.trim() };

  if (newQuote.text && newQuote.category) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please fill in both fields!");
  }
}

// ===== Populate Categories =====
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  } else {
    displayQuotes(quotes);
  }
}

// ===== Filter Quotes =====
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  if (selectedCategory === "all") {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    displayQuotes(filtered);
  }
}

// ===== Export Quotes to JSON =====
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Import Quotes from JSON =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayQuotes(quotes);
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Fetch Quotes from Server =====
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

// ===== Post Quotes to Server =====
async function postQuotesToServer(newQuotes) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuotes)
    });
    console.log("Quotes posted successfully!");
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// ===== Merge Quotes (Conflict Resolution) =====
function mergeQuotes(localQuotes, serverQuotes) {
  const textSet = new Set(serverQuotes.map(q => q.text));
  const merged = [...serverQuotes];
  localQuotes.forEach(q => {
    if (!textSet.has(q.text)) merged.push(q);
  });
  return merged;
}

// ===== Sync Quotes (Main Sync Function) =====
async function syncQuotes() {
  syncStatus.textContent = "Status: Syncing with server...";
  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length > 0) {
    const merged = mergeQuotes(quotes, serverQuotes);
    quotes = merged;
    saveQuotes();
    populateCategories();
    filterQuotes();

    await postQuotesToServer(quotes);
    syncStatus.textContent = "Status: Synced successfully with server!";
    showNotification("Quotes synced successfully!");
  } else {
    syncStatus.textContent = "Status: Sync failed (no server data).";
    showNotification("Failed to fetch server data.");
  }
}

// ===== Periodic Sync Every 60 Seconds =====
setInterval(syncQuotes, 60000);

// ===== UI Notification =====
function showNotification(message) {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.className = "notification";
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
});
