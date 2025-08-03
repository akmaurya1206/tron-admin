import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import axios from "../config/axios";
import { decryptText } from "../utils/crypt";
import { useNavigate } from "react-router";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const navigate = useNavigate();

  const userInfo = (() => {
    try {
      const decryptedData = decryptText(localStorage.getItem("data"));
      return decryptedData ? JSON.parse(decryptedData) : null;
    } catch (error) {
      console.error("Error decrypting user data:", error);
      return null;
    }
  })();
useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } 
  }, [userInfo, navigate]);
  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordError("");
    setPasswordLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword,
        }
      );
      if (response.status === 200) {
        setPasswordSuccess("Password updated successfully.");
        setPasswordLoading(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError("Error changing password.");
        setPasswordLoading(false);
      }
    } catch (error) {
        console.log(error.response.data);
      setPasswordError(error.response?.data || "Error changing password.");
      setPasswordLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
        <div className="login-form-container">
          <h2 className="login-title">Change Password</h2>
      {passwordError && (
        <Alert
          className="mb-2 py-2"
          variant="danger"
          onClose={() => setPasswordError("")}
          dismissible
        >
          {passwordError}
        </Alert>
      )}
      {passwordSuccess && (
        <Alert
          className="mb-2 py-2"
          variant="success"
          onClose={() => setPasswordSuccess("")}
          dismissible
        >
          {passwordSuccess}
        </Alert>
      )}

      <Form onSubmit={handlePasswordChange} className="password-change-form">
        <Form.Group className="mb-3" controlId="formCurrentPassword">
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formNewPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="danger"
          type="submit"
          className="login-button"
          disabled={passwordLoading}
        >
          {passwordLoading ? (
            <>
              <Spinner animation="border" size="sm" role="status" />{" "}
              Changing password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </Form>
      </div>
      </div>
  );
};

export default ChangePassword;
