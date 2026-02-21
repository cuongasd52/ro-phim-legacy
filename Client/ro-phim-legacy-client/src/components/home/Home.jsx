import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'; // Sử dụng hook chuẩn của bạn
import useAuth from '../../hooks/useAuth';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';

const Home = ({ updateMovieReview }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();
    const navigate = useNavigate();

    // 1. LẤY DANH SÁCH PHIM TỪ DATABASE
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchMovies = async () => {
            setLoading(true);
            setMessage("");
            try {
                const response = await axiosPrivate.get('/movies', {
                    signal: controller.signal
                });

                if (isMounted) {
                    setMovies(response.data);
                    if (response.data.length === 0) {
                        setMessage('There are currently no movies available.');
                    }
                }
            } catch (error) {
                if (isMounted && error.name !== 'CanceledError') {
                    console.error('Error fetching movies:', error);
                    const errorMsg = error.response?.data?.error || "Unable to load movies. Please try again later.";
                    setMessage(errorMsg);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMovies();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [axiosPrivate]);

    // 2. LOGIC XÓA PHIM (CHỈ DÀNH CHO ADMIN)
    const handleDeleteMovie = async (imdb_id, title) => {
        if (window.confirm(`SECURITY ALERT: Are you sure you want to permanently delete "${title}"?`)) {
            try {
                // Gọi API xóa phim ở Backend
                await axiosPrivate.delete(`/deletemovie/${imdb_id}`);

                // Cập nhật state cục bộ để phim biến mất ngay trên UI mà không cần reload
                setMovies(prevMovies => prevMovies.filter(movie => movie.imdb_id !== imdb_id));

                alert(`Successfully deleted: ${title}`);
            } catch (error) {
                console.error("Delete error:", error);
                alert("Failed to delete movie. Check your admin permissions.");
            }
        }
    };

    // 3. ĐIỀU HƯỚNG SANG TRANG EDIT
    const handleEditMovie = (imdb_id) => {
        navigate(`/admin/edit-movie/${imdb_id}`);
    };

    return (
        <div className="home-container">
            {loading ? (
                <Spinner />
            ) : (
                <Movies
                    movies={movies}
                    updateMovieReview={updateMovieReview}
                    handleEditMovie={handleEditMovie}   // Truyền xuống để hiện nút Edit
                    handleDeleteMovie={handleDeleteMovie} // Truyền xuống để hiện nút Delete
                    message={message}
                />
            )}
        </div>
    );
};

export default Home;