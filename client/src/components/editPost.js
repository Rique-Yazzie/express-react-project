
import React, { useEffect, useState } from "react";

function EditPost({ postId, onCancel }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [author, setAuthor] = useState("");

    useEffect(() => {
        fetch(`/api/posts/${postId}`, {
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Could not retrieve post.");
                }
                return response.json();
            })
            .then(data => {
                setTitle(data.title);
                setBody(data.body);
                setAuthor(data.creator_name);
            })
            .catch(error => {
                console.error("Error fetching post:", error);
                alert("Could not load blog post.");
            });
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, body })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Error updating post:", error);
            alert("Could not update blog post.");
        }
    };

    return (
        <div>
            <h1>Edit Blog Post</h1>

            <p>Author: {author}</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Blog Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <br /><br />

                <label htmlFor="body">Blog:</label>
                <textarea
                    id="body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit">Save Changes</button>
                <button type="button" onClick={onCancel}>
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditPost;
