import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import raxios from "../axios";

const Login = () => {
    const [inputs, setInputs] = useState({
        identifier: "",
        password: "",
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await raxios.post("/login", inputs);

            if (res.data?.token) {
                sessionStorage.setItem("token", res.data.token);
                navigate("/");
            } else {
                setError("Invalid response from server. Please try again");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="auth">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email or Username"
                    name="identifier"
                    value={inputs.identifier}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={inputs.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>

                {error && <p className="error">{error}</p>}

                <span>
                    Don't have an account? <Link to="/register">Register</Link>
                </span>
            </form>
        </div>
    );
};

export default Login;
