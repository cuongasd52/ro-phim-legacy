import Movie from '../movie/Movie';

const Movies = ({ movies, updateMovieReview, handleEditMovie, handleDeleteMovie, message }) => {
    return (
        <div className="container mt-4">
            <h3 className="mb-4 text-light border-bottom pb-2">Discover Movies</h3>

            <div className="row">
                {Array.isArray(movies) && movies.length > 0 ? (
                    movies.map((movie) => (
                        <Movie
                            key={movie.imdb_id || movie._id}
                            updateMovieReview={updateMovieReview}
                            handleEditMovie={handleEditMovie}
                            handleDeleteMovie={handleDeleteMovie}
                            movie={movie}
                        />
                    ))
                ) : (
                    <div className="col-12 text-center mt-5">
                        <div className="alert alert-info bg-dark text-info border-info shadow">
                            {message || "No movies found."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;