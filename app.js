'use strict';

//====================
// global variables  |
//===================

let books = [];
let reviewIndex = 0;

const baseBooks = [
  new Book('Allende, Isabel', 'The Wind Knows My Name', 'World History, Current Events, War, Loss', 272, 4, 'I', ''),
  new Book('Garcia-Roza, Luiz Alfredo', 'The Silence of the Rain', 'International, Mystery, Detective, Corruption, Drama', 272, 4, 'I', ''),
  new Book('Kim, Angie', 'Miracle Creek', 'Mystery, Crime, Legal', 368, 4, 'I', ''),
  new Book('Bearden, Milton', 'The Black Tulip', 'World History, War, Espionage, History, Comaradirie, Underworld, Parallels, Beaurocracy, Thriller', 336, 4, 'I', ''),
  new Book('Balson, Ronald H.', 'Once We Were Brothers', 'History, Romance, Corruption. War Crimes, Legal, Investigative, Vengance', 394, 4, 'I', ''),
  new Book('Bourdain, Anthony', 'Bone in the Throat', 'Crime, Detective, Culinary, Murder, Beaurocracy', 1 , 3, 'I', ''),
  new Book('Coelho, Paulo', 'The Fifth Mountain', '', 245, 3, 'I', ''),
  // new Book('Garcia-Roza, Luiz Alfredo', 'The Silence of the Rain', 'Detective', 272, 4, 'I', ''),


];

//===================================
// constructor for new books added  |
//==================================

function Book(author, title, genre, pages, rating, addedBy, review) {
  this.id = Date.now(); //every book receives unique id; timestamp
  this.author = author;
  this.title = title;
  this.genre = genre;
  this.pages = pages;
  this.rating = rating;
  this.addedBy = addedBy;

  //  REPLACE simple review with object; timestamp
  this.review = {
    text: review,
    date: new Date()
  };
};

//=========
// table  |
//========

function renderTable() {
  const tbody = document.querySelector('#bookTable tbody');
  tbody.innerHTML = '';

  for (let book of books) {
    const row = document.createElement('tr');

    const fields = ['author', 'title', 'genre', 'pages', 'rating', 'addedBy'];

    // matches order of thead; scalable for adding images
    for (let field of fields) {
      const td = document.createElement('td');
      td.textContent = book[field];
      row.appendChild(td);
    }

    tbody.appendChild(row);
  }
};

//===========
// reviews  |
//==========

function renderReviews() {
  const container = document.getElementById('reviewsContainer');

  // sorting; ensures entries stay in original order, baseBooks first
  const sortedBooks = [...books].sort(
  (a, b) => new Date(b.review.date) - new Date(a.review.date)
);
  container.innerHTML = '';

  // ensures three reviews show up
  const displayCount = Math.min(3, sortedBooks.length);

  for (let i = 0; i < displayCount; i++) {
    const book = sortedBooks[(reviewIndex + i) % sortedBooks.length];

    // continues if less than two books to choose from
    if (!book) continue;

    const card = document.createElement('div');
    card.classList.add('review-card');

    // protects from error and crashing if `book.review` and `date` is missing
    const date = book.review?.date
      ? new Date(book.review.date).toLocaleDateString()
      : '';

    card.innerHTML = `
      <h3>${book.title}</h3>
      <p class="author">by ${book.author}</p>
      <p>"${book.review?.text || "No review yet"}"</p>
      <small>${date}</small>
    `;

    container.appendChild(card);
  }
};

//=================================
// function for data persistence  |
//================================

function saveToLocalStorage() {
  // exclude baseBooks to prevent duplicates
  const userBooks = books.slice(baseBooks.length);
  localStorage.setItem('books', JSON.stringify(userBooks));
};

function loadFromLocalStorage() {
  const data = localStorage.getItem('books');

  let userBooks = [];

  if (data) {
    userBooks = JSON.parse(data);
  }

  // combine base + user books
  books = [...baseBooks, ...userBooks];

  renderTable();
  renderReviews();
};

//============================
// button listener for form  |
//===========================

const form = document.getElementById('bookForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const newBook = new Book(
    e.target.author.value,
    e.target.title.value,
    e.target.genre.value,
    e.target.pages.value,
    e.target.rating.value,
    e.target.addedBy.value,
    e.target.review.value //  makes sure textarea exists
  );

  books.push(newBook);

  renderTable();
  renderReviews();
  saveToLocalStorage();

  form.reset(); // UX bonus
});


//=====================
// load on page load  |
//====================

loadFromLocalStorage();

// timer
setInterval(() => {
  if (books.length > 0) {
    reviewIndex = (reviewIndex + 1) % books.length;
    renderReviews();
  }
}, 4000);