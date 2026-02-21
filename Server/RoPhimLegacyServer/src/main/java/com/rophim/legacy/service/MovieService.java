package com.rophim.legacy.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rophim.legacy.exception.AppSecurityException;
import com.rophim.legacy.exception.ResourceNotFoundException;
import com.rophim.legacy.models.Genre;
import com.rophim.legacy.models.Movie;
import com.rophim.legacy.models.Ranking;
import com.rophim.legacy.models.User;
import com.rophim.legacy.repository.MovieRepository;
import com.rophim.legacy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieService {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper; // Dùng để ép kiểu dữ liệu JSON an toàn

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieByImdbId(String imdbId) {
        return movieRepository.findByImdbId(imdbId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + imdbId));
    }

    public Movie addMovie(Movie movie) {
        if (movie.getAdminReview() != null && !movie.getAdminReview().trim().isEmpty()) {
            applyAiRanking(movie, movie.getAdminReview());
        }
        return movieRepository.save(movie);
    }

    // --- HÀM PATCH: CẬP NHẬT TỪNG PHẦN (PARTIAL UPDATE) ---
    public Movie patchMovie(String imdbId, Map<String, Object> updates) {
        Movie existingMovie = getMovieByImdbId(imdbId);
        log.info("Admin is patching movie: {}", existingMovie.getTitle());

        if (updates.containsKey("title")) {
            existingMovie.setTitle((String) updates.get("title"));
        }

        if (updates.containsKey("poster_path")) {
            existingMovie.setPosterPath((String) updates.get("poster_path"));
        }

        if (updates.containsKey("youtube_id")) {
            existingMovie.setYoutubeId((String) updates.get("youtube_id"));
        }

        // Xử lý danh sách thể loại một cách an toàn
        if (updates.containsKey("genre")) {
            List<Genre> genreList = objectMapper.convertValue(
                    updates.get("genre"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Genre.class));
            existingMovie.setGenre(genreList);
        }

        // Nếu sửa Review, hệ thống tự động chạy lại AI Ranking
        if (updates.containsKey("admin_review")) {
            String newReview = (String) updates.get("admin_review");
            existingMovie.setAdminReview(newReview);
            applyAiRanking(existingMovie, newReview);
        }

        return movieRepository.save(existingMovie);
    }

    public void deleteMovieByImdbId(String imdbId) {
        Movie movie = getMovieByImdbId(imdbId);
        log.warn("SECURITY ALERT: Movie '{}' is being deleted by Admin!", movie.getTitle());
        movieRepository.deleteMovieByImdbId(imdbId);
    }

    public Movie updateReview(String imdbId, String adminReview, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!"ADMIN".equals(admin.getRole())) {
            log.error("SECURITY ALERT: Unauthorized access by {}", adminEmail);
            throw new AppSecurityException("Access Denied: You are not an admin");
        }

        Movie movie = getMovieByImdbId(imdbId);
        applyAiRanking(movie, adminReview);
        movie.setAdminReview(adminReview);

        return movieRepository.save(movie);
    }

    private void applyAiRanking(Movie movie, String review) {
        try {
            Ranking ranking = aiService.analyzeReview(review);
            if (ranking != null) {
                movie.setRanking(ranking);
            }
        } catch (Exception e) {
            log.error("AI Analysis failed for movie: {}", movie.getTitle(), e);
        }
    }

    public List<Movie> getRecommendedMovies(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getFavouriteGenres() == null || user.getFavouriteGenres().isEmpty()) {
            return Collections.emptyList();
        }

        List<String> genreNames = user.getFavouriteGenres().stream()
                .map(Genre::getGenreName)
                .collect(Collectors.toList());

        return movieRepository.findByGenreGenreNameIn(genreNames).stream()
                .sorted((m1, m2) -> {
                    int r1 = (m1.getRanking() != null) ? m1.getRanking().getRankingValue() : 999;
                    int r2 = (m2.getRanking() != null) ? m2.getRanking().getRankingValue() : 999;
                    return Integer.compare(r1, r2);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
}