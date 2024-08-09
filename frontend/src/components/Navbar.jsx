import React, { useState } from 'react';
import { Navbar, Nav, Form, FormControl, Offcanvas, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import "../components/Navbar.css";
import list from "../assets/list.svg";
import search from "../assets/search.png";
import { useAuth } from '../contexts/AuthContext';

const CustomNavbar = () => {
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      handleClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  return (
    <Navbar expand="lg" className="mb-3 navbar1 custom-navbar">
      <Container fluid>
        <NavLink to="/" className="navbar-brand">
          <img className="logo" src={logo} alt="Strive Logo" />
        </NavLink>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-lg-none custom-toggler" onClick={handleShow}>
          <img src={list} alt="Menu" className="toggler-icon" />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/boy-groups" className="nav-link">Boy Groups</NavLink>
            <NavLink to="/girl-groups" className="nav-link">Girl Groups</NavLink>
            <NavLink to="/male-soloists" className="nav-link">Male Soloists</NavLink>
            <NavLink to="/female-soloists" className="nav-link">Female Soloists</NavLink>
          </Nav>
          <Form className="d-flex mx-lg-2" onSubmit={handleSearch}>
            <div className="position-relative">
              <FormControl
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className='searchb'>
                <img className='search' src={search} alt=""/>
              </button>
            </div>
          </Form>
          {user ? (
            <div className="d-flex align-items-center">
              <NavLink to="/profile" className="nav-link textp me-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="rounded-circle" style={{ width: '50px', height: '50px' }} />
                ) : (
                  <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style={{ width: '30px', height: '30px' }}>
                    {user.nome[0]}
                  </div>
                )}
              </NavLink>
              <Button id="logout-button" variant="outline-light" onClick={handleLogout} size="sm">
                Logout
              </Button>
            </div>
          ) : (
            <div>
              <NavLink to="/login" className="btn btn-outline-light me-2">Login</NavLink>
              <NavLink to="/register" className="btn btn-light">Registrati</NavLink>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
      <Offcanvas show={show} onHide={handleClose} placement="end" className="d-lg-none">
        <Offcanvas.Header closeButton className='offcanva'>
          <Offcanvas.Title className='text-white'>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className='offcanva'>
          <Nav className="flex-column offcanva1">
            <NavLink to="/boy-groups" className="nav-link" onClick={handleClose}>Boy Groups</NavLink>
            <NavLink to="/girl-groups" className="nav-link" onClick={handleClose}>Girl Groups</NavLink>
            <NavLink to="/male-soloists" className="nav-link" onClick={handleClose}>Male Soloists</NavLink>
            <NavLink to="/female-soloists" className="nav-link" onClick={handleClose}>Female Soloists</NavLink>
            {user && (
              <NavLink to="/profile" className="nav-link textp" onClick={handleClose}>
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="rounded-circle" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                ) : (
                  <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px', marginRight: '10px' }}>
                    {user.nome[0]}
                  </div>
                )}
                Profile
              </NavLink>
            )}
            <Form className="my-3" onSubmit={handleSearch}>
              <div className="position-relative">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className='searchb'>
                  <img className='search' src={search} alt=""/>
                </button>
              </div>
            </Form>
            {user ? (
              <Button variant="outline-light" onClick={handleLogout} className="w-100">
                Logout
              </Button>
            ) : (
              <div>
                <NavLink to="/login" className="btn btn-outline-light w-100 mb-2" onClick={handleClose}>Login</NavLink>
                <NavLink to="/register" className="btn btn-light w-100" onClick={handleClose}>Registrati</NavLink>
              </div>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
};

export default CustomNavbar;