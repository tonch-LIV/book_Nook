'use strict';

//====================
// global variables  |
//===================

let books = [];
let reviewIndex = 0;

// stores chart and re-renders cleanly/prevents duplicates
let chartInstance = null;

const baseBooks = [
  new Book('Allende, Isabel', 'The Wind Knows My Name', 'Historical Fiction, Drama', 272, 4, 'Antonio', 'A blend of history with personal loss.'),
  new Book('Garcia-Roza, Luiz Alfredo', 'The Silence of the Rain', 'Mystery, Detective, Crime', 272, 4, 'Antonio', 'Slow-burn detective story that strongly portrays atmosphere and environment.'),
  new Book('Kim, Angie', 'Miracle Creek', 'Mystery, Crime, Legal', 368, 4, 'Antonio', 'Courtroom drama trying to solve a mystery that involves complex characters with layered morals and values.'),
  new Book('Bearden, Milton', 'The Black Tulip', 'Espionage, Historical Fiction', 336, 4, 'Antonio', 'Rich in detail about real-world espionage and historical events as they are occurring.'),
  new Book('Balson, Ronald H.', 'Once We Were Brothers', 'Historical Fiction, Legal Drama', 394, 4, 'Antonio', 'A weaving of past and present into a search for truth.'),
  new Book('Bourdain, Anthony', 'Bone in the Throat', 'Crime, Dark Comedy, Culinary', 304 , 3, 'Antonio', 'Fast-paced and gritty, with a pinch of dark humor, behind the scenes of the restaurant life and family ties.'),
  new Book('Coelho, Paulo', 'The Fifth Mountain', 'Philosophical Fiction, Spiritual', 245, 3, 'Antonio', 'A narrative focused on resilience and purpose with an emphasis on introspection rather than thought.'),
  new Book('Kostova, Elizabeth', 'The Historian', '', 642, '', 'Antonio', ''),
  // new Book('K, J', 'The Historian', '', , , 'Antonio', ''),
  // new Book('K, J', 'The Historian', '', , , 'Antonio', ''),
];

//===================================
// constructor for new books added  |
//==================================

function Book(author, title, genre, pages, rating, addedBy, review, image) {
  this.id = Date.now(); //every book receives unique id; timestamp
  this.author = author;
  this.title = title;
  this.genre = genre;
  this.pages = Number(pages); // nUmber species number, not string
  this.rating = Number(rating);
  this.addedBy = addedBy;

  this.review = {
    text: review,
    date: new Date()
  };
  this.image = image || '';
  this.votes = 0;
  this.views = 0;
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
      ${book.image ? `<img src="${book.image}" alt="${book.title}" />` : ''}
      <h3>${book.title}</h3>
      <p class="author">by ${book.author}</p>
      <p>"${book.review?.text || "No review yet"}"</p>
      <small>${date}</small>
    `;

    container.appendChild(card);
  }
};

//==========
// voting  |
//=========

// stores currently displayed choices
let currentPair = [];

function getRandomBooks() {
  if (books.length < 2) return [];

  // picks random book
  let index1 = Math.floor(Math.random() * books.length);
  let index2;

  // loop to keep shuffling if books are the same
  do {
    index2 = Math.floor(Math.random() * books.length);
  } while (index1 === index2);

  return [books[index1], books[index2]];
};

function renderVoting() {
  const container = document.getElementById('votingContainer');
  container.innerHTML = ''; // clear

  // stores function to get 2 random choices in a variable
  currentPair = getRandomBooks();

  // creates clickable cards during votes
  currentPair.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('review-card');

    card.innerHTML = `
      ${book.image ? `<img src="${book.image}" alt="${book.title}" />` : ''}
      <h3>${book.title}</h3>
      <p>${book.author}</p>
    `;

    // click = vote
    card.addEventListener('click', () => {
      handleVote(book);
    });

    container.appendChild(card);
  });
};

function handleVote(selectedBook) {

  // increments views tally for both; safe syntax to avoid NaN
  currentPair.forEach(book => {
    book.views = (book.views || 0) + 1;
  });

  // increments vote tally for choosen
  selectedBook.votes = (selectedBook.votes || 0) + 1;

  // data persistance and new round
  saveToLocalStorage();
  renderVoting();
  renderChart();    // live feedback on voting through chart updates
};

//=========
// chart  |
//========

function renderChart() {
  const ctx = document.getElementById('resultsChart');

  // destroy previous/existing chart, if any
  if (chartInstance) {
    chartInstance.destroy();
  }

  // prep data
  // x-axis, book names, accounts for long titles
  const labels = books.map(book => book.title);
  const votes = books.map(book => book.votes || 0);   //y-axis, vote count

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Votes',
        data: votes
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
};

//=================================
// function for data persistence  |
//================================

function saveToLocalStorage() {
  // exclude baseBooks to prevent duplicates
  const userBooks = books.filter(book => !baseBooks.includes(book));
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

//=======================
// form event listener  |
//======================

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
    e.target.review.value,
    e.target.image.value
  );

  books.push(newBook);

  renderTable();
  renderReviews();
  saveToLocalStorage();

  form.reset(); // UX bonus
});

//====================
// tab functionality |
//====================

// grabs buttons 'library' and 'voting'
const tabButtons = document.querySelectorAll('#tabs button');

// loops through buttons and applies behavior after 'click'
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab; //tied to button data-tab

    // remove active class from all buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // add active class to clicked button; highlights
    button.classList.add('active');

    // hide all tab content
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });

    // show selected tab only
    document.getElementById(target).classList.add('active');

    // only show chart on relevant tab
    if (target === 'votingTab') {
      renderChart();
    };
  });
});

//=====================
// load on page load  |
//====================

loadFromLocalStorage();
renderVoting();
renderChart();

// timer
setInterval(() => {
  if (books.length > 0) {
    reviewIndex = (reviewIndex + 1) % books.length;
    renderReviews();
  }
}, 4000);