
import React, { useEffect, useState } from "react";
import EditPost from "./editPost";

function PostList({ user }) {
    const [posts, setPosts] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);

    useEffect(() => {
        fetch("/api/posts")
            .then(response => response.json())
            .then(data => setPosts(data))
            .catch(error => console.error("Error fetching posts:", error));
    }, []);

    const handleDelete = async (postId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this blog post?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);

                setPosts(posts.filter(post => post.blog_id !== postId));
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Could not delete blog post.");
        }
    };

    if (editingPostId !== null) {
        return (
            <EditPost
                postId={editingPostId}
                onCancel={() => setEditingPostId(null)}
            />
        );
    }

    return (
        <div>
            <h2>Blog Posts</h2>

            {posts.map(post => (
                <article key={post.blog_id}>
                    <h3>{post.title}</h3>

                    <p>By {post.creator_name}</p>

                    <p>{post.date_created}</p>

                    <p>{post.body}</p>

                    {post.creator_user_id === user.username && (
                        <div>
                            <button
                                onClick={() => setEditingPostId(post.blog_id)}
                            >
                                Edit
                            </button>

                            <button onClick={() => handleDelete(post.blog_id)}>Delete</button>
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}

export default PostList;
