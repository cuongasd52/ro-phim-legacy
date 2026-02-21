import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useAuth from '../../hooks/useAuth';
import Spinner from '../spinner/Spinner';

const Review = () => {
    const { imdb_id } = useParams();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const [movie, setMovie] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // 1. LẤY DỮ LIỆU PHIM (Chỉ chạy khi imdb_id thay đổi)
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchMovie = async () => {
            setLoading(true);
            setMessage({ text: "", type: "" });
            try {
                const response = await axiosPrivate.get(`/movie/${imdb_id}`, {
                    signal: controller.signal
                });

                if (isMounted) {
                    setMovie(response.data);
                    setReviewText(response.data?.admin_review || "");
                }
            } catch (error) {
                if (isMounted && error.name !== 'CanceledError') {
                    console.error('Fetch error:', error);
                    const errorMsg = error.response?.data?.error || "Error fetching movie data. Please check your connection.";
                    setMessage({ text: errorMsg, type: "danger" });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (imdb_id) {
            fetchMovie();
        }

        return () => {
            isMounted = false;
            controller.abort();
        };
        // Dependency array chỉ chứa imdb_id để tránh vòng lặp vô tận
    }, [imdb_id]);


    // 2. GỬI REVIEW VÀ CẬP NHẬT RANKING
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const response = await axiosPrivate.patch(`/updatereview/${imdb_id}`, {
                admin_review: reviewText
            });

            // Cập nhật state để thấy thay đổi ranking ngay lập tức trên UI
            setMovie(prev => ({
                ...prev,
                admin_review: response.data?.admin_review,
                ranking: { ranking_name: response.data?.ranking_name }
            }));

            setMessage({ text: "Review updated successfully!", type: "success" });
        } catch (err) {
            console.error("Lỗi khi submit:", err);
            const errorMsg = err.response?.data?.error || "Failed to update review";
            setMessage({ text: errorMsg, type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !movie) return <Spinner />;

    return (
        <Container className="py-5">
            <h2 className="text-center mb-5 text-light fw-bold">Admin Review & AI Ranking</h2>

            {message.text && (
                <Alert
                    variant={message.type}
                    onClose={() => setMessage({ text: "", type: "" })}
                    dismissible
                    className="shadow-sm border-0"
                >
                    {message.text}
                </Alert>
            )}

            {/* Sử dụng align-items-stretch để hai cột cao bằng nhau */}
            <div className="row g-4 justify-content-center align-items-stretch">

                {/* CỘT TRÁI: Poster và thông tin phim */}
                <div className="col-12 col-lg-5 d-flex justify-content-center">
                    <div className="w-100 shadow-lg rounded overflow-hidden border border-secondary bg-dark" style={{ maxWidth: '400px' }}>
                        {movie ? (
                            <div className="card h-100 bg-dark text-light border-0">
                                <div style={{ position: "relative" }}>
                                    <img
                                        src={movie.poster_path || 'https://via.placeholder.com/500x750?text=No+Poster'}
                                        alt={movie.title}
                                        className="card-img-top"
                                        style={{ objectFit: "cover", height: "450px" }}
                                    />
                                </div>
                                <div className="card-body d-flex flex-column text-center">
                                    <h4 className="card-title fw-bold text-info">{movie.title}</h4>
                                    <p className="card-text text-white-50 small mb-3">IMDb: {movie.imdb_id}</p>

                                    {movie.ranking?.ranking_name && (
                                        <div className="badge bg-secondary w-100 p-2 fs-6">
                                            AI Ranking: {movie.ranking.ranking_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-5 text-center text-muted">No movie data</div>
                        )}
                    </div>
                </div>

                {/* CỘT PHẢI: Khung nhập Review (Đã chỉnh cân đối nút bấm) */}
                <div className="col-12 col-lg-7">
                    <div className="h-100 shadow-lg rounded p-4 bg-dark text-light border border-secondary border-opacity-50 d-flex flex-column">
                        <h4 className="mb-4 text-info border-bottom border-secondary pb-2">Analysis Panel</h4>

                        {auth?.role === "ADMIN" ? (
                            <Form onSubmit={handleSubmit} className="d-flex flex-column h-100">
                                <Form.Group className="mb-3 flex-grow-1">
                                    <Form.Label className="text-white-50 small text-uppercase fw-bold">Detailed Review</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10} // Giảm từ 12 xuống 10 để nhường chỗ cho nút bấm
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        placeholder="Write professional analysis here..."
                                        className="bg-secondary bg-opacity-25 text-white border-secondary shadow-none p-3"
                                        style={{ resize: "none", border: '1px solid #444' }}
                                    />
                                </Form.Group>

                                {/* mt-4 giúp đẩy nút xuống ngang tầm với mép dưới card bên trái */}
                                <div className="d-grid mt-4">
                                    <Button variant="info" size="lg" type="submit" disabled={loading} className="fw-bold text-white shadow">
                                        {loading ? 'Processing...' : 'Submit & Re-rank Movie'}
                                    </Button>
                                </div>
                            </Form>
                        ) : (
                            <div className="p-4 bg-secondary bg-opacity-10 rounded text-light border border-secondary" style={{ whiteSpace: 'pre-wrap', minHeight: '300px' }}>
                                {movie?.admin_review || "Waiting for admin review..."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default Review;