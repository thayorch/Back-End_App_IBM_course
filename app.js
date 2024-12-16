const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Mock Data for books and users
let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', reviews: ["good","nice"] },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', reviews: ["nice"] },
    { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', reviews: ["good"] }
];

let users = [
    { username: 'john_doe', password: 'password123', reviews: [] }
];

// Middleware
app.use(bodyParser.json());

// General User Routes

// Task 1: Get the book list available in the shop.
app.get('/books', (req, res) => {
    res.json(books);
});

// Task 2: Get the books based on ISBN.
app.get('/books/isbn/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).send('Book not found');
    }
});

// Task 3: Get all books by Author.
app.get('/books/author/:author', (req, res) => {
    const authorBooks = books.filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
    if (authorBooks.length > 0) {
        res.json(authorBooks);
    } else {
        res.status(404).send('Books by this author not found');
    }
});

// Task 4: Get all books based on Title.
app.get('/books/title/:title', (req, res) => {
    const titleBooks = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
    if (titleBooks.length > 0) {
        res.json(titleBooks);
    } else {
        res.status(404).send('Books with this title not found');
    }
});

// Task 5: Get book Review.
app.get('/books/:id/reviews', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book) {
        res.json(book.reviews);
    } else {
        res.status(404).send('Book not found');
    }
});

// Task 6: Register New user.
app.post('/users/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).send('User already exists');
    }
    users.push({ username, password, reviews: [] });
    res.status(201).send('User registered successfully');
});

// Task 7: Login as a Registered user.
app.post('/users/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ message: 'Login successful', username: user.username });
    } else {
        res.status(400).send('Invalid username or password');
    }
});

// Registered Users Routes

// Task 8: Add/Modify a book review.
app.post('/books/:id/reviews', (req, res) => {
    const { username, review } = req.body;
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');

    let user = users.find(u => u.username === username);
    if (!user) return res.status(404).send('User not found');

    // Check if review already exists
    const existingReview = book.reviews.find(r => r.username === username);
    if (existingReview) {
        existingReview.review = review; // Modify review
    } else {
        book.reviews.push({ username, review }); // Add new review
    }
    res.json(book.reviews);
});

// Task 9: Delete book review added by that particular user.
app.delete('/books/:id/reviews', (req, res) => {
    const { username } = req.body;
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');

    const reviewIndex = book.reviews.findIndex(r => r.username === username);
    if (reviewIndex === -1) return res.status(404).send('Review not found');

    book.reviews.splice(reviewIndex, 1);
    res.json({ message: 'Review deleted successfully', reviews: book.reviews });
});

// Node.js Tasks (Async/Await or Promises with Axios)

// Task 10: Get all books – Using async callback function.
app.get('/external-books', async (req, res) => {
    try {
        const response = await axios.get('https://api.example.com/books'); // Mock API URL
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching books');
    }
});

// Task 11: Search by ISBN – Using Promises.
app.get('/external-books/isbn/:isbn', (req, res) => {
    axios.get(`https://api.example.com/books/${req.params.isbn}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send('Error fetching book'));
});

// Task 12: Search by Author.
app.get('/external-books/author/:author', (req, res) => {
    axios.get(`https://api.example.com/books?author=${req.params.author}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send('Error fetching books by author'));
});

// Task 13: Search by Title.
app.get('/external-books/title/:title', (req, res) => {
    axios.get(`https://api.example.com/books?title=${req.params.title}`)
        .then(response => res.json(response.data))
        .catch(error => res.status(500).send('Error fetching books by title'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
