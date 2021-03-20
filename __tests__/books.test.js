const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

process.env.NODE_ENV = 'test';

let testBook;
const badInputs = [
  {
    testName: 'empty object',
    input: {},
    expectedStatus: 400,
  },
  {
    testName: 'missing inputs',
    input: {
      isbn: '456',
      author: 'Test Author 2',
      publisher: 'Test Publisher 2',
      year: 2012,
    },
    expectedStatus: 400,
  },
  {
    testName: 'mismatched input datatypes',
    input: {
      isbn: 898,
      amazon_url: 'dfasdfs',
      author: 222,
      language: false,
      pages: '264',
      publisher: 322334,
      title: true,
      year: null,
    },
    expectedStatus: 400,
  },
];

describe('Test Book class', function () {
  beforeEach(async function () {
    await db.query('DELETE FROM books');
    testBook = await Book.create({
      isbn: '12345',
      amazon_url: 'http://a.co/eobPtX2',
      author: 'Test Author',
      language: 'english',
      pages: 100,
      publisher: 'Test Publisher',
      title: 'Test Title',
      year: 2004,
    });
  });

  /** GET /cats - returns `{books: [book, ...]}` */
  describe('GET /books', function () {
    test('Gets a list books', async function () {
      const response = await request(app).get(`/books`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        books: [testBook],
      });
    });
  });

  /** GET /books/[id] - return data about one book: `{book: book}` */

  describe('GET /books/:id', function () {
    test('Gets a single book', async function () {
      const response = await request(app).get(`/books/${testBook.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ book: testBook });
    });

    test("Responds with 404 if can't find book", async function () {
      const response = await request(app).get(`/books/0`);
      expect(response.statusCode).toEqual(404);
    });
  });

  /** POST /books/ => book  */

  describe('POST /books', function () {
    test('can create', async function () {
      let response = await request(app).post('/books').send({
        isbn: '456',
        amazon_url: 'http://a.co/eobPtX3',
        author: 'Test Author 2',
        language: 'english',
        pages: 350,
        publisher: 'Test Publisher 2',
        title: 'Test Title 2',
        year: 2012,
      });

      let book = response.body.book;
      expect(response.status).toEqual(201);
      expect(book).toEqual({
        isbn: '456',
        amazon_url: 'http://a.co/eobPtX3',
        author: 'Test Author 2',
        language: 'english',
        pages: 350,
        publisher: 'Test Publisher 2',
        title: 'Test Title 2',
        year: 2012,
      });
    });

    describe('validates bad inputs', function () {
      for (badInput of badInputs) {
        test(badInput.testName, async () => {
          let response = await request(app).post('/books').send(badInput);

          expect(response.status).toEqual(badInput.expectedStatus);
        });
      }
    });
  });

  /** Put /books/[id] - update book; return `{book: book}` */

  describe('PUT /books/:isbn', function () {
    test('Updates a single book', async function () {
      const response = await request(app).put(`/books/${testBook.isbn}`).send({
        isbn: '12345',
        amazon_url: 'http://a.co/eobPtX2',
        author: 'Test Author 33',
        language: 'english 33',
        pages: 10033,
        publisher: 'Test Publisher 33',
        title: 'Test Title 33',
        year: 2033,
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        book: {
          isbn: '12345',
          amazon_url: 'http://a.co/eobPtX2',
          author: 'Test Author 33',
          language: 'english 33',
          pages: 10033,
          publisher: 'Test Publisher 33',
          title: 'Test Title 33',
          year: 2033,
        },
      });
    });

    describe('validates bad inputs', function () {
      for (badInput of badInputs) {
        test(badInput.testName, async () => {
          let response = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send(badInput);

          expect(response.status).toEqual(badInput.expectedStatus);
        });
      }
    });
  });
});

/** DELETE /books/[id] - delete book,
 *  return `{message: "Book deleted"}` */

describe('DELETE /books/:id', function () {
  test('Deletes a single a book', async function () {
    const response = await request(app).delete(`/books/${testBook.isbn}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: 'Book deleted' });
  });
});

afterAll(async function () {
  await db.end();
});
