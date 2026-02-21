import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useEffect, useState } from 'react';
import Movies from '../movies/Movies';
import Spinner from '../spinner/Spinner';

const Recommended = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchRecommendedMovies = async () => {
            setLoading(true);
            setMessage("");
            try {
                const response = await axiosPrivate.get('/recommendedmovies', {
                    signal: controller.signal
                });
                if (isMounted) setMovies(response.data);
            } catch (error) {
                if (isMounted && error.name !== 'CanceledError') {
                    const errorMsg = error.response?.data?.error || "Could not load recommendations.";
                    setMessage(errorMsg);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchRecommendedMovies();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [axiosPrivate]);

    // PHẦN CÒN THIẾU CỦA BẠN:
    return (
        <>
            {loading ? (
                <Spinner />
            ) : (
                <Movies movies={movies} message={message} />
            )}
        </>
    );
};

export default Recommended;