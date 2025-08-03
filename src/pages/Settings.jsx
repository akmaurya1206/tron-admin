import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { decryptText } from "../utils/crypt";

import "../Login.css";

const Settings = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const userInfo = JSON.parse(decryptText(localStorage.getItem('data')));

  useEffect(() => {
    setLoading(true);
    axios
      .post(`${import.meta.env.VITE_API_URL}/settings/get`)
      .then((response) => {
        setContractAddress(response.data?.contractAddress || "");
        setToAddress(response.data?.toAddress || "");
        setId(response.data?.id || "");
        setLoading(false);
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 401) {
            alert('Please login again');
            localStorage.clear();
            navigate('/login');
          } else {
            setError('No Data Found');
          }
        } else if (err.request) {
          console.error('Network error or no response received:', err);
          setError('Network error, please try again later.');
        } else {
          console.error('Error setting up request:', err.message);
          setError('Error making request, please try again later.');
        }
        setLoading(false);
      });
  }, [navigate]);

  if(!userInfo || userInfo.userRole !== 'admin'){
    navigate("/login");
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/settings/save`,
        { contractAddress, toAddress, id }
      );
      
      if (response.status === 200) {
        setError("");
        setSuccess(response.data.message);
      } else {
        setSuccess("");
        setError("Settings update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setError(error.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="login-form-container">
          <h2 className="login-title">Settings</h2>
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
            <Form.Group className="mb-3">
              <Form.Label htmlFor="contractAddress">Contract Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contract address"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                id="contractAddress"
                required
              />
              <Form.Control.Feedback type="invalid">
                Contract Address is required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
            <input type="hidden" id="id" name="id" value={id} />
              <Form.Label htmlFor="toAddress">To Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter to address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                id="toAddress"
                required
              />
              <Form.Control.Feedback type="invalid">
                To Address is required
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

export default Settings;
