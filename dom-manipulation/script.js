
// Export quotes to JSON file
function exportToJsonFile() {
  const quotes = JSON.parse(localStorage.getItem('quotes_v1') || '[]');
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes_export.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        const existingQuotes = JSON.parse(localStorage.getItem('quotes_v1') || '[]');
        existingQuotes.push(...importedQuotes);
        localStorage.setItem('quotes_v1', JSON.stringify(existingQuotes));
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format. Must be an array of quotes.');
      }
    } catch (error) {
      alert('Error reading JSON file.');
    }
  };
  reader.readAsText(file);
}

// ---------- APP LOGIC ----------
document.addEventListener('DOMContentLoaded', () => {
  let quotes = JSON.parse(localStorage.getItem('quotes_v1')) || [
    { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivation" },
    { text: "Stay hungry, stay foolish.", category: "Wisdom" }
  ];

  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuote');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');

  // Save quotes to local storage
  function saveQuotes() {
    localStorage.setItem('quotes_v1', JSON.stringify(quotes));
  }

  // Display random quote
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.textContent = "No quotes available.";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote)); // store last viewed quote
  }

  // Add new quote
  window.addQuote = function() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    if (text && category) {
      quotes.push({ text, category });
      saveQuotes();
      newQuoteText.value = '';
      newQuoteCategory.value = '';
      alert('Quote added successfully!');
    } else {
      alert('Please fill out both fields.');
    }
  };

  // Show last viewed quote if exists
  const lastViewed = sessionStorage.getItem('lastViewedQuote');
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;
  } else {
    showRandomQuote();
  }

  // Button listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
});
