import { useState } from 'react';
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/RoPhimLegacyLogo.png';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [favouriteGenres, setFavouriteGenres] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const availableGenres = [
        { id: 1, name: "Comedy" }, { id: 2, name: "Drama" }, { id: 3, name: "Western" }, { id: 4, name: "Fantasy" },
        { id: 5, name: "Thriller" }, { id: 6, name: "Sci-Fi" }, { id: 7, name: "Action" },
        { id: 8, name: "Mystery" }, { id: 9, name: "Crime" }
    ];

    // 2. LOGIC CHỌN THỂ LOẠI DẠNG NÚT (PILLS)
    const handleGenreToggle = (genre) => {
        const isSelected = favouriteGenres.some(g => g.genre_id === genre.id);
        if (isSelected) {
            setFavouriteGenres(prev => prev.filter(g => g.genre_id !== genre.id));
        } else {
            setFavouriteGenres(prev => [...prev, { genre_id: genre.id, genre_name: genre.name }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role: "USER",
                favourite_genres: favouriteGenres
            };

            await axiosClient.post('/register', payload);
            navigate('/login', { replace: true, state: { message: "Account created! Please sign in." } });

        } catch (err) {
            const backendError = err.response?.data?.error;
            setError(backendError || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
            {/* DARK MODE: bg-dark và text-light để đồng bộ với trang Login */}
            <div className="register-card shadow-lg p-4 p-md-5 rounded bg-dark text-light border border-secondary" style={{ maxWidth: 550, width: '100%' }}>
                <div className="text-center mb-4">
                    {/* TĂNG KÍCH THƯỚC LOGO: width 140px để to và rõ nét */}
                    <img src={logo} alt="Logo" style={{ width: '140px', marginBottom: '15px' }} />
                    <h2 className="fw-bold">Join Ro Phim Legacy</h2>
                    <p className="text-muted small">Create your account to start streaming.</p>
                </div>

                {error && <div className="alert alert-danger py-2 small shadow-sm">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-uppercase fw-bold text-muted">First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    required
                                    className="bg-secondary text-white border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-uppercase fw-bold text-muted">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    required
                                    className="bg-secondary text-white border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="small text-uppercase fw-bold text-muted">Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="bg-secondary text-white border-0 py-2 shadow-none"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-uppercase fw-bold text-muted">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="bg-secondary text-white border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-uppercase fw-bold text-muted">Confirm</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Confirm"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    isInvalid={!!confirmPassword && password !== confirmPassword}
                                    className="bg-secondary text-white border-0 py-2 shadow-none"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* HỆ THỐNG NÚT BẤM CHỌN THỂ LOẠI */}
                    <Form.Group className="mb-4">
                        <Form.Label className="small text-uppercase fw-bold text-muted d-block">Favourite Genres</Form.Label>
                        <div className="d-flex flex-wrap gap-2 p-3 rounded bg-black bg-opacity-50 border border-secondary">
                            {availableGenres.map(genre => {
                                const isSelected = favouriteGenres.some(g => g.genre_id === genre.id);
                                return (
                                    <Button
                                        key={genre.id}
                                        variant={isSelected ? "info" : "outline-secondary"}
                                        size="sm"
                                        onClick={() => handleGenreToggle(genre)}
                                        className={`rounded-pill px-3 ${isSelected ? 'text-white fw-bold' : ''}`}
                                    >
                                        {genre.name}
                                    </Button>
                                );
                            })}
                        </div>
                    </Form.Group>

                    <Button
                        variant="info"
                        type="submit"
                        className="w-100 py-2 mb-3 text-white fw-bold shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Joining...</>
                        ) : 'Create Account'}
                    </Button>
                </Form>

                <div className="text-center small mt-2">
                    <span className="text-muted">Already a member? </span>
                    <Link to="/login" className="fw-bold text-info text-decoration-none">Sign In</Link>
                </div>
            </div>
        </Container>
    );
};

export default Register;