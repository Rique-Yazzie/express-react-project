
const express = require("express");
const app = express();

const { Client } = require("pg");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcrypt");

dotenv.config();


const PORT = 5000;

// Connect to PostgreSQL
const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

db.connect()
    .then(() => console.log("Connected to PostgreSQL!"))
    .catch(err => console.error("Database connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    }
}));

// Test API route
app.get("/api/users", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT user_id, name FROM users"
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

app.post("/api/signup", async (req, res) => {
    try {
        const { name, username, password } = req.body;

        // Check if username already exists
        const existingUser = await db.query(
            "SELECT * FROM users WHERE user_id = $1",
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Username already exists!"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await db.query(
            "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
            [username, hashedPassword, name]
        );

        res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in database
        const result = await db.query(
            "SELECT * FROM users WHERE user_id = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        const user = result.rows[0];

        // Compare entered password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        // Store user information in session
        req.session.user = {
            username: user.user_id,
            name: user.name
        };

        res.json({
            message: "Login successful!",
            user: req.session.user
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            message: "Something went wrong."
        });
    }
});

app.get("/api/loggedInUser", (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});

app.get("/api/posts", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM blogs ORDER BY date_created DESC"
        );

        res.json(result.rows);

    } catch (err) {
        console.error("Error fetching posts:", err);

        res.status(500).json({
            message: "Could not retrieve blog posts."
        });
    }
});

app.post("/api/posts", async (req, res) => {
    try {
        // Check whether the user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const { title, body } = req.body;

        // Get the logged-in user's information from the session
        const username = req.session.user.username;
        const name = req.session.user.name;

        // Insert the new blog post
        await db.query(
            `INSERT INTO blogs
            (creator_name, creator_user_id, title, body)
            VALUES ($1, $2, $3, $4)`,
            [name, username, title, body]
        );

        res.status(201).json({
            message: "Blog post created successfully!"
        });

    } catch (err) {
        console.error("Error creating post:", err);

        res.status(500).json({
            message: "Could not create blog post."
        });
    }
});

app.get("/api/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        const result = await db.query(
            "SELECT * FROM blogs WHERE blog_id = $1",
            [postId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Blog post not found."
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("Error fetching blog post:", err);
        res.status(500).json({
            message: "Could not retrieve blog post."
        });
    }
});


app.put("/api/posts/:id", async (req, res) => {
    try {
        // Check whether the user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const postId = req.params.id;
        const { title, body } = req.body;
        const username = req.session.user.username;

        // Update the post only if the logged-in user owns it
        const result = await db.query(
            `UPDATE blogs
             SET title = $1, body = $2
             WHERE blog_id = $3 AND creator_user_id = $4
             RETURNING *`,
            [title, body, postId, username]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "You are not authorized to edit this post."
            });
        }

        res.json({
            message: "Blog post updated successfully!"
        });

    } catch (err) {
        console.error("Error updating blog post:", err);

        res.status(500).json({
            message: "Could not update blog post."
        });
    }
});


app.delete("/api/posts/:id", async (req, res) => {
    try {
        // Check whether the user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                message: "Please log in first."
            });
        }

        const postId = req.params.id;
        const username = req.session.user.username;

        // Delete only if the logged-in user owns the post
        const result = await db.query(
            `DELETE FROM blogs
             WHERE blog_id = $1 AND creator_user_id = $2
             RETURNING *`,
            [postId, username]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "You are not authorized to delete this post."
            });
        }

        res.json({
            message: "Blog post deleted successfully!"
        });

    } catch (err) {
        console.error("Error deleting post:", err);

        res.status(500).json({
            message: "Could not delete blog post."
        });
    }
});

// Logs the user out by destroying their session
app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not log out."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logged out successfully."
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
