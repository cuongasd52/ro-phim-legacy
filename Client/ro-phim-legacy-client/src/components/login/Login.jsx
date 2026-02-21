import { useState } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import axiosClient from '../../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom'; // Bỏ useLocation vì không dùng 'from' nữa
import useAuth from '../../hooks/useAuth';
import logo from '../../assets/RoPhimLegacyLogo.png';

const Login = () => {
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post('/login', { email, password });

            // Lưu thông tin vào localStorage để duy trì đăng nhập
            localStorage.setItem('user', JSON.stringify(response.data));

            // Cập nhật state Global Auth
            setAuth(response.data);

            // 🚀 ÉP BUỘC VỀ HOME: Bất kể trước đó bạn ở đâu
            navigate("/", { replace: true });

        } catch (err) {
            console.error("Login Error:", err);
            const backendError = err.response?.data?.error;
            setError(backendError || 'Login failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
            <div className="login-card shadow-lg p-4 p-md-5 rounded bg-dark text-light border border-secondary" style={{ maxWidth: 450, width: '100%' }}>
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" width={200} className="mb-3" style={{ objectFit: 'contain' }} />
                    <h2 className="fw-bold">Welcome Back</h2>
                    <p className="text-muted small">Sign in to continue your cinematic journey.</p>
                </div>

                {error && <div className="alert alert-danger py-2 small shadow-sm">{error}</div>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-uppercase fw-bold text-muted">Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            className="bg-secondary text-white border-0 shadow-none py-2 admin-input"
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small text-uppercase fw-bold text-muted">Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-secondary text-white border-0 shadow-none py-2 admin-input"
                        />
                    </Form.Group>

                    <Button
                        variant="info"
                        type="submit"
                        className="w-100 py-2 mb-3 text-white fw-bold shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Signing In...</>
                        ) : 'Sign In'}
                    </Button>
                </Form>

                <div className="text-center small mt-4">
                    <span className="text-muted">New to Ro Phim Legacy? </span>
                    <Link to="/register" className="fw-bold text-info text-decoration-none">Create an account</Link>
                </div>
            </div>
        </Container>
    );
}

export default Login;