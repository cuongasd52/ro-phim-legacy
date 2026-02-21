package com.rophim.legacy.service;

import com.rophim.legacy.models.Genre;
import com.rophim.legacy.models.Movie;
import com.rophim.legacy.models.Ranking;
import com.rophim.legacy.models.User;
import com.rophim.legacy.repository.MovieRepository;
import com.rophim.legacy.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private AIService aiService;

    @InjectMocks
    private MovieService movieService;
    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @SuppressWarnings("null")
    public void testAddMovie_WithAIAnalysis() {
        // Chuẩn bị dữ liệu
        Movie movie = new Movie();
        movie.setImdbId("tt123");
        movie.setAdminReview("This movie is great!");

        Ranking mockRanking = new Ranking();
        mockRanking.setRankingValue(1);
        mockRanking.setRankingName("Excellent");

        when(aiService.analyzeReview(anyString())).thenReturn(mockRanking);
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);

        Movie result = movieService.addMovie(movie);

        verify(aiService, times(1)).analyzeReview("This movie is great!");
        assertNotNull(result.getRanking());
        assertEquals("Excellent", result.getRanking().getRankingName());
    }

    @Test
    public void testUpdateReview_AccessDenied_ForNonAdmin() {
        User normalUser = new User();
        normalUser.setRole("USER");

        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(normalUser));

        assertThrows(RuntimeException.class, () -> {
            movieService.updateReview("tt123", "Nice movie", "user@gmail.com");
        });
    }

    @Test
    public void testGetRecommendedMovies_LogDiagnostic() {

        User user = new User();
        user.setEmail("bobjones@hotmail.com");

        user.setFavouriteGenres(List.of(new Genre(null, 1, "Comedy")));

        when(userRepository.findByEmail("bobjones@hotmail.com")).thenReturn(Optional.of(user));

        System.out.println("DEBUG - Genre Names tìm thấy: " + user.getFavouriteGenres());
    }
}