import { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const AddMovie = () => {
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
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


    const extractImdbId = (url) => {
        const match = url.match(/(tt\d+)/);
        return match ? match[0] : url;
    };

    const extractPosterFullUrl = (url) => {
        if (url.includes("tmdb.org")) {

            const match = url.match(/\/([^\/]+\.(jpg|jpeg|png|webp))$/i);
            if (match) {
                return `https://image.tmdb.org/t/p/w300/${match[1]}`;
            }
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
        switch (name) {
            case 'imdb_id':
                processedValue = extractImdbId(value);
                break;
            case 'poster_path':
                processedValue = extractPosterFullUrl(value);
                break;
            case 'youtube_id':
                processedValue = extractYoutubeId(value);
                break;
            default:
                break;
        }

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
            // Gửi payload với poster_path là Full URL
            const payload = { ...formData, ranking: null };
            await axiosPrivate.post('/addmovie', payload);
            setMessage({ text: `Successfully added: ${formData.title}`, type: "success" });
            setFormData({ imdb_id: "", title: "", poster_path: "", youtube_id: "", admin_review: "", genre: [] });
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Failed to add movie. Check Admin permissions.";
            setMessage({ text: errorMsg, type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10} xl={8}>
                    <div className="p-4 rounded shadow-lg bg-dark text-light border border-secondary border-opacity-50">
                        <div className="text-center mb-5">
                            <h2 className="text-info fw-bold">Add Movie to Magic Stream</h2>
                            <p className="text-white-50 small">SMART CONTENT MANAGEMENT</p>
                        </div>

                        {message.text && <Alert variant={message.type} dismissible onClose={() => setMessage({ text: "", type: "" })}>{message.text}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-info small fw-bold">IMDb ID (Paste full URL)</Form.Label>
                                        <Form.Control
                                            name="imdb_id"
                                            value={formData.imdb_id}
                                            onChange={handleChange}
                                            required
                                            placeholder="https://www.imdb.com/title/..."
                                            className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none admin-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-info small fw-bold">Movie Title</Form.Label>
                                        <Form.Control name="title" value={formData.title} onChange={handleChange} required placeholder="Enter title" className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none admin-input" />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-info small fw-bold">Poster Path (Paste TMDB Image Link)</Form.Label>
                                <Form.Control
                                    name="poster_path"
                                    value={formData.poster_path}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://image.tmdb.org/t/p/..."
                                    className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none admin-input"
                                />
                                <Form.Text className="text-white-50 small fst-italic">
                                    Autofix: Links will be converted to Full TMDB URL.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="text-info small fw-bold">YouTube Trailer Link</Form.Label>
                                <Form.Control
                                    name="youtube_id"
                                    value={formData.youtube_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none admin-input"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-info small fw-bold mb-3 d-block">Select Movie Genres</Form.Label>
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
                                <Form.Label className="text-info small fw-bold">Admin Initial Review</Form.Label>
                                <Form.Control as="textarea" rows={4} name="admin_review" value={formData.admin_review} onChange={handleChange} required className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none admin-input" style={{ resize: "none" }} placeholder="A brief analysis..." />
                            </Form.Group>

                            <div className="d-grid mt-4">
                                <Button variant="info" size="lg" type="submit" disabled={loading} className="fw-bold text-white shadow">
                                    {loading ? 'Submitting to Database...' : 'Register Movie'}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AddMovie;