import React, { useState } from 'react';
import { Navbar, Nav, Form, FormControl, Offcanvas, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
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

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <Navbar expand="lg" className="mb-3 navbar1 custom-navbar">
        <Link to="/" className="navbar-brand">
          <img className="logo" src={logo} alt="Strive Logo" />
        </Link>
        {!user && (
          <div className="ms-auto me-3">
            <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
            <Link to="/register" className="btn btn-light">Registrati</Link>
          </div>
        )}
        <button className='list' onClick={handleShow}>
          <img src={list} alt="Group List" />
        </button>
        <Navbar.Offcanvas
          show={show}
          onHide={handleClose}
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
          placement="end"
        >
          <Offcanvas.Header closeButton className='offcanva'>
            <Offcanvas.Title className='text-white' id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className='offcanva'>
            <Nav className="justify-content-end flex-grow-1 pe-3 offcanva1">
              <Nav.Link onClick={() => handleNavigation('/boy-groups')} className='text'>Boy Groups</Nav.Link>
              <Nav.Link onClick={() => handleNavigation('/girl-groups')} className='text'>Girl Groups</Nav.Link>
              <Nav.Link onClick={() => handleNavigation('/male-soloists')} className='text'>Male Soloists</Nav.Link>
              <Nav.Link onClick={() => handleNavigation('/female-soloists')} className='text uno'>Female Soloists</Nav.Link>
              {user && (
              <Nav.Link onClick={() => handleNavigation('/profile')} className='textp d-flex align-items-center'>
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="rounded-circle" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                ) : (
                <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style={{ width: '30px', height: '30px', marginRight: '10px' }}>
                {user.nome[0]}
                </div>
                )}
                <h2 className="profile-text">Profile</h2>
              </Nav.Link>
              )}
              <Form className="d-flex mt-3 mt-lg-0 searchform" onSubmit={handleSearch}>
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className='searchb'><img className='search' src={search} alt=""/></button>
              </Form>
              {user && (
                <Button variant="outline-light" onClick={handleLogout} className="mt-3" id='logout'>Logout</Button>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Navbar>
    </>
  );
};

export default CustomNavbar;