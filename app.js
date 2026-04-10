'use strict';

//====================
// global variables  |
//===================

let books = [];
let reviewIndex = 0;

// stores chart and re-renders cleanly/prevents duplicates
let chartInstance = null;

// vote count

let voteCount = 0;
let maxVotes = 0; 

//===================================
// constructor for new books added  |
//==================================

function Book(author, title, genre, pages, rating, addedBy, review, image) {
  this.id = Date.now(); //every book receives unique id; timestamp
  this.author = author;
  this.title = title;
  this.genre = genre;
  this.pages = Number(pages); // nUmber() specifies number, not string
  this.rating = Number(rating);
  this.addedBy = addedBy;

  this.review = {
    text: review,
    date: new Date()
  };
  this.image = image || 'https://dummyimage.com/150x220/3b5d3b/ede6d1&text=Book'; // for dynamic entries
  this.votes = 0;
  this.views = 0;
};

//=======================================
//  instance creation for book entries  |
//======================================

const baseBooks = [
  new Book('Allende, Isabel', 'El Viento Conoce Mi Nombre', 'Historical Fiction, Drama', 272, 4, 'Antonio', 'A blend of history with personal loss.', 'img/wind_Allende.jpg'),
  new Book('Garcia-Roza, Luiz Alfredo', 'The Silence of the Rain', 'Mystery, Detective, Crime, Fiction', 272, 4, 'Antonio', 'Slow-burn detective story that strongly portrays atmosphere and environment.', 'img/silence_Garcia.jpg'),
  new Book('Kim, Angie', 'Miracle Creek', 'Mystery, Crime, Legal', 368, 4, 'Antonio', 'Courtroom drama trying to solve a mystery that involves complex characters with layered morals and values.', 'img/miracle_Kim.jpg'),
  new Book('Bearden, Milton', 'The Black Tulip', 'Espionage, Historical Fiction', 336, 4, 'Antonio', 'Rich in detail about real-world espionage and historical events as they are occurring.', 'img/tulip_Bearden.jpg'),
  new Book('Balson, Ronald H.', 'Once We Were Brothers', 'Historical Fiction, Legal Drama, Suspense', 394, 4, 'Antonio', 'A weaving of past and present into a search for truth.', 'img/brothers_Balson.jpg'),
  new Book('Bourdain, Anthony', 'Bone in the Throat', 'Crime, Dark Comedy, Culinary, Fiction', 304 , 3, 'Antonio', 'Fast-paced and gritty, with a pinch of dark humor, behind the scenes of the restaurant life and family ties.', 'img/throat_Bourdain.jpg'),
  new Book('Coelho, Paulo', 'The Fifth Mountain', 'Philosophical Fiction, Historical', 245, 3, 'Antonio', 'A narrative focused on resilience and purpose with an emphasis on introspection rather than thought.', 'img/ffthMt_Coelho.jpg'),
  new Book('Diamond, Jared', 'Guns, Germs, and Steel: The Fates of Human Societies', 'World History, Non-Fiction, Science, Anthropoly, Sociology', 498, '', 'Antonio', '', 'img/guns_Diamond.New.5.jpg'),
  new Book('Kostova, Elizabeth', 'The Historian', 'Mystery, Historical Fiction, Suspene', 642, '', 'Antonio', '', 'img/historian_Kostova.jpg'),
  new Book('Bolaño, Roberto', 'The Savage Detectives', 'Mystery, Psychological, Suspense, Fiction ', 648, '', 'Antonio', '', 'img/savage_Bolano.jpg'),
  // new Book('Last, First', 'Title', 'Genres(s)', page count, rating, 'Antonio', 'review'),
  // new Book('Last, First', 'Title', 'Genres(s)', page count, rating, 'Antonio', 'review'),
  // new Book('Last, First', 'Title', 'Genres(s)', page count, rating, 'Antonio', 'review'),
  
];

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

      // palceholder plan
    card.innerHTML = `
      ${book.image ? `
        <div class="bookCover">
          <img src="${book.image}" alt="${book.title}" />
        </div>
      ` : ''}
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
let currentVotingPair = [];

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
  showVotingMessage('');
  const container = document.getElementById('votingContainer');
  container.innerHTML = ''; // clear

  // stores function to get 2 random choices in a variable
  currentPair = getRandomBooks();

  // ensures voting can only happen if there are more than two entries in table; redundant due to quantity of static entries, but still...
  if (books.length < 2) {
    container.innerHTML = '<p>Add more entries to the table to be able to vote.</p>';
    return;
  }

  // creates clickable cards during votes
  currentPair.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('review-card');

    //placeholder image
    card.innerHTML = `
      ${book.image ? `
        <div class = "bookCover">
          <img src="${book.image}" alt="${book.title}" />
        </div>
      ` : ''}
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

// reset

function disableVoting() {
  const container = document.getElementById('votingContainer');
  container.innerHTML = '';
};

function handleVote(selectedBook) {

  // compares figures; `===` fragile per rendering/voting speed
  if (voteCount >= maxVotes) {
    disableVoting(); //  once rounds are complete, functionality goes away
    document.getElementById('votingMessage').textContent = 'Voting Complete. Reset for new round';
    return;
  }

  voteCount++;

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
  // x-axis, book names, .split accounts for long titles; divides in half, stacks vert
  const labels = books.map(book => {
    const words = book.title.split(' ');
    const mid = Math.ceil(words.length / 2);

    return [
      words.slice(0, mid).join(' '),
      words.slice(mid).join(' ')
    ];
  });

  const votes = books.map(book => book.votes || 0);   //y-axis, vote count
  const views = books.map(book => book.views || 0);   // for second

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Votes',
          data: votes,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Views',
          data: views,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {  // bars
          beginAtZero: true,
          position: 'left',
          title: {
            display: true,
            text: 'Votes'
          }
        },
        y1: {  //line
          beginAtZero: true,
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          title: {
            display: true,
            text: 'Views'
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
};

//=================================
// functions for data persistence  |
//================================

function saveToLocalStorage() {
  // exclude baseBooks to prevent duplicates
  const userBooks = books.filter(book => !baseBooks.includes(book));
  localStorage.setItem('books', JSON.stringify(userBooks));
};

function loadFromLocalStorage() {
  const data = localStorage.getItem('books');

  let userBooks = [];

  if (data) { // returns userBooks as Book instances, not just plain objects + votes & views
    userBooks = JSON.parse(data).map(book => {
      const newBook = new Book(
        book.author,
        book.title,
        book.genre,
        book.pages,
        book.rating,
        book.addedBy,
        book.review?.text || '',
        book.image
      );

      //preserve existing stats, if any
      newBook.votes = book.votes || 0;
      newBook.views = book.views || 0;

      return newBook;
    });
  }

  // combine base + user books
  books = [...baseBooks, ...userBooks];

  // voting varies on length of entries; happens after `books` exists
  maxVotes = Math.floor(books.length * 2.5);

  renderTable();
  renderReviews();
};

//  after DOM is loaded and available, event listeners
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

//=========================
// button event listener  |
//========================

const resetButton = document.getElementById('resetVotes');
resetButton.addEventListener('click', resetVoting);

//=============================
// tab functionality listener |
//============================

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