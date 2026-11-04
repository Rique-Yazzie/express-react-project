
import React, { useState } from "react";

function SignUp() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    username,
                    password,
                }),
            });

            const data = await response.json();
            alert(data.message);

        } catch (error) {
            console.error("Signup error:", error);
            alert("Could not create account.");
        }
    };

    return (
        <div className="container mt-5">
            <h1>Register</h1>

            <div className="row">
                <div className="col-sm-8">
                    <div className="card">
                        <div className="card-body">

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="username">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-dark">
                                    Register
                                </button>
                            </form>

                            <br />

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => window.location.href = "/"}
                            >
                                Return to Homepage
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
