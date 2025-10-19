// script.js
// Dynamic Quote Generator with categories and add-quote form

document.addEventListener('DOMContentLoaded', () => {
  // Initial sample quotes
  const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "design" },
    { text: "Strive not to be a success, but rather to be of value.", category: "inspiration" },
    { text: "Good design is obvious. Great design is transparent.", category: "design" },
    { text: "Learn from yesterday, live for today, hope for tomorrow.", category: "life" },
  ];

  // DOM elements
  const quoteTextEl = document.getElementById('quoteText');
  const quoteCategoryEl = document.getElementById('quoteCategory');
  const newQuoteBtn = document.getElementById('newQuote');
  const categorySelect = document.getElementById('categorySelect');
  const addFormContainer = document.getElementById('addFormContainer');
  const showAddFormBtn = document.getElementById('showAddFormBtn');
  const quotesList = document.getElementById('quotesList');

  // utility: get unique categories
  function getCategories() {
    const cats = new Set();
    quotes.forEach(q => cats.add(q.category));
    return Array.from(cats).sort();
  }

  // populate category dropdown
  function populateCategorySelect() {
    // keep "all" option at top
    const current = categorySelect.value || 'all';
    categorySelect.innerHTML = '<option value="all">All categories</option>';
    getCategories().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
      categorySelect.appendChild(opt);
    });
    // restore selection if possible
    categorySelect.value = current;
  }

  // filter quotes by selected category
  function filteredQuotes() {
    const cat = categorySelect.value;
    if (!cat || cat === 'all') return quotes;
    return quotes.filter(q => q.category === cat);
  }

  // show a random quote from the currently selected category
  function showRandomQuote() {
    const pool = filteredQuotes();
    if (!pool.length) {
      quoteTextEl.textContent = "No quotes available in this category.";
      quoteCategoryEl.textContent = "";
      return;
    }
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool[idx];
    quoteTextEl.textContent = q.text;
    quoteCategoryEl.textContent = q.category ? `Category: ${q.category}` : '';
  }

  // create add-quote form (if not already created)
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
      // add to quotes array
      quotes.push({ text, category: cat });
      populateCategorySelect();
      renderQuotesList();
      // auto-select the category of the new quote
      categorySelect.value = cat;
      showRandomQuote();
      // clear form
      addFormContainer.innerHTML = '';
    });

    cancelBtn.addEventListener('click', () => {
      addFormContainer.innerHTML = '';
    });
  }

  // render the list of quotes (simple management list)
  function renderQuotesList() {
    quotesList.innerHTML = '';
    const heading = document.createElement('h3');
    heading.textContent = 'All quotes';
    quotesList.appendChild(heading);

    quotes.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'quote-item';
      item.innerHTML = `<div>${q.text}</div><div class="small">Category: ${q.category}</div>`;
      // optional: add delete button
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.marginLeft = '8px';
      del.addEventListener('click', () => {
        if (!confirm('Delete this quote?')) return;
        quotes.splice(i, 1);
        populateCategorySelect();
        renderQuotesList();
      });
      item.appendChild(del);

      quotesList.appendChild(item);
    });
  }

  // initial UI wiring
  populateCategorySelect();
  renderQuotesList();
  showRandomQuote();

  newQuoteBtn.addEventListener('click', showRandomQuote);
  categorySelect.addEventListener('change', showRandomQuote);
  showAddFormBtn.addEventListener('click', () => {
    // toggle add form
    if (addFormContainer.children.length) addFormContainer.innerHTML = '';
    else createAddQuoteForm();
  });

});
