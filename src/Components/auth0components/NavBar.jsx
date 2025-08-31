import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../assets/myCss.module.css";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    logout,
  } = useAuth0();
  const toggle = () => setIsOpen(!isOpen);
  const activelinks = 'router-link-exact-active ${styles.card}';
  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    <div className="nav-container">
      {!isAuthenticated && (
        <div className="d-flex justify-content-around align-items-center bg-white p-3">
          <h3 className={styles.maintitle}>Welcome to Recallcards!!</h3>
          <Button
            id="qsLoginBtn"
            color="primary"
            className={styles.loginbtn}
            onClick={() => loginWithRedirect()}
          >
            Log in
          </Button>
        </div>
      )}
      
      {isAuthenticated && (
        <Navbar color="light" light expand="md">
          <Container>
            <NavbarBrand className="logo" />
            
            {/* Welcome message - always visible, outside hamburger menu */}
            <div className="d-flex align-items-center me-3">
              <h3 className={styles.maintitle} style={{ margin: 0, fontSize: '1.1rem' }}>
                Welcome {user?.given_name}!
              </h3>
            </div>
            
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
              <Nav className="mr-auto w-100" navbar>
                <div className={styles.links}>
                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/home"
                      exact
                    >
                      Home
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/flashcards"
                      exact
                    >
                      Review Cards
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/addword"
                      exact
                    >
                      Add Card
                    </NavLink>
                  </NavItem>
                </div>
              </Nav>

              <div className={styles.photodiv}>
                <Nav className="d-none d-md-block" navbar>
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret id="profileDropDown">
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="nav-user-profile rounded-circle"
                        width="60"
                      />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem header>{user.name}</DropdownItem>
                      <DropdownItem
                        tag={RouterNavLink}
                        to="/profile"
                        className="dropdown-profile"
                        activeClassName="router-link-exact-active"
                      >
                        <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                      </DropdownItem>
                      <DropdownItem
                        id="qsLogoutBtn"
                        onClick={() => logoutWithRedirect()}
                      >
                        <FontAwesomeIcon icon="power-off" className="mr-3" /> Log out
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </Nav>

                {/* Mobile menu - properly organized with flexbox */}
                <div className="d-md-none">
                  <div className="d-flex flex-column align-items-center py-3">
                    {/* User profile section */}
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="nav-user-profile rounded-circle me-3"
                        width="50"
                      />
                      <h6 className="mb-0">{user.name}</h6>
                    </div>
                    
                    {/* Navigation links */}
                    <div className="d-flex flex-column align-items-center w-100">
                      <NavItem className="w-100 text-center mb-2">
                        <RouterNavLink
                          to="/profile"
                          className="text-decoration-none text-dark"
                          activeClassName="text-primary fw-bold"
                        >
                          <FontAwesomeIcon icon="user" className="me-2" />
                          Profile
                        </RouterNavLink>
                      </NavItem>
                      
                      <NavItem className="w-100 text-center">
                        <button
                          className="btn btn-link text-decoration-none text-dark p-0"
                          onClick={() => logoutWithRedirect()}
                        >
                          <FontAwesomeIcon icon="power-off" className="me-2" />
                          Log out
                        </button>
                      </NavItem>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
          </Container>
        </Navbar>
      )}
    </div>
  );
};

export default NavBar;
