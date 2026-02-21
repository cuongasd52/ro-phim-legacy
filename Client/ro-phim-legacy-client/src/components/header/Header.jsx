import { Button, Container, Nav, Navbar } from 'react-bootstrap'
import { useNavigate, NavLink, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/RoPhimLegacyLogo.png';

const Header = ({ handleLogout }) => {
    const navigate = useNavigate();
    const { auth } = useAuth();

    return (
        <Navbar bg="dark" variant='dark' expand="lg" sticky="top" className="shadow-sm border-bottom border-secondary">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img alt="Logo" src={logo} width="140" className="d-inline-block align-top me-2" style={{ objectFit: 'contain' }} />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="main-navbar-nav" />
                <Navbar.Collapse id="main-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/">Home</Nav.Link>
                        {auth && <Nav.Link as={NavLink} to="/recommended">Recommended</Nav.Link>}


                        {auth?.role === 'ADMIN' && (
                            <Nav.Link as={NavLink} to="/admin/add-movie" className>
                                Add Movie
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav className="ms-auto align-items-center">
                        {auth ? (
                            <>
                                <div className="me-3 text-end">

                                    <small className="text-info d-block" style={{ fontSize: '10px', lineHeight: '1' }}>
                                        {auth.role}
                                    </small>
                                    <span className="text-light">
                                        Hello, <strong>{auth.first_name || auth.name}</strong>
                                    </span>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
                            </>
                        ) : (
                            <div className="d-flex gap-2">
                                <Button variant="outline-info" size="sm" onClick={() => navigate("/login")}>Login</Button>
                                <Button variant="info" size="sm" className="text-white" onClick={() => navigate("/register")}>Register</Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header;