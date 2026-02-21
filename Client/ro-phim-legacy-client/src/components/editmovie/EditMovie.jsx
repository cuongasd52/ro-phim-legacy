import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Spinner from '../spinner/Spinner';

const EditMovie = () => {
    const { imdb_id } = useParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });

    const [formData, setFormData] = useState({
        imdb_id: "",
        title: "",
        poster_path: "",
        youtube_id: "",
        admin_review: "",
        genre: []
    });

    const availableGenres = [
        { id: 1, name: "Comedy" }, { id: 2, name: "Drama" }, { id: 3, name: "Western" }, { id: 4, name: "Fantasy" },
        { id: 5, name: "Thriller" }, { id: 6, name: "Sci-Fi" }, { id: 7, name: "Action" },
        { id: 8, name: "Mystery" }, { id: 9, name: "Crime" }
    ];

    // 1. Lấy dữ liệu hiện tại của phim để điền vào Form
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axiosPrivate.get(`/movie/${imdb_id}`);
                setFormData(response.data);
            } catch (err) {
                setMessage({ text: "Failed to load movie data. Does this movie exist?", type: "danger" });
            } finally {
                setFetching(false);
            }
        };
        fetchMovie();
    }, [imdb_id, axiosPrivate]);

    // 2. Logic trích xuất ID thông minh (Tái sử dụng để fix link nhanh)
    const extractImdbId = (url) => url.match(/(tt\d+)/)?.[0] || url;
    const extractPosterFullUrl = (url) => {
        if (url.includes("tmdb.org")) {
            const match = url.match(/\/([^\/]+\.(jpg|jpeg|png|webp))$/i);
            return match ? `https://image.tmdb.org/t/p/w300/${match[1]}` : url;
        }
        return url;
    };
    const extractYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : url;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'imdb_id') processedValue = extractImdbId(value);
        if (name === 'poster_path') processedValue = extractPosterFullUrl(value);
        if (name === 'youtube_id') processedValue = extractYoutubeId(value);

        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleGenreToggle = (genre) => {
        const isSelected = formData.genre.some(g => g.genre_id === genre.id);
        if (isSelected) {
            setFormData(prev => ({ ...prev, genre: prev.genre.filter(g => g.genre_id !== genre.id) }));
        } else {
            setFormData(prev => ({ ...prev, genre: [...prev.genre, { genre_id: genre.id, genre_name: genre.name }] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            // Sử dụng PATCH để chỉ cập nhật những gì thay đổi
            await axiosPrivate.patch(`/editmovie/${imdb_id}`, formData);
            setMessage({ text: "Movie updated successfully! Redirecting...", type: "success" });

            // Đợi 2 giây để Admin kịp nhìn thông báo rồi về Home
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Update failed. Check your connection.";
            setMessage({ text: errorMsg, type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Spinner />;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10} xl={8}>
                    <div className="p-4 rounded shadow-lg bg-dark text-light border border-info border-opacity-25">
                        <div className="text-center mb-4">
                            <h2 className="text-info fw-bold">Edit Movie: {formData.title}</h2>
                            <p className="text-white-50 small">ADMIN MAINTENANCE MODE</p>
                        </div>

                        {message.text && <Alert variant={message.type} dismissible>{message.text}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-info small fw-bold">IMDb ID</Form.Label>
                                        <Form.Control name="imdb_id" value={formData.imdb_id} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary admin-input" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-info small fw-bold">Movie Title</Form.Label>
                                        <Form.Control name="title" value={formData.title} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary admin-input" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-info small fw-bold">Poster Path (Full TMDB URL)</Form.Label>
                                <Form.Control name="poster_path" value={formData.poster_path} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary admin-input" />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-info small fw-bold">YouTube Trailer Link</Form.Label>
                                <Form.Control name="youtube_id" value={formData.youtube_id} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary admin-input" />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-info small fw-bold mb-3 d-block">Genres</Form.Label>
                                <div className="d-flex flex-wrap gap-2 p-3 rounded bg-black bg-opacity-50 border border-secondary">
                                    {availableGenres.map(genre => {
                                        const isSelected = formData.genre.some(g => g.genre_id === genre.id);
                                        return (
                                            <Button key={genre.id} variant={isSelected ? "info" : "outline-secondary"} size="sm" onClick={() => handleGenreToggle(genre)} className={`rounded-pill px-3 ${isSelected ? 'text-white fw-bold' : ''}`}>
                                                {genre.name}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-info small fw-bold">Review & AI Ranking Basis</Form.Label>
                                <Form.Control as="textarea" rows={6} name="admin_review" value={formData.admin_review} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary admin-input" style={{ resize: "none" }} />
                            </Form.Group>

                            <div className="d-flex gap-3 mt-4">
                                <Button variant="info" size="lg" type="submit" disabled={loading} className="w-100 fw-bold text-white shadow">
                                    {loading ? 'Saving Changes...' : 'Update Movie'}
                                </Button>
                                <Button variant="outline-secondary" size="lg" onClick={() => navigate("/")} className="px-4">
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default EditMovie;