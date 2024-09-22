const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT token (avoid storing the password in the token)
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Store token in session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization?.username;

  // Check if user is authenticated
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in to add a review." });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update the review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;  // Associate review with the user's username

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get ISBN from the URL parameters
    const username = req.session.authorization.username; // Get the username from the session

    // Check if the book exists in the database
    if (books[isbn]) {
        const book = books[isbn];

        // Check if the user has submitted a review
        if (book.reviews && book.reviews[username]) {
            // Delete the user's review
            delete book.reviews[username];
            return res.status(200).json({ message: "Review successfully deleted" });
        } else {
            // Review by the user doesn't exist
            return res.status(404).json({ message: "No review found for this book by the user" });
        }
    } else {
        // Book with the given ISBN doesn't exist
        return res.status(404).json({ message: "Book not found" });
    }
});


  return res.status(200).json({ message: "Review added/updated successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;