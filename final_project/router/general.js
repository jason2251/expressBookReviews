const express = require('express');
const books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function doesExist(username) {
  return users.some(user => user.username === username);
}

// Function to simulate getting the book list with a promise
function getBooks() {
  return new Promise((resolve, reject) => {
    // Simulating asynchronous operation (e.g., database call)
    setTimeout(() => {
      if (books) {
        resolve(books); // Resolve with the books if available
      } else {
        reject("Books data not found"); // Reject in case books data is not available
      }
    }, 1000); // Simulated delay of 1 second
  });
}

// Function to simulate fetching book details based on ISBN with a promise
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn]; // Assuming 'books' is an object where ISBN is the key
    if (book) {
      resolve(book); // Resolve with the book data if found
    } else {
      reject("Book not found"); // Reject the promise if no book is found
    }
  });
}

// Function to simulate fetching book details based on author with a promise
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor); // Resolve with books found by the author
    } else {
      reject("No books found by this author"); // Reject the promise if no books are found
    }
  });
}

// Function to simulate fetching book details based on title with a promise
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(book => book.title === title);

    if (booksByTitle.length > 0) {
      resolve(booksByTitle); // Resolve with the books found by the title
    } else {
      reject("No books found by this title"); // Reject the promise if no books are found
    }
  });
}

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(400).json({ message: "Unable to register user. Please provide both username and password." });
});

// Get the book list available in the shop using a promise
public_users.get('/', function (req, res) {
  getBooks()
    .then((bookList) => {
      res.status(200).json(bookList); // Send the books as a JSON response
    })
    .catch((error) => {
      res.status(500).json({ message: error }); // Send error message if promise is rejected
    });
});

// Get book details based on ISBN using a promise
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;

  getBookByISBN(isbn)
    .then((book) => {
      res.status(200).json(book); // Send book details if the promise resolves
    })
    .catch((error) => {
      res.status(404).json({ message: error }); // Send error message if the promise is rejected
    });
}); 

// Get book details based on author using a promise
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;

  getBooksByAuthor(author)
    .then((booksByAuthor) => {
      res.status(200).json(booksByAuthor); // Send books as a JSON response
    })
    .catch((error) => {
      res.status(404).json({ message: error }); // Send error message if no books found
    });
});

// Get all books based on title using a promise
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;

  getBooksByTitle(title)
    .then((booksByTitle) => {
      res.status(200).json(booksByTitle); // Send books as a JSON response
    })
    .catch((error) => {
      res.status(404).json({ message: error }); // Send error message if no books found
    });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  }

  return res.status(404).json({ message: "No reviews found for this book." });
});

module.exports.general = public_users;