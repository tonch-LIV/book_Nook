# book_Nook

chart / log and reviews / display

Place for author and other users to log and track books read / are currently reading.  
Add Recommendations.  
Share reviews and/or comments.  
Maybe include voting and chart (big MAYBE).

A = Team Leader Antonio  
B = Team Member Antonio  
C = Team Supervisor Antonio  
D = Consigliere Antonio  

## User Stories

As an avid reader; I often read more than one book at a time; starting one before finishing the previous. I'd like to keep track of what books I am reading and have read, so that I may keep record, provide a rating and review, as well as let other users share and rate books they've read and let them discover new books.

### Feature Tasks

- Create a site layout w/ a banner with a title and bookcase/library design elements.
- Create table to track books with pertaining info off wireframe (author last and first, book name, genre, pages, rating, added by whom).
- Create form to allow additions to table of new books.
  - javascript will add entries to table.
- Data persists across refreshes.
- Add section to display brief reviews as well as book covers.
- Style final result (cozy, clean, smooth, professional) and include a custom font set as well.

- Create a branch for each feature (table, form, reviews, data persistence, style, etc.)

### Acceptance Tests

- Set up basic HTML layout (sections, divs, header/footer)
- Code table in HTML and ensure displays with static entries.
- Program form to accept input from user about book details.
  - Ensure user addition through form entries display in table; table cells (rows & columns) will be dynamically added.
- Section to display 3-4 reviews and book covers.
- Polish up with styling.

#### Stretch Goals

- Allow users to add images through form submission, to be used in book review section
- Add voting element / section below reviews.
- Trigger voting through a button.
  - If voting is added, entries from form also added into the voting selection mix.
  - Voting will display selection of 2 (either or; either retain winner or just randomly shuffle).
  - Display results in chart form (bar or other).
  - maybe include entry from user input review in static review section; not concrete.
- Additional data persist.

## Changelog

- 03.24.26
  - created index.html, styles.css, app.js, and added .eslintrc.json and reset.css. (A, B, C, D)
    - index with boilerplate. (A)
    - linked css files. (A)
  - folders for css and for imgs. (A)
  - added wireframe img. (B)
  - ![Wireframe depicting banner, table, form, reviews](img/201_project_wireframe.png "wireframe"). (C)
  - added user story, feature tasks, acceptance test, and stretch goals. (C)
  - added `requirements.md`.
- 03.26.26
  - created and added domain model diagram to `requirements.md` rather than `readme.md` to go with restructured descriptive data flow text. (A)
- 03.31.26
  - polished up readme structure (user story, feature tasks, etc.), index.html to correct css links, and revised .eslintrc.json with correct contents after clarifying with Jason. (C)
  - Outlined html; `<section>`s for table, form, reviews; with accompanying `id`s
