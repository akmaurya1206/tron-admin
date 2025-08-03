import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import "./Login.css";
// Importing the named exports from crypt.ts
import { encryptText } from './utils/crypt';

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [show, setShow] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        setValidated(true);
        if (username && password && firstName && lastName) {
            try {
                setLoading(true);
                const project = import.meta.env.VITE_PROJECT;
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/register`,
                    { firstName, lastName, username, password, project }
                );
                setShow(true);
                setError("Register successful");
                setLoading(false);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("data", encryptText(JSON.stringify(response.data.userInfo)));
                navigate("/home");
            } catch (error) {
                setShow(true);
                console.log(error.response.data);
                setError(error.response.data);
                setLoading(false);
            }
        }
    };

    return (
        <>
            <div className="login-wrapper">
                <div className="login-form-container">
                    <h2 className="login-title">Register</h2>
                    {show ? (
                        <Alert
                            className="mb-2 py-2"
                            variant="danger"
                            onClose={() => setShow(false)}
                            dismissible
                        >
                            {error}
                        </Alert>
                    ) : (
                        <div />
                    )}
                    <Form
                        onSubmit={handleSubmit}
                        className="login-form"
                        noValidate
                        validated={validated}
                    >
                        <div className="row">
                            <div className="col">
                                <Form.Group className="mb-3" controlId="formBasicFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter first name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        First name is required
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group className="mb-3" controlId="formBasicLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter last name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Last name is required
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </div>
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

                        <Button
                            variant="primary"
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" role="status" /> Logging
                                    In...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                        <div className="text-center small mt-2">
                            Already have an account? <Link to="/login">Login</Link>
                        </div>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default Register;
