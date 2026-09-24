# Books — fast-test homework

A list of books with an "All / Private" switch, a form to add a book and a sticky header with a counter of private books ("Your books: N").
The UI is intentionally minimal: the focus is on separating the logic from the rendering and covering the logic with fast tests.

## How to run

Requirements: Node.js and npm.

```bash
npm install
npm start      # http://localhost:3000
npm test       # unit tests (Jest), no browser or network needed
```

The API (https://tdd.demo.reaktivate.com) uses a self-signed SSL certificate.
Before the first run open any API endpoint in the browser, e.g. https://tdd.demo.reaktivate.com/v1/books/biriukova, and allow the certificate.

The API user (nickname) is set in [src/Shared/config.js](src/Shared/config.js) (`biriukova`). Change it there to use your own namespace.
To clean the data of a user: `PUT /v1/books/<user>/reset`.

## Notes

- The starter code posted a new book to `/books`, which returns 404. The correct endpoint is `POST /v1/books/<user>/`, this is fixed in the repository.
- `GET /v1/books/<user>/private` returns books without `id`, so the list is keyed by index.
- The controllers hold no subscriptions or timers, so there is nothing to dispose yet.
