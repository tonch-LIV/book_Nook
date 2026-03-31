'use strict';

//====================
// global variables  |
//===================

let books = [];
let reviewIndex = 0;

//===================================
// constructor for new books added  |
//==================================

function Book(author, title, genre, pages, rating, addedBy, review) {
  this.author = author;
  this.title = title;
  this.genre = genre;
  this.pages = pages;
  this.rating = rating;
  this.addedBy = addedBy;

  //  REPLACE simple review with object
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

    for (let key in book) {
      if (key !== 'review') {
        const td = document.createElement('td');
        td.textContent = book[key];
        row.appendChild(td);
      }
    }

    tbody.appendChild(row);
  }
};

//===========
// reviews  |
//==========

function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  container.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    const book = books[(reviewIndex + i) % books.length];

    if (!book) return;

    const card = document.createElement('div');
    card.classList.add('review-card');

    card.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.review?.text || "No review yet"}</p>
      <small>— ${book.author}</small>
    `;

    container.appendChild(card);
  }
};

//=================================
// function for data persistence  |
//================================

function saveToLocalStorage() {
  localStorage.setItem('books', JSON.stringify(books));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('books');

  if (data) {
    books = JSON.parse(data);
    renderTable();
    renderReviews();
  }
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

setInterval(() => {
  if (books.length > 0) {
    reviewIndex = (reviewIndex + 1) % books.length;
    renderReviews();
  }
}, 4000);