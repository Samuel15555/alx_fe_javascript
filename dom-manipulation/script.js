let quotes = [];
let lastSelectedCategory = "all";

// Load quotes and category filter from localStorage on page load
window.onload = function() {
  const storedQuotes = localStorage.getItem("quotes");
  const storedCategory = localStorage.getItem("lastCategory");

  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }

  if (storedCategory) {
    lastSelectedCategory = storedCategory;
  }

  populateCategories();
  displayQuotes();

  // Restore the last selected category
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.value = lastSelectedCategory;
};

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Add new quote with category
function addQuote() {
  const quoteInput = document.getElementById("quoteInput");
  const categoryInput = document.getElementById("categoryInput");

  const newQuote = quoteInput.value.trim();
  const category = categoryInput.value.trim() || "Uncategorized";

  if (newQuote) {
    quotes.push({ text: newQuote, category: category });
    saveQuotes();
    populateCategories();
    displayQuotes();
    quoteInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter a quote before adding.");
  }
}

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options (keep 'All Categories')
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Display quotes (filtered)
function displayQuotes(filteredQuotes = quotes) {
  const quoteList = document.getElementById("quoteList");
  quoteList.innerHTML = "";

  filteredQuotes.forEach(q => {
    const li = document.createElement("li");
    li.textContent = `${q.text} — (${q.category})`;
    quoteList.appendChild(li);
  });
}

// Filter quotes based on selected category (required name)
function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  lastSelectedCategory = selectedCategory;

  // Save selected category to localStorage
  localStorage.setItem("lastCategory", selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filteredQuotes);
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    displayQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}
