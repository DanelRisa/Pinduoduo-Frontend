import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Products from "./Product";
import ProductDetails from "./ProductDetails";
import Orders from "./Orders";
import GroupBuys from "./GroupBuys";
import Users from "./Users"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };
  

  return (
    <Router>
      <div className="container p-4">
        {/* <h1 className="text-red-600 text-4xl">Test Heading</h1> */}

        <nav className="place-content-center mb-4">
          {isLoggedIn ? (
            <>
              <Link to="/products" className="mr-4 text-blue-600">Products</Link>
              <Link to="/orders" className="mr-4 text-blue-600">Orders</Link>
              <Link to="/groupbuys" className="mr-4 text-blue-600">GroupBuys</Link>
              <Link to="/users" className="mr-4 text-blue-600">Users</Link>


              <button onClick={handleLogout} className="text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 text-blue-600">Login</Link>
              <Link to="/register" className="text-blue-600">Register</Link>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/" element={isLoggedIn ? <Navigate to="/products" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={() => {}} />} />
          <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/login" />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/orders" element={isLoggedIn ? <Orders /> : <Navigate to="/login" /> } />
          <Route path="/groupbuys" element={isLoggedIn ? <GroupBuys /> : <Navigate to="/login" /> } />
          <Route path="/users" element={isLoggedIn ? <Users /> : <Navigate to="/login" /> } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
