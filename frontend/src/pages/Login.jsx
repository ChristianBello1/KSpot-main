import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser, getUserData } from "../services/api";
import { useAuth } from '../contexts/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import styles from './Login.module.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      console.log("Token ricevuto da Google OAuth:", token);
      handleLogin(token);
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (token) => {
    console.log(token);
    try {
      localStorage.setItem("token", token);
      const userData = await getUserData();
      login(userData, token);
      window.dispatchEvent(new Event("storage"));
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/");
    } catch (error) {
      console.error("Errore durante il login:", error);
      setError("Errore durante il login. Riprova.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(formData);
      console.log("Risposta login:", response);
      if (response.token) {
        await handleLogin(response.token);
      } else {
        throw new Error("Token non ricevuto dal server");
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      setError("Credenziali non valide. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>Login</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className={styles.form}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className={styles.form}
        />
        <button className={styles.accedi} type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Accedi"}
        </button>
      </form>
      <button onClick={handleGoogleLogin} disabled={isLoading} className={styles.googleLogin}>
        <FaGoogle style={{ marginRight: '8px'}} />
        {isLoading ? "Logging in..." : "Accedi con Google"}
      </button>
      <p>Non hai un account? <Link to="/register">Registrati qui</Link></p>
    </div>
  );
}
