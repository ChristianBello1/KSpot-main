import React, { useState } from 'react';
import { Navbar, Nav, Form, FormControl, Offcanvas, Button } from 'react-bootstrap';
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

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <Navbar expand="lg" className="mb-3 navbar1 custom-navbar">
        <NavLink to="/" className="navbar-brand">
          <img className="logo" src={logo} alt="Strive Logo" />
        </NavLink>
        {!user && (
          <div className="ms-auto me-3">
            <NavLink to="/login" className="btn btn-outline-light me-2">Login</NavLink>
            <NavLink to="/register" className="btn btn-light">Registrati</NavLink>
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
              <NavLink to="/boy-groups" className={({ isActive }) => `nav-link text ${isActive ? 'active' : ''}`} onClick={() => handleNavigation('/boy-groups')}>Boy Groups</NavLink>
              <NavLink to="/girl-groups" className={({ isActive }) => `nav-link text ${isActive ? 'active' : ''}`} onClick={() => handleNavigation('/girl-groups')}>Girl Groups</NavLink>
              <NavLink to="/male-soloists" className={({ isActive }) => `nav-link text ${isActive ? 'active' : ''}`} onClick={() => handleNavigation('/male-soloists')}>Male Soloists</NavLink>
              <NavLink to="/female-soloists" className={({ isActive }) => `nav-link text uno ${isActive ? 'active' : ''}`} onClick={() => handleNavigation('/female-soloists')}>Female Soloists</NavLink>
              {user && (
                <NavLink to="/profile" className={({ isActive }) => `nav-link textp d-flex align-items-center ${isActive ? 'active' : ''}`} onClick={() => handleNavigation('/profile')}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="rounded-circle" style={{ width: '50px', height: '50px', marginRight: '20px' }} />
                  ) : (
                    <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style={{ width: '30px', height: '30px', marginRight: '10px' }}>
                      {user.nome[0]}
                    </div>
                  )}
                  <h2 className="profile-text">Profile</h2>
                </NavLink>
              )}
              <Form className="d-flex mt-3 mt-lg-0 searchform" onSubmit={handleSearch}>
                <div className="position-relative w-100">
                  <FormControl
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className='searchb position-absolute top-50 end-0 translate-middle-y'>
                    <img className='search' src={search} alt=""/>
                  </button>
                </div>
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