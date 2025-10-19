// script.js
// Dynamic Quote Generator with localStorage, sessionStorage, import/export JSON

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM elements ---
  const quoteTextEl = document.getElementById('quoteText');
  const quoteCategoryEl = document.getElementById('quoteCategory');
  const newQuoteBtn = document.getElementById('newQuote');
  const categorySelect = document.getElementById('categorySelect');
  const addFormContainer = document.getElementById('addFormContainer');
  const showAddFormBtn = document.getElementById('showAddFormBtn');
  const quotesList = document.getElementById('quotesList');
  const exportBtn = document.getElementById('exportBtn');
  const importFileInput = document.getElementById('importFile');
  const lastViewedEl = document.getElementById('lastViewed');

  // --- Data store ---
  const STORAGE_KEY = 'quotes_v1';
  const SESSION_LAST_INDEX = 'lastQuoteIndex_v1';

  // Initial sample quotes (will be overwritten by localStorage if present)
  const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "inspiration" },
    { text: "Good design is obvious. Great design is transparent.", category: "design" },
    { text: "Learn from yesterday, live for today, hope for tomorrow.", category: "life" },
  ];

  // --- Storage helpers ---
  function saveQuotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch (err) {
      console.error('Failed to save quotes to localStorage', err);
    }
  }

  function loadQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // clear current quotes array and push parsed
        quotes.splice(0, quotes.length, ...parsed);
        return true;
      }
    } catch (err) {
      console.warn('Could not parse stored quotes', err);
    }
    return false;
  }

  // Session storage: save index of last shown quote
  function saveLastViewedIndex(idx) {
    try {
      sessionStorage.setItem(SESSION_LAST_INDEX, String(idx));
      showLastViewed();
    } catch (err) { /* ignore */ }
  }

  function getLastViewedIndex() {
    try {
      const v = sessionStorage.getItem(SESSION_LAST_INDEX);
      if (v === null) return null;
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    } catch (err) { return null; }
  }

  function showLastViewed() {
    const idx = getLastViewedIndex();
    if (idx === null || idx < 0 || idx >= quotes.length) {
      lastViewedEl.textContent = '';
      return;
    }
    const q = quotes[idx];
    lastViewedEl.textContent = `Last viewed (session): "${truncate(q.text, 80)}" — ${q.category || 'unspecified'}`;
  }

  function truncate(str, len) {
    if (!str) return '';
    if (str.length <= len) return str;
    return str.slice(0, len - 1) + '…';
  }

  // --- Category helpers ---
  function getCategories() {
    const cats = new Set();
    quotes.forEach(q => {
      if (q && q.category) cats.add(q.category);
    });
    return Array.from(cats).sort();
  }

  function populateCategorySelect() {
    const prev = categorySelect.value || 'all';
    categorySelect.innerHTML = '<option value="all">All categories</option>';
    getCategories().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      categorySelect.appendChild(opt);
    });
    // restore selection if possible
    if ([...categorySelect.options].some(o => o.value === prev)) {
      categorySelect.value = prev;
    } else {
      categorySelect.value = 'all';
    }
  }

  function filteredQuotes() {
    const cat = categorySelect.value;
    if (!cat || cat === 'all') return quotes;
    return quotes.filter(q => q.category === cat);
  }

  // --- Show a random quote ---
  function showRandomQuote() {
    const pool = filteredQuotes();
    if (!pool.length) {
      quoteTextEl.textContent = "No quotes available in this category.";
      quoteCategoryEl.textContent = "";
      return;
    }
    const idxInPool = Math.floor(Math.random() * pool.length);
    const q = pool[idxInPool];

    // determine global index (for session storage)
    const globalIndex = quotes.indexOf(q);
    quoteTextEl.textContent = q.text;
    quoteCategoryEl.textContent = q.category ? `Category: ${q.category}` : '';
    if (globalIndex >= 0) saveLastViewedIndex(globalIndex);
  }

  // --- Add new quote (used by the dynamic form) ---
  function addQuoteToData(text, category) {
    const cat = (category || 'general').trim().toLowerCase();
    const trimmedText = (text || '').trim();
    if (!trimmedText) return false;
    quotes.push({ text: trimmedText, category: cat });
    saveQuotes();
    populateCategorySelect();
    renderQuotesList();
    return true;
  }

  // --- Create add-quote form dynamically ---
  function createAddQuoteForm() {
    addFormContainer.innerHTML = ''; // clear
    const form = document.createElement('form');
    form.id = 'addQuoteForm';

    const row1 = document.createElement('div');
    row1.className = 'form-row';
    const inputText = document.createElement('textarea');
    inputText.id = 'newQuoteText';
    inputText.placeholder = 'Enter a new quote';
    inputText.rows = 3;
    inputText.style.minWidth = '280px';
    row1.appendChild(inputText);

    const row2 = document.createElement('div');
    row2.className = 'form-row';
    const inputCat = document.createElement('input');
    inputCat.id = 'newQuoteCategory';
    inputCat.placeholder = 'Enter category (e.g. inspiration)';
    row2.appendChild(inputCat);

    const row3 = document.createElement('div');
    row3.className = 'form-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Add Quote';
    addBtn.style.cursor = 'pointer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cursor = 'pointer';

    row3.appendChild(addBtn);
    row3.appendChild(cancelBtn);

    form.appendChild(row1);
    form.appendChild(row2);
    form.appendChild(row3);
    addFormContainer.appendChild(form);

    // add behavior
    addBtn.addEventListener('click', () => {
      const text = inputText.value.trim();
      const cat = (inputCat.value || 'general').trim().toLowerCase();
      if (!text) {
        alert('Please enter quote text.');
        inputText.focus();
        return;
      }
      // add to data
      const added = addQuoteToData(text, cat);
      if (added) {
        // auto-select the category of the new quote
        populateCategorySelect();
        categorySelect.value = cat;
        showRandomQuote();
        addFormContainer.innerHTML = '';
      } else {
        alert('Failed to add quote.');
      }
    });

    cancelBtn.addEventListener('click', () => {
      addFormContainer.innerHTML = '';
    });
  }

  // --- Render quotes list ---
  function renderQuotesList() {
    quotesList.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'All quotes';
    quotesList.appendChild(heading);

    quotes.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'quote-item';
      const textNode = document.createElement('div');
      textNode.textContent = q.text;
      const catNode = document.createElement('div');
      catNode.className = 'small';
      catNode.textContent = `Category: ${q.category}`;
      item.appendChild(textNode);
      item.appendChild(catNode);

      // delete button
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.marginLeft = '8px';
      del.addEventListener('click', () => {
        if (!confirm('Delete this quote?')) return;
        quotes.splice(i, 1);
        saveQuotes();
        populateCategorySelect();
        renderQuotesList();
      });
      item.appendChild(del);

      quotesList.appendChild(item);
    });
  }

  // --- JSON export ---
  function exportToJsonFile() {
    try {
      const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed');
    }
  }

  // --- JSON import ---
  function importFromJsonFile(file) {
    if (!file) {
      alert('No file selected.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Imported JSON must be an array of quotes');
        // Validate items
        const valid = [];
        parsed.forEach(item => {
          if (item && typeof item.text === 'string') {
            const cat = (item.category || 'general').toString().trim().toLowerCase();
            valid.push({ text: item.text.toString(), category: cat });
          }
        });
        if (!valid.length) throw new Error('No valid quotes found in imported file.');
        // Option: ask user if they want to append or replace
        const choice = confirm(`Import will add ${valid.length} quote(s). Press OK to append, Cancel to replace all quotes.`);
        if (choice) {
          // append
          quotes.push(...valid);
        } else {
          // replace
          quotes.splice(0, quotes.length, ...valid);
        }
        saveQuotes();
        populateCategorySelect();
        renderQuotesList();
        alert('Quotes imported successfully!');
      } catch (err) {
        console.error('Import error', err);
        alert('Failed to import JSON file: ' + (err.message || err));
      }
    };
    reader.onerror = function () {
      alert('Failed to read file');
    };
    reader.readAsText(file);
  }

  // --- Wire initial UI and storage ---
  (function init() {
    const loaded = loadQuotes();
    if (!loaded) {
      // save default set if no data found
      saveQuotes();
    }
    populateCategorySelect();
    renderQuotesList();

    // show last viewed if session info exists
    showLastViewed();

    // If session had a last viewed index, show that quote in display
    const lastIdx = getLastViewedIndex();
    if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
      const q = quotes[lastIdx];
      quoteTextEl.textContent = q.text;
      quoteCategoryEl.textContent = q.category ? `Category: ${q.category}` : '';
    } else {
      showRandomQuote();
    }
  })();

  // --- Event listeners ---
  newQuoteBtn.addEventListener('click', showRandomQuote);
  categorySelect.addEventListener('change', showRandomQuote);
  showAddFormBtn.addEventListener('click', () => {
    if (addFormContainer.children.length) addFormContainer.innerHTML = '';
    else createAddQuoteForm();
  });

  exportBtn.addEventListener('click', exportToJsonFile);

  importFileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importFromJsonFile(f);
    // clear input so same file can be reselected later if needed
    importFileInput.value = '';
  });

});