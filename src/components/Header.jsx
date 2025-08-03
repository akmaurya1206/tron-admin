import React from "react";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link, useNavigate } from "react-router";
import { decryptText } from '../utils/crypt';

function Header() {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const userInfo = JSON.parse(decryptText(localStorage.getItem('data')));
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const siteName = import.meta.env.VITE_APP_NAME;
  return (
    <Navbar expand="lg" className="bg-body-tertiary" sticky="top" style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>

      <Container fluid>
      <Navbar.Brand href="/" className='text-uppercase fw-bold'>{siteName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>
            <NavDropdown title={userInfo.firstName + " " + userInfo.lastName} id="basic-nav-dropdown" className='dropdown-menu-end'>
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              {userInfo.userRole === 'admin' && <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>}
              <NavDropdown.Item as={Link} to="/change-password">
                Change Password
              </NavDropdown.Item>
              {/* <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item> */}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;