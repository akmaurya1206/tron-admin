import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { encryptText } from './utils/crypt';

import "./Login.css";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
    setLoading(true);
    if (username && password) {
      try {
        const project = import.meta.env.VITE_PROJECT;
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          { username, password, project }
        );
        setSuccess("Login successful");
        setLoading(false);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("data", encryptText(JSON.stringify(response.data.userInfo)));
        navigate("/home");
      } catch (error) {
        console.log(error.response.data);
        setError(error.response.data.message);
        setLoading(false);
      }
    }
  };
 

  return (
    <>
      <div className="login-wrapper">
        <div className="login-form-container">
          <h2 className="login-title">Login</h2>
          {error && (
          <Alert
            className="mb-2 py-2"
            variant="danger"
            onClose={() => setError("")}
            dismissible
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            className="mb-2 py-2"
            variant="success"
            onClose={() => setSuccess("")}
            dismissible
          >
            {success}
          </Alert>
          
        )}
          <Form
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
            validated={validated}
          >
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Username is required
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Password is required
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="login-button" disabled={loading}>
              {loading ? <><Spinner animation="border" size="sm" role="status" /> Logging In...</> : "Login"}
            </Button>
            {/* <div className="text-center small mt-2">
              If you don't have an account, you can <Link to="/register">Register</Link>
            </div> */}
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
