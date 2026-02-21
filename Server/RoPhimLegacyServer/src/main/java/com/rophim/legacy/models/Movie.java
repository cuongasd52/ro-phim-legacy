package com.rophim.legacy.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "movies")
public class Movie {
    @Id
    private String id;

    @Field("imdb_id")
    @NotNull(message = "IMDB ID is required")
    @JsonProperty("imdb_id")
    private String imdbId;

    @Field("title")
    @NotNull(message = "Title is required")
    @Size(min = 2, max = 500)
    @JsonProperty("title")
    private String title;

    @Field("poster_path")
    @NotNull(message = "Poster path is required")
    @JsonProperty("poster_path")
    private String posterPath;

    @Field("youtube_id")
    @NotNull(message = "Youtube ID is required")
    @JsonProperty("youtube_id")
    private String youtubeId;

    @Field("genre")
    @JsonProperty("genre")
    @Indexed
    private List<Genre> genre;

    @Field("admin_review")
    @JsonProperty("admin_review")
    private String adminReview;

    @Field("ranking")
    @JsonProperty("ranking")
    private Ranking ranking;
}
