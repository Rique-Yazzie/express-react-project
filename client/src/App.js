
import React, { useState, useEffect } from "react";
import SignIn from "./components/signIn";
import SignUp from "./components/signUp";
import CreatePost from "./components/createPost";
import PostList from "./components/postList";
import "./App.css";

function App() {
    // State for tracking whether the user is logged in and storing user information
    const [loggedIn, setLoggedIn] = useState(false);

    // Stores information about the currently logged in user
    const [user, setUser] = useState(null);

    // Tracks which page the user wants to view
    const [page, setPage] = useState("home");

    // check if user is logged in
    useEffect(() => {
      // Sends request to our Express backend
      fetch("/api/loggedInUser", {
          credentials: "include"
      })
          // Converts the response to JSON format
          .then(response => response.json())
          // Handles the JSON data received from the backend
          // Updates the state if the user is logged in
          .then(data => {
              if (data.loggedIn) {
                  setLoggedIn(true);
                  setUser(data.user);
              }
          })
          // Prints error to console if the request fails
          .catch(error => console.error("Session check error:", error));
    }, []);

    // Logs out the user and returns them to the welcome page
    const handleBackToWelcome = async () => {
        try {
            // attempt to log out the user
            const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include"
            });

            // if we successfully logged out, update the state and redirect to the home page
            if (response.ok) {
                setUser(null);
                setLoggedIn(false);
                setPage("home");
            }
        // catch any errors that occur during the logout process
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // If the user is not logged in, display the appropriate page
    if (!loggedIn) {

        // Display the sign-in page
        if (page === "signin") {
            return (
                <div>
                    <SignIn onLogin={(userData) => {
                        setUser(userData);
                        setLoggedIn(true);
                    }} />

                    <button onClick={() => setPage("home")}>
                        Back
                    </button>
                </div>
            );
        }

        // Display the sign-up page
        if (page === "signup") {
            return (
                <div>
                    <SignUp />

                    <button onClick={() => setPage("home")}>
                        Back
                    </button>
                </div>
            );
        }

        // Display the welcome page with sign-in and registration options
        return (
            <div>
                <h1>Welcome to My Blog</h1>

                <p>Please sign in or create an account to continue.</p>

                <button onClick={() => setPage("signin")}>
                    Sign In
                </button>

                <button onClick={() => setPage("signup")}>
                    Register
                </button>
            </div>
        );
    }

    // If the user is logged in, display the blog homepage
    return (
        <div>
            <h1>My Blog</h1>

            <h2>Welcome, {user.name}!</h2>

            <button onClick={handleBackToWelcome}>
                Back to Welcome Page
            </button>

            <CreatePost />

            <hr />

            <PostList user={user} />
        </div>
    );
}

export default App;
