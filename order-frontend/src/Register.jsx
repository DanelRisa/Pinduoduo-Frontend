import React, { useState } from "react";
import axios from "axios";

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:8081/register", {
        username,
        password,
      });

      setMessage("User registered successfully");
      setTimeout(() => {
        onRegister(); 
      }, 1500);
    } catch (err) {
      setError("Registration failed (username may already exist)");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          className="border px-3 py-2 w-full"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-full"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 w-full" type="submit">
          Register
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default Register;
