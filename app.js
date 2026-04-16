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

// stores currently displayed choices
let currentVotingPair = [];

// sliding animation for reviews
let currentOffset = 0;

// carousel display 

const visibleCards = 3;

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
  this.image = image || '../img/default-placeholder.jpg'; // for dynamic entries w/ no images
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

//=================================
// DOM cache for query selection  |
//================================

const DOM = {
  tableBody: document.querySelector('#book-table tbody'),
  reviewsContainer: document.getElementById('reviews-container'),
  votingContainer: document.getElementById('voting-container'),
  votingMessage: document.getElementById('voting-message'),
  resultsChart: document.getElementById('results-chart'),
  form: document.getElementById('book-form'),
  resetButton: document.getElementById('reset-votes'),
  tabButtons: document.querySelectorAll('#tabs button'),
  tabs: document.querySelectorAll('.tab'),
  reviewsTrack: document.getElementById('reviews-track'),
};

//=========
// table  |
//========

function renderTable() {
  const tbody = DOM.tableBody;
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
  const track = DOM.reviewsContainer;
  track.innerHTML = '';

  // sorting; ensures entries stay in original order, baseBooks first
  const sortedBooks = [...books].sort(
    (a, b) => new Date(b.review.date) - new Date(a.review.date)
  );
  
    // guard
  sortedBooks.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('review-card');

    const date = book.review?.date
      ? new Date(book.review.date).toLocaleDateString()
      : '';

    card.innerHTML = `
      <div class="card-front">
        <div class="book-cover">       
          <img src="${book.image || 'img/default-placeholder.jpg'}" alt="${book.title}" />
        </div>
        <h3>${book.title}</h3>
        <p class="author">by ${book.author}</p>
      </div>

      <div class="card-back">
        <p>"${book.review?.text || "No review yet"}"</p>
        <small>${date}</small>
      </div>
    `;

    // card.addEventListener('click', () => {
    //   card.classList.toggle('flipped');
    // });

    card.classList.remove('flipped');

    track.appendChild(card);
  });
};

//===================
// slide animation  |
//==================

function updateCarousel() {
  const firstCard = document.querySelector('.review-card');
  if (!firstCard) return;

  const gap = 30; // match css
  const cardWidth = firstCard.offsetWidth + gap; // card + gap

  DOM.reviewsContainer.style.transform = `translateX(-${currentOffset * cardWidth}px)`;
};

//==========
// voting  |
//=========

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

//======================
// helper DOM queries  |
//===================== 

function showVotingMessage(message) {
  DOM.votingMessage.textContent = message;
};

function clearVotingUI() {
  const container = DOM.votingContainer;
  container.innerHTML = '';
};

function renderVoting() {
  const container = DOM.votingContainer;
  
  showVotingMessage('');
  clearVotingUI();

  // validates state / voting requires min 2 entries
  if (books.length < 2) {
    showVotingMessage('Add more entries to the table to be able to vote.');
    return;
  };

  // generates data; stores function to get 2 random choices in variable 
  currentVotingPair = getRandomBooks();

  // creates clickable cards during votes
  currentVotingPair.forEach(book => {
    const card = document.createElement('div');
    card.classList.add('review-card');

    //placeholder image
    card.innerHTML = `
      <div class="card-front">
        <div class="book-cover">
          <img src="${book.image || 'img/default-placeholder.jpg'}" alt="${book.title}" />
        </div>

        <h3 class="book-title">${book.title}</h3>
        <p class="author">${book.author}</p>
      <div>
    `;

    card.addEventListener('click', () => {
      handleVote(book);
    });

    container.appendChild(card);
  });
};

function handleVote(selectedBook) {

  // compares figures
  if (voteCount >= maxVotes) {
    showVotingMessage('Voting Complete. Reset to start new round.');

    clearVotingUI();
    renderChart();
    return;
  };

  voteCount++;

  // increments views tally for both; safe syntax to avoid NaN
  currentVotingPair.forEach(book => {
    book.views = (book.views || 0) + 1;
  });

  // increments vote tally for choosen
  selectedBook.votes = (selectedBook.votes || 0) + 1;

  // data persistance and new round
  saveToLocalStorage();
  renderVoting();
  // renderChart();    // live feedback on voting through chart updates
};

//================
// voting reset  |
//===============

function resetVoting() {
  voteCount = 0;

  books.forEach(book => {
    book.votes = 0;
    book.views = 0;
  });

  currentVotingPair = [];
  saveToLocalStorage(); //  always persist state
  
  renderVoting();
  renderChart();

  showVotingMessage('');
};

//=========
// chart  |
//========

function renderChart() {
  const ctx = DOM.resultsChart.getContext('2d');

  // destroy previous/existing chart, if any
  if (chartInstance) {
    chartInstance.destroy();
  }

  // prep data
  // x-axis, book names, .split accounts for long titles; divides in half, stacks vert
  const labels = books.map(book => book.title);

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
          yAxisID: 'y',
          backgroundColor: 'rgba(14, 11, 236, 0.56)',  // semi-transparent
          order: 2
        },
        {
          type: 'line',
          label: 'Views',
          data: views,
          borderColor: 'rgba(26, 190, 11, 0.5)',
          borderWidth: 2,
          // tension: 0.3,
          pointBackgroundColor: '#ffffff',
          order: 0, // layer line up top
          yAxisID: 'y1' //  change to just 'y' to view single y axis
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#f1f1f1',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          display: true
        }
      },
      scales: {
        x: {
          beginsAtZero: true,
          title: {
            display: true,
            text: 'Votes',
            color: '#f1f1f1'
          },
          ticks: {
            color: '#f1f1f1',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        y: {  // bars
          beginAtZero: true,
          position: 'left',
          title: {
            display: true,
            text: 'Books',
            color: '#f1f1f1'
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: '#f1f1f1',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
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
  maxVotes = Math.floor(books.length * 1.5);

  renderTable();
  renderReviews();
};

//  after DOM is loaded and available, event listeners
//=======================
// form event listener  |
//======================

DOM.form.addEventListener('submit', function (e) {
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

  DOM.form.reset();
});

//=========================
// button event listener  |
//========================

DOM.resetButton.addEventListener('click', resetVoting);

//===========================
// reviews carousel buttons |
//==========================

document.getElementById('next-review').addEventListener('click', () => {
  currentOffset = (currentOffset + 1) % books.length;
  updateCarousel();
});

document.getElementById('prev-review').addEventListener('click', () => {
  currentOffset = (currentOffset - 1 + books.length) % books.length;
  updateCarousel();
});

//=============================
// tab functionality listener |
//============================

// loops through buttons and applies behavior after 'click'
DOM.tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab; //tied to button data-tab

    // remove active class from all buttons
    DOM.tabButtons.forEach(btn => btn.classList.remove('active'));

    // add active class to clicked button; highlights
    button.classList.add('active');

    // hide all tab content
    DOM.tabs.forEach(tab => {
      tab.classList.remove('active');
    });

    // show selected tab only
    document.getElementById(target).classList.add('active');

    // only show chart on relevant tab
    if (target === 'votingTab' && voteCount >= maxVotes) {
      renderChart();
    };
  });
});

//=====================
// load on page load  |
//====================

loadFromLocalStorage();
renderVoting();

// // timer
setInterval(() => {
  if (books.length > visibleCards) {
    currentOffset = (currentOffset + 1) % (books.length - visibleCards + 1);
    updateCarousel();
  }
}, 6000);