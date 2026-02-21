package com.rophim.legacy.controller;

import com.rophim.legacy.models.Movie;
import com.rophim.legacy.service.MovieService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/movies")
    public ResponseEntity<List<Movie>> getMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/movie/{imdbId}")
    public ResponseEntity<Movie> getMovie(@PathVariable String imdbId) {
        return ResponseEntity.ok(movieService.getMovieByImdbId(imdbId));
    }

    @PostMapping("/addmovie")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Movie> addMovie(@RequestBody @Valid Movie movie) {
        return ResponseEntity.ok(movieService.addMovie(movie));
    }

    @PatchMapping("/editmovie/{imdbId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Movie> patchMovie(
            @PathVariable String imdbId,
            @RequestBody Map<String, Object> updates) {
        log.warn("Admin is patching movie {}. Fields updated: {}", imdbId, updates.keySet());

        return ResponseEntity.ok(movieService.patchMovie(imdbId, updates));
    }

    @DeleteMapping("/deletemovie/{imdbId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMovie(@PathVariable String imdbId) {
        movieService.deleteMovieByImdbId(imdbId);
        return ResponseEntity.ok(Map.of("message", "Movie deleted successfully"));
    }

    @GetMapping("/recommendedmovies")
    public ResponseEntity<List<Movie>> getRecommendedMovies(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String userId = principal.getName();
        return ResponseEntity.ok(movieService.getRecommendedMovies(userId, 5));
    }

    @PatchMapping("/updatereview/{imdbId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateReview(
            @PathVariable String imdbId,
            @RequestBody Map<String, String> request,
            java.security.Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String adminReview = request.get("admin_review");
        if (adminReview == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Admin review is required"));
        }

        String userId = principal.getName();
        Movie updatedMovie = movieService.updateReview(imdbId, adminReview, userId);

        return ResponseEntity.ok(Map.of(
                "ranking_name", updatedMovie.getRanking().getRankingName(),
                "admin_review", updatedMovie.getAdminReview()));
    }
}