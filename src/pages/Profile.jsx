import React, { useState } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { encryptText, decryptText } from "../utils/crypt";

import "../Login.css";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);

  let userInfo = null;
  const decryptedData = localStorage.getItem("data");
  try {
    if (decryptedData) {
      userInfo = JSON.parse(decryptText(decryptedData));
    }
  } catch (error) {
    console.error("Error decrypting user data:", error);
  }

  if (!userInfo) {
    navigate("/login");
  }

  if (userInfo && firstName === "" && lastName === "") {
    setFirstName(userInfo.firstName || "");
    setLastName(userInfo.lastName || "");
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        { firstName, lastName }
      );
      if (response.data?.userInfo) {
        setSuccess("Profile updated successfully.");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("data", encryptText(JSON.stringify(response.data.userInfo)));
        setFirstName(response.data.userInfo.firstName);
        setLastName(response.data.userInfo.lastName);
      } else {
        setError("Profile update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-form-container">
          <h2 className="login-title">Profile</h2>
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
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={userInfo?.username || ""}
                disabled
                readOnly
              />
              <Form.Control.Feedback type="invalid">
                Username is required
              </Form.Control.Feedback>
            </Form.Group>
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

            <Button
              variant="primary"
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" role="status" />{" "}
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Profile;
