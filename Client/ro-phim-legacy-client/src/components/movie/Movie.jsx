import { Button, Card, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Movie.css';

const Movie = ({ movie, updateMovieReview, handleEditMovie, handleDeleteMovie }) => {
    const navigate = useNavigate();
    const { auth } = useAuth(); // Lấy thông tin role từ AuthContext

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <Card className="h-100 bg-dark text-light border-secondary shadow-sm movie-card">
                <div className="poster-container" style={{ position: 'relative', cursor: 'pointer' }}>
                    {/* 🚀 KIỂM TRA ROLE: Hiện Dropdown Menu nếu là ADMIN */}
                    {auth?.role === 'ADMIN' && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="dark" size="sm" className="bg-dark bg-opacity-75 border-secondary rounded-circle px-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                    <span style={{ fontSize: '1.2rem', lineHeight: '0' }}>&#8942;</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu variant="dark" className="shadow-lg border-secondary">
                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); handleEditMovie(movie.imdb_id); }}>Edit Movie</Dropdown.Item>
                                    <Dropdown.Divider className="border-secondary" />
                                    <Dropdown.Item className="text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteMovie(movie.imdb_id, movie.title); }}>Delete Movie</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    )}
                    <Card.Img
                        variant="top"
                        src={movie.poster_path || 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.title}
                        style={{ height: '400px', objectFit: 'cover' }}
                        onClick={() => navigate(`/stream/${movie.youtube_id}`)}
                    />
                </div>

                <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-truncate" title={movie.title}>{movie.title}</Card.Title>
                    <Card.Text className="text-muted small mb-2">IMDb: {movie.imdb_id}</Card.Text>

                    <div className="mt-auto d-flex flex-column gap-2">
                        {movie.ranking?.ranking_name && (
                            <div className="badge bg-secondary w-100 p-2 mb-1">
                                {movie.ranking.ranking_name}
                            </div>
                        )}
                        <Button variant="outline-info" size="sm" onClick={() => updateMovieReview(movie.imdb_id)}>Review</Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Movie;