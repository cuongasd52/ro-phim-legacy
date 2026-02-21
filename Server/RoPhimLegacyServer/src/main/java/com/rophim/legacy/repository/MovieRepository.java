package com.rophim.legacy.repository;

import com.rophim.legacy.models.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {

    Optional<Movie> findByImdbId(String imdbId);

    @Query("{ 'genre.genre_name': { $in: ?0 } }")
    List<Movie> findByGenreGenreNameIn(List<String> genreNames);

    void deleteMovieByImdbId(String imdbId); // Xóa phim
}