// ===== Quotes Array =====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Believe in yourself!", category: "Motivation" },
  { text: "The best way to learn is to teach.", category: "Wisdom" },
  { text: "Keep pushing forward.", category: "Inspiration" }
];

// ======== DOM Elements ========
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ======== Local Storage Handling ========
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ======== Category Handling ========
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

// ======== Display Quotes ========
function displayQuotes(quotesArray) {
  if (!quoteDisplay) return;
  quoteDisplay.innerHTML = "";
  quotesArray.forEach(q => {
    const div = document.createElement("div");
    div.classList.add("quote-item");
    div.textContent = `${q.text} (${q.category})`;
    quoteDisplay.appendChild(div);
  });
}

// ======== Import & Export ========
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

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

// ======== Server Sync Simulation ========
async function syncWithServer() {
  syncStatus.textContent = "Status: Syncing...";
  try {
    // Simulate fetching from mock API
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
    const serverData = await response.json();

    // Convert mock data to quote format
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: Server takes precedence
    const combinedQuotes = mergeQuotes(quotes, serverQuotes);
    quotes = combinedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    syncStatus.textContent = "Status: Synced successfully (Server data applied)";
  } catch (error) {
    syncStatus.textContent = "Status: Sync failed. Please try again.";
    console.error("Sync error:", error);
  }
}

// ======== Merge Quotes (Conflict Resolution) ========
function mergeQuotes(localQuotes, serverQuotes) {
  const textSet = new Set(serverQuotes.map(q => q.text));
  const merged = [...serverQuotes];
  localQuotes.forEach(q => {
    if (!textSet.has(q.text)) merged.push(q);
  });
  return merged;
}

// ======== Initialization ========
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
});
