
import React, { useState } from "react";

function CreatePost() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/posts", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    body,
                }),
            });

            const data = await response.json();

            alert(data.message);

            if (response.ok) {
                setTitle("");
                setBody("");
                window.location.reload();
            }

        } catch (error) {
            console.error("Error creating post:", error);
            alert("Could not create post.");
        }
    };

    return (
        <div>
            <h2>Create a New Blog Post</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Blog Title:</label>

                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label htmlFor="body">Blog:</label>

                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />

                <button type="submit">Create Post</button>
            </form>
        </div>
    );
}

export default CreatePost;
